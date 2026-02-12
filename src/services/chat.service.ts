import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  query, where, serverTimestamp, onSnapshot, addDoc 
} from 'firebase/firestore';
import { Chat, Message, MessageType, UserRole } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const chatService = {
  async getOrCreateChat(batchId: string, clientId: string, clientUserUid: string, editorUids: string[] = [], currentUid?: string): Promise<string> {
    if (!batchId) throw new Error("Batch ID is required");

    const chatRef = doc(db, 'chats', batchId);
    let snap;
    
    try {
      snap = await getDoc(chatRef);
    } catch (e) {
      console.warn("Silent fetch error during chat init, attempting to create or join...");
    }

    const memberUids = Array.from(new Set([clientUserUid, ...editorUids])).filter(uid => !!uid);

    if (snap?.exists()) {
      const data = snap.data() as Chat;
      // Asegurarnos de que el usuario actual (si se pasa) esté en los miembros si pertenece al batch
      const userToSync = currentUid || clientUserUid;
      if (userToSync && !data.memberUids.includes(userToSync)) {
        const newMembers = Array.from(new Set([...data.memberUids, userToSync]));
        updateDoc(chatRef, { memberUids: newMembers }).catch(() => {});
      }
      return snap.id;
    }

    const chatData = {
      batchId,
      clientId,
      clientUserUid,
      memberUids,
      editorAliases: {},
      lastMessageAt: serverTimestamp()
    };

    try {
      await setDoc(chatRef, chatData);
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: chatRef.path,
        operation: 'create',
        requestResourceData: chatData
      }));
      throw e;
    }
    
    return batchId;
  },

  async syncChatMembers(chatId: string, memberUids: string[]) {
    const chatRef = doc(db, 'chats', chatId);
    updateDoc(chatRef, { memberUids: memberUids.filter(uid => !!uid) }).catch(() => {});
  },

  async sendMessage(chatId: string, senderUid: string, role: UserRole, type: MessageType, text: string) {
    if (!chatId || !senderUid) return;

    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef).catch(() => null);
    if (!chatSnap?.exists()) return;

    const chatData = chatSnap.data() as Chat;
    let senderAlias = 'Cliente';

    if (role === 'editor' || role === 'admin') {
      let alias = chatData.editorAliases?.[senderUid];
      if (!alias) {
        const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
        alias = `Editor #${randomHex}`;
        updateDoc(chatRef, {
          [`editorAliases.${senderUid}`]: alias
        }).catch(() => {});
      }
      senderAlias = alias;
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messageData = {
      chatId,
      senderUid,
      senderRole: role,
      senderAlias,
      type,
      text,
      createdAt: serverTimestamp(),
      memberUids: chatData.memberUids,
      clientId: chatData.clientId
    };

    addDoc(messagesRef, messageData).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: messagesRef.path,
        operation: 'create',
        requestResourceData: messageData
      }));
    });

    updateDoc(chatRef, { lastMessageAt: serverTimestamp() }).catch(() => {});
  },

  subscribeToMessages(chatId: string, currentUid: string, role: UserRole, clientId: string | undefined, callback: (messages: Message[]) => void) {
    if (!chatId || !currentUid) return () => {};

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    
    let q;
    if (role === 'client' && clientId) {
      // Para clientes, usamos el clientId para asegurar que vean todos los mensajes de su empresa
      q = query(
        messagesRef, 
        where('clientId', '==', clientId)
      );
    } else {
      // Para editores y otros, usamos membresía directa
      q = query(
        messagesRef, 
        where('memberUids', 'array-contains', currentUid)
      );
    }
    
    return onSnapshot(q, 
      (snap) => {
        const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
        const sortedMessages = messages.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
          return timeA - timeB;
        });
        callback(sortedMessages);
      },
      (e) => {
        console.error("Subscription error:", e);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: messagesRef.path,
          operation: 'list'
        }));
      }
    );
  }
};