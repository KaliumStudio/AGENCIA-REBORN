"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { chatService } from '@/services/chat.service';
import { batchService } from '@/services/batch.service';
import { Message, Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Send, ArrowLeft, Loader2, Info, FileText, Download, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminChatPage() {
  const { id } = useParams();
  const { profile, loading: authLoading } = useAuth();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id && profile) {
      batchService.getBatch(id as string).then(async (b) => {
        if (b) {
          setBatch(b);
          try {
            const cid = await chatService.getOrCreateChat(
              b.id, 
              b.clientId, 
              b.clientUserUid, 
              b.assignedEditorUids, 
              profile.uid
            );
            setChatId(cid);
          } catch (err) { 
            console.error("Error al inicializar chat:", err); 
          }
        }
        setLoadingChat(false);
      });
    }
  }, [id, profile]);

  useEffect(() => {
    if (chatId && profile) {
      const unsubscribe = chatService.subscribeToMessages(chatId, profile.uid, profile.role, setMessages);
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
    if (!newMessage.trim() || !chatId || !profile) return;
    const text = newMessage;
    setNewMessage('');

    await chatService.sendMessage(chatId, profile.uid, profile.role, 'text', text);
    chatService.markAsRead(chatId, profile.uid);
  };

  if (authLoading || loadingChat) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60dvh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Cargando supervisión de chat...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!batch || !chatId) return <DashboardLayout><div className="p-8 text-center bg-white rounded-xl border border-dashed font-bold">Error de conexión</div></DashboardLayout>;

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex flex-col lg:flex-row h-[calc(100dvh-12rem)] gap-6 relative">
          <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/admin/batches"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm md:text-base line-clamp-1">{batch.title}</h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-primary" /> Modo Administrador (Visibilidad Total)
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-slate-50/50">
              <div className="space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex flex-col", m.senderUid === profile?.uid ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {m.senderUid === profile?.uid ? "Tú" : (
                          m.senderRole === 'editor' ? (
                            <span className="text-primary">{m.senderName} ({m.senderAlias})</span>
                          ) : m.senderAlias
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {m.createdAt?.toDate ? format(m.createdAt.toDate(), 'HH:mm') : '...'}
                      </span>
                    </div>
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm overflow-hidden",
                      m.senderUid === profile?.uid ? "bg-primary text-white rounded-tr-none" : "bg-white text-slate-800 border rounded-tl-none",
                      m.type === 'drive_link' && "bg-green-600 text-white",
                      m.type === 'revision_request' && "bg-amber-100 text-amber-900 border-amber-200"
                    )}>
                      {m.type === 'image' && m.fileUrl && (
                        <div className="mb-2">
                          <img src={m.fileUrl} alt={m.fileName} className="max-w-full rounded-lg h-auto cursor-pointer" onClick={() => window.open(m.fileUrl, '_blank')} />
                        </div>
                      )}
                      {m.type === 'file' && m.fileUrl && (
                        <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-black/5 rounded mb-1">
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

            <div className="p-3 md:p-4 bg-white border-t flex flex-col gap-2">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input 
                  placeholder="Escribir como administrador..." 
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)}
                  className="rounded-full px-6 h-11 bg-slate-100 border-none focus-visible:ring-primary"
                />
                <Button type="submit" size="icon" className="rounded-full shrink-0 h-11 w-11 shadow-md">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>

          <div className="hidden lg:flex w-72 flex-col gap-4">
            <Card className="shadow-sm">
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" /> Información
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs leading-relaxed space-y-4">
                <div>
                  <p className="font-bold text-slate-500 uppercase mb-1">Producto</p>
                  <p className="text-sm">{batch.productName}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500 uppercase mb-1">Estado</p>
                  <p className="capitalize">{batch.status}</p>
                </div>
                <div className="pt-2 border-t text-[10px] text-muted-foreground italic">
                  Como administrador, puedes ver los nombres reales de los editores que participan en este chat. El cliente solo ve sus seudónimos (ej: Editor #A1B2).
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
