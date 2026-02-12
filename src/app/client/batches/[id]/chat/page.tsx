"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { chatService } from '@/services/chat.service';
import { batchService } from '@/services/batch.service';
import { analyzeClientFeedback } from '@/ai/flows/ai-client-feedback-analysis';
import { Message, Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Send, ArrowLeft, RefreshCw, Sparkles, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ClientChatPage() {
  const { id } = useParams();
  const { profile, loading: authLoading } = useAuth();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(true);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id && profile) {
      batchService.getBatch(id as string).then(async (b) => {
        if (b) {
          setBatch(b);
          try {
            const cid = await chatService.getOrCreateChat(b.id, b.clientId, b.assignedEditorUids, profile.uid);
            setChatId(cid);
          } catch (err) {
            console.error("Chat init error:", err);
          }
        }
        setLoadingChat(false);
      });
    }
  }, [id, profile]);

  useEffect(() => {
    if (chatId && profile) {
      const unsubscribe = chatService.subscribeToMessages(chatId, profile.uid, setMessages);
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
    if (!newMessage.trim() || !chatId || !profile) return;
    
    const text = newMessage;
    setNewMessage('');
    chatService.sendMessage(chatId, profile.uid, profile.role, 'text', text);
  };

  const requestRevision = async () => {
    if (!chatId || !profile || !batch) return;
    chatService.sendMessage(chatId, profile.uid, profile.role, 'revision_request', 'Solicito una revisión para esta tanda.');
    batchService.updateBatchStatus(batch.id, 'revisions');
  };

  const approveBatch = async () => {
    if (!chatId || !profile || !batch) return;
    chatService.sendMessage(chatId, profile.uid, profile.role, 'system', 'La tanda ha sido APROBADA por el cliente.');
    batchService.updateBatchStatus(batch.id, 'approved');
  };

  const analyzeFeedback = async () => {
    if (messages.length === 0) return;
    setAnalyzing(true);
    try {
      const chatInput = messages.map(m => ({ senderAlias: m.senderAlias, text: m.text }));
      const result = await analyzeClientFeedback({ messages: chatInput });
      setAnalysis(result.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (authLoading || loadingChat) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Conectando con el equipo...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!batch || !chatId) return (
    <DashboardLayout>
      <div className="p-8 text-center bg-white rounded-xl border border-dashed">
        <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
        <p className="text-muted-foreground">No se pudo cargar el chat. Por favor reintenta.</p>
      </div>
    </DashboardLayout>
  );

  return (
    <RoleGuard allowedRoles={['client']}>
      <DashboardLayout>
        <div className="flex h-[calc(100vh-10rem)] gap-6">
          <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/client/batches/${batch.id}`}><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                  <h3 className="font-bold text-lg">{batch.title}</h3>
                  <p className="text-xs text-muted-foreground">Comunicación directa con el equipo</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={requestRevision} disabled={batch.status === 'revisions'}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Solicitar Cambios
                </Button>
                <Button size="sm" onClick={approveBatch} disabled={batch.status === 'approved'}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Aprobar Tanda
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex flex-col", m.senderUid === profile?.uid ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold">{m.senderAlias}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {m.createdAt?.toDate ? format(m.createdAt.toDate(), 'HH:mm') : '...'}
                      </span>
                    </div>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl max-w-[80%] text-sm",
                      m.senderUid === profile?.uid 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-muted text-foreground rounded-tl-none",
                      m.type === 'revision_request' && "bg-destructive text-white border-2 border-destructive/20",
                      m.type === 'system' && "bg-amber-100 text-amber-900 border border-amber-200 text-center mx-auto rounded-lg font-medium italic"
                    )}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
              <Input 
                placeholder="Escribe un mensaje..." 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)}
                className="rounded-full px-6"
              />
              <Button type="submit" size="icon" className="rounded-full shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="w-80 flex flex-col gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Resumen de Cambios
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={analyzeFeedback} disabled={analyzing}>
                   <RefreshCw className={cn("h-3 w-3", analyzing && "animate-spin")} />
                </Button>
              </CardHeader>
              <CardContent>
                {analysis ? (
                  <p className="text-xs leading-relaxed text-muted-foreground italic">"{analysis}"</p>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground mb-3">Analiza el chat para consolidar tus peticiones.</p>
                    <Button variant="secondary" size="sm" onClick={analyzeFeedback} disabled={analyzing}>
                      {analyzing ? "Analizando..." : "Analizar con IA"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-bold">Ayuda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 text-xs">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p>Los nombres de los editores son anónimos.</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <p>Una vez aprobada la tanda, el estado cambiará definitivamente.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}