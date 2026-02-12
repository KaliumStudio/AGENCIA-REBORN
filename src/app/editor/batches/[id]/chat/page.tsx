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
import { Send, ArrowLeft, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function EditorChatPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id && profile) {
      batchService.getBatch(id as string).then(async (b) => {
        setBatch(b);
        if (b) {
          const cid = await chatService.getOrCreateChat(b.id, b.clientId, b.assignedEditorUids);
          setChatId(cid);
        }
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
    await chatService.sendMessage(chatId, profile.uid, profile.role, 'text', newMessage);
    setNewMessage('');
  };

  if (!batch) return null;

  return (
    <RoleGuard allowedRoles={['editor']}>
      <DashboardLayout>
        <div className="flex h-[calc(100vh-10rem)] gap-6">
          <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/editor/batches/${batch.id}`}><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                  <h3 className="font-bold text-lg">{batch.title}</h3>
                  <p className="text-xs text-muted-foreground">Chat con el Cliente (Modo Anónimo Activo)</p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6 bg-[#f8faff]">
              <div className="space-y-6">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex flex-col", m.senderUid === profile?.uid ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">
                        {m.senderUid === profile?.uid ? "Tú" : m.senderAlias}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {m.createdAt ? format(m.createdAt.toDate(), 'HH:mm') : '...'}
                      </span>
                    </div>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm",
                      m.senderUid === profile?.uid 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white text-foreground border rounded-tl-none",
                      m.type === 'drive_link' && "bg-green-50 text-green-900 border-green-200",
                      m.type === 'revision_request' && "bg-destructive text-white border-none",
                      m.type === 'system' && "bg-amber-50 text-amber-900 border border-amber-200 text-center mx-auto rounded-lg font-medium italic"
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
                className="rounded-full px-6 bg-muted/30 border-none focus-visible:ring-1"
              />
              <Button type="submit" size="icon" className="rounded-full shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="w-80 flex flex-col gap-4">
             <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-900">
                    <Info className="h-4 w-4" /> Recordatorio de Privacidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-amber-800 space-y-2">
                  <p>Tu nombre real no es visible para el cliente. Se muestra tu alias asignado.</p>
                  <p>Evita compartir links personales o información que pueda identificarte.</p>
                </CardContent>
             </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

import { cn } from '@/lib/utils';