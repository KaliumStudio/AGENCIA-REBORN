"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { chatService } from '@/services/chat.service';
import { batchService } from '@/services/batch.service';
import { storageService } from '@/services/storage.service';
import { analyzeClientFeedback } from '@/ai/flows/ai-client-feedback-analysis';
import { Message, Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Send, ArrowLeft, RefreshCw, Sparkles, CheckCircle2, Loader2, Menu, Paperclip, ImageIcon, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ClientChatPage() {
  const { id } = useParams();
  const { profile, loading: authLoading } = useAuth();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id && profile) {
      batchService.getBatch(id as string).then(async (b) => {
        if (b) {
          setBatch(b);
          try {
            const cid = await chatService.getOrCreateChat(b.id, b.clientId, b.clientUserUid || profile.uid, b.assignedEditorUids, profile.uid);
            setChatId(cid);
          } catch (err) { console.error("Chat init error:", err); }
        }
        setLoadingChat(false);
      });
    }
  }, [id, profile]);

  useEffect(() => {
    if (chatId && profile) {
      const unsubscribe = chatService.subscribeToMessages(chatId, profile.uid, profile.role, profile.clientId, setMessages);
      chatService.markAsRead(chatId, profile.uid);
      return () => unsubscribe();
    }
  }, [chatId, profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !chatId || !profile || !batch) return;
    const text = newMessage;
    setNewMessage('');
    
    const members = Array.from(new Set([
      batch.clientUserUid,
      ...(batch.assignedEditorUids || []),
      profile.uid
    ])).filter(Boolean);

    chatService.sendMessage(chatId, profile.uid, profile.role, 'text', text, members);
    chatService.markAsRead(chatId, profile.uid);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId || !profile || !batch) return;

    const isImage = file.type.startsWith('image/');
    setUploading(true);

    try {
      const uploadResult = await storageService.uploadFile(file, `chats/${chatId}`);
      
      const members = Array.from(new Set([
        batch.clientUserUid,
        ...(batch.assignedEditorUids || []),
        profile.uid
      ])).filter(Boolean);

      await chatService.sendMessage(
        chatId, 
        profile.uid, 
        profile.role, 
        isImage ? 'image' : 'file', 
        isImage ? 'Ha enviado una imagen' : `Archivo: ${file.name}`,
        members,
        {
          url: uploadResult.url,
          name: uploadResult.name,
          size: uploadResult.size
        }
      );
      
      toast({ title: "Archivo enviado" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error al subir archivo", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const analyzeFeedback = async () => {
    if (messages.length === 0) return;
    setAnalyzing(true);
    try {
      const chatInput = messages.map(m => ({ senderAlias: m.senderAlias, text: m.text }));
      const result = await analyzeClientFeedback({ messages: chatInput });
      setAnalysis(result.summary);
    } catch (err) { console.error(err); } finally { setAnalyzing(false); }
  };

  if (authLoading || loadingChat) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60dvh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Conectando con el equipo...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!batch || !chatId) return <DashboardLayout><div className="p-8 text-center bg-white rounded-xl border border-dashed text-destructive font-bold">Error al cargar chat</div></DashboardLayout>;

  return (
    <RoleGuard allowedRoles={['client']}>
      <DashboardLayout>
        <div className="flex flex-col lg:flex-row h-[calc(100dvh-12rem)] gap-6 relative">
          <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="hidden lg:flex">
                  <Link href={`/client/batches/${batch.id}`}><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                  <h3 className="font-bold text-sm md:text-base line-clamp-1">{batch.title}</h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Chat directo</p>
                </div>
              </div>
              <div className="flex gap-1 md:gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden"><Menu className="h-4 w-4" /></Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px] pt-12">
                    <SheetHeader>
                      <SheetTitle>Herramientas de Chat</SheetTitle>
                      <SheetDescription>Acciones rápidas para esta tanda.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-8 space-y-4">
                      <Button variant="outline" className="w-full justify-start h-12" onClick={analyzeFeedback} disabled={analyzing}>
                        <Sparkles className="mr-2 h-4 w-4" /> {analyzing ? "Analizando..." : "Análisis IA"}
                      </Button>
                      <Button variant="default" className="w-full justify-start h-12" onClick={() => batchService.updateBatchStatus(batch.id, 'approved')}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Aprobar Tanda
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button size="sm" onClick={() => batchService.updateBatchStatus(batch.id, 'approved')} className="hidden lg:flex">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Aprobar
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 md:p-6 bg-slate-50/50">
              <div className="space-y-6">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex flex-col", m.senderUid === profile?.uid ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold">{m.senderUid === profile?.uid ? "Tú" : m.senderAlias}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {m.createdAt?.toDate ? format(m.createdAt.toDate(), 'HH:mm') : '...'}
                      </span>
                    </div>
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm overflow-hidden",
                      m.senderUid === profile?.uid ? "bg-primary text-white rounded-tr-none" : "bg-white text-foreground border rounded-tl-none",
                      m.type === 'revision_request' && "bg-destructive text-white",
                      m.type === 'system' && "bg-amber-100 text-amber-900 border border-amber-200 text-center mx-auto rounded-lg font-medium"
                    )}>
                      {m.type === 'image' && m.fileUrl && (
                        <div className="mb-2">
                          <img src={m.fileUrl} alt={m.fileName} className="max-w-full rounded-lg h-auto cursor-pointer hover:opacity-90" onClick={() => window.open(m.fileUrl, '_blank')} />
                        </div>
                      )}
                      {m.type === 'file' && m.fileUrl && (
                        <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-black/5 rounded hover:bg-black/10 transition-colors mb-1">
                          <FileText className="h-4 w-4" />
                          <span className="underline truncate">{m.fileName}</span>
                          <Download className="h-3 w-3 ml-auto" />
                        </a>
                      )}
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-3 md:p-4 border-t bg-white flex flex-col gap-2">
              {uploading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Subiendo archivo...
                </div>
              )}
              <div className="flex gap-2 items-center">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full shrink-0 h-10 w-10"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <form onSubmit={handleSend} className="flex-1 flex gap-2">
                  <Input 
                    placeholder="Escribe un mensaje..." 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)}
                    className="rounded-full px-6 h-11 border-muted-foreground/20 focus-visible:ring-primary"
                  />
                  <Button type="submit" size="icon" className="rounded-full shrink-0 h-11 w-11 shadow-md">
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex w-80 flex-col gap-4">
            <Card className="shadow-sm">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Resumen de Cambios
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={analyzeFeedback} disabled={analyzing} className="h-8 w-8">
                   <RefreshCw className={cn("h-4 w-4", analyzing && "animate-spin")} />
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                {analysis ? (
                  <p className="text-xs leading-relaxed text-muted-foreground italic border-l-2 pl-3 border-primary/20">"{analysis}"</p>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-muted-foreground mb-4">Analiza el chat para consolidar tus peticiones automáticamente.</p>
                    <Button variant="secondary" size="sm" className="w-full" onClick={analyzeFeedback} disabled={analyzing}>
                      {analyzing ? "Analizando..." : "Analizar con IA"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
