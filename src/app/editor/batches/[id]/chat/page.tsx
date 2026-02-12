"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Send, ArrowLeft, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function EditorChatPage() {
  const { id } = useParams();
  const { profile, loading: authLoading } = useAuth();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id && profile) {
      batchService.getBatch(id as string).then(async (b) => {
        if (b) {
          setBatch(b);
          // CRITICAL FIX: Pass profile.uid as the 4th argument to identify the current member
          const cid = await chatService.getOrCreateChat(b.id, b.clientId, b.assignedEditorUids, profile.uid);
          setChatId(cid);
        }
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id, profile]);

  useEffect(() => {
    if (chatId) {
      const unsubscribe = chatService.subscribeToMessages(chatId, setMessages);
      return () => unsubscribe();
    }
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !chatId || !profile) return;
    
    const text = newMessage;
    setNewMessage(''); // Clear immediately for UI responsiveness
    
    await chatService.sendMessage(chatId, profile.uid, profile.role, 'text', text);
  };

  if (loading || authLoading) return <DashboardLayout>Cargando chat...</DashboardLayout>;
  if (!batch) return <DashboardLayout>Error: Tanda no encontrada.</DashboardLayout>;

  return (
    <RoleGuard allowedRoles={['editor']}>
      <DashboardLayout>
        <div className="flex h-[calc(100vh-12rem)] gap-6">
          <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/editor/batches/${batch.id}`}><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                  <h3 className="font-bold text-lg">{batch.title}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3 text-amber-500" />
                    Modo Anónimo Activo (El cliente no ve tu nombre real)
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
                        {m.senderUid === profile?.uid ? "Tú" : m.senderAlias}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {m.createdAt?.toDate ? format(m.createdAt.toDate(), 'HH:mm') : '...'}
                      </span>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-2xl max-w-[80%] text-sm shadow-sm",
                      m.senderUid === profile?.uid 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white text-slate-800 border rounded-tl-none",
                      m.type === 'drive_link' && "bg-green-600 text-white",
                      m.type === 'revision_request' && "bg-amber-100 text-amber-900 border-amber-200"
                    )}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
              <Input 
                placeholder="Escribe un mensaje al cliente..." 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)}
                className="rounded-full px-6 bg-slate-100 border-none focus-visible:ring-primary"
              />
              <Button type="submit" size="icon" className="rounded-full shrink-0 h-10 w-10">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="w-72 hidden xl:flex flex-col gap-4">
            <Card className="bg-amber-50 border-amber-100">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-bold text-amber-900">Privacidad</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-amber-800 leading-relaxed">
                Tu identidad está protegida. El cliente solo verá tu alias (ej: Editor #A1B2). 
                Por favor, evita compartir información personal en el chat.
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
