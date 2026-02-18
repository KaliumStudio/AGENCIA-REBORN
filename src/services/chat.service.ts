import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  query, where, serverTimestamp, onSnapshot, addDoc, Timestamp,
  limit, orderBy, getDocs
} from 'firebase/firestore';
import { Chat, Message, MessageType, UserRole } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const stripUndefined = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
  );
};

export const chatService = {
  async getOrCreateChat(batchId: string, clientId: string, clientUserUid: string, editorUids: string[] = [], currentUid?: string): Promise<string> {
    if (!batchId) throw new Error("Batch ID is required");

    const chatRef = doc(db, 'chats', batchId);
    const snap = await getDoc(chatRef);

    const allMembers = new Set<string>();
    if (clientUserUid) allMembers.add(clientUserUid);
    if (currentUid) allMembers.add(currentUid);
    editorUids.forEach(uid => {
      if (uid) allMembers.add(uid);
    });

    const memberUids = Array.from(allMembers).filter(Boolean);

    if (snap.exists()) {
      // Actualizar miembros si es necesario
      const data = snap.data() as Chat;
      const existingMembers = data.memberUids || [];
      const hasAllMembers = memberUids.every(m => existingMembers.includes(m));
      
      if (!hasAllMembers) {
        const updatedMembers = Array.from(new Set([...existingMembers, ...memberUids]));
        await updateDoc(chatRef, { memberUids: updatedMembers });
      }
      return snap.id;
    }

    const chatData = {
      batchId,
      clientId,
      clientUserUid,
      memberUids,
      editorAliases: {},
      lastMessageAt: serverTimestamp(),
      lastReadAtByUid: {}
    };

    await setDoc(chatRef, chatData);
    return batchId;
  },

  async markAsRead(chatId: string, uid: string) {
    if (!chatId || !uid) return;
    const chatRef = doc(db, 'chats', chatId);
    updateDoc(chatRef, {
      [`lastReadAtByUid.${uid}`]: serverTimestamp()
    }).catch(() => {});
  },

  async sendMessage(
    chatId: string, 
    senderUid: string, 
    role: UserRole, 
    type: MessageType, 
    text: string, 
    context?: { clientId?: string, memberUids?: string[] },
    fileData?: { url: string; name: string; size: number }
  ) {
    if (!chatId || !senderUid) return;

    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    
    let memberUids: string[] = context?.memberUids || [senderUid];
    let clientId: string | null = context?.clientId || null;
    let editorAliases: Record<string, string> = {};

    if (chatSnap.exists()) {
      const data = chatSnap.data() as Chat;
      memberUids = data.memberUids || memberUids;
      clientId = data.clientId || clientId;
      editorAliases = data.editorAliases || {};
    }

    // Asegurar que el remitente está en la lista
    if (!memberUids.includes(senderUid)) {
      memberUids.push(senderUid);
    }

    let senderAlias = 'Cliente';
    if (role === 'editor' || role === 'admin') {
      senderAlias = editorAliases[senderUid];
      if (!senderAlias) {
        const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
        senderAlias = `Editor #${randomHex}`;
        // Guardar el nuevo alias en el chat
        updateDoc(chatRef, {
          [`editorAliases.${senderUid}`]: senderAlias
        }).catch(() => {});
      }
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messageData = stripUndefined({
      chatId,
      senderUid,
      senderRole: role,
      senderAlias,
      type,
      text,
      fileUrl: fileData?.url,
      fileName: fileData?.name,
      fileSize: fileData?.size,
      createdAt: serverTimestamp(),
      memberUids, // Importante para las reglas de seguridad
      clientId
    });

    addDoc(messagesRef, messageData).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: messagesRef.path,
          operation: 'create',
          requestResourceData: messageData,
        })
      );
    });

    updateDoc(chatRef, { lastMessageAt: serverTimestamp() }).catch(() => {});
  },

  subscribeToMessages(chatId: string, currentUid: string, role: UserRole, callback: (messages: Message[]) => void) {
    if (!chatId || !currentUid) return () => {};
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    
    // Usamos memberUids para todos (excepto admin que ve todo)
    // Esto es más consistente con las reglas de seguridad
    let q;
    if (role === 'admin') {
      q = query(messagesRef, orderBy('createdAt', 'asc'));
    } else {
      q = query(
        messagesRef, 
        where('memberUids', 'array-contains', currentUid),
        orderBy('createdAt', 'asc')
      );
    }
    
    return onSnapshot(q, (snap) => {
      const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      callback(messages);
    }, (error) => {
      const contextualError = new FirestorePermissionError({
        operation: 'list',
        path: `chats/${chatId}/messages`,
      });
      errorEmitter.emit('permission-error', contextualError);
    });
  },

  async syncChatMembersManual(chatId: string, memberUids: string[]) {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, { memberUids: Array.from(new Set(memberUids)) });
  },

  async getUnreadCount(uid: string): Promise<number> {
    const q = query(collection(db, 'chats'), where('memberUids', 'array-contains', uid));
    const snap = await getDocs(q);
    let count = 0;
    snap.docs.forEach(doc => {
      const chat = doc.data() as Chat;
      const lastMessage = chat.lastMessageAt?.toMillis ? chat.lastMessageAt.toMillis() : 0;
      const lastRead = chat.lastReadAtByUid?.[uid]?.toMillis ? chat.lastReadAtByUid[uid].toMillis() : 0;
      if (lastMessage > lastRead) count++;
    });
    return count;
  }
};