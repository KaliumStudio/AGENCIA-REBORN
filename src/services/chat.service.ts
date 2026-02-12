import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  query, where, orderBy, serverTimestamp, onSnapshot, addDoc, getDocs 
} from 'firebase/firestore';
import { Chat, Message, MessageType, UserRole } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const chatService = {
  async getOrCreateChat(batchId: string, clientId: string, editorUids: string[] = [], currentUid: string): Promise<string> {
    if (!batchId || !currentUid) {
      console.error("Missing required parameters for getOrCreateChat:", { batchId, currentUid });
      throw new Error("Faltan parámetros obligatorios para inicializar el chat.");
    }

    const chatsRef = collection(db, 'chats');
    // Buscamos si ya existe un chat para esta tanda
    const q = query(chatsRef, where('batchId', '==', batchId));
    
    let snap;
    try {
      snap = await getDocs(q);
    } catch (e) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: chatsRef.path,
        operation: 'list'
      }));
      throw e;
    }
    
    const memberUids = Array.from(new Set([clientId, ...editorUids, currentUid]));

    if (!snap.empty) {
      const existingChat = snap.docs[0];
      const chatData = existingChat.data() as Chat;
      
      // Si el usuario actual no está en la lista de miembros, lo añadimos (importante para nuevos editores asignados)
      if (!chatData.memberUids.includes(currentUid)) {
        updateDoc(existingChat.ref, {
          memberUids: memberUids
        }).catch(() => {});
      }
      
      return existingChat.id;
    }

    const newChatRef = doc(chatsRef);
    const chatData = {
      batchId,
      clientId,
      memberUids,
      editorAliases: {},
      lastMessageAt: serverTimestamp()
    };

    setDoc(newChatRef, chatData).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: newChatRef.path,
        operation: 'create',
        requestResourceData: chatData
      }));
    });
    
    return newChatRef.id;
  },

  async sendMessage(chatId: string, senderUid: string, role: UserRole, type: MessageType, text: string) {
    if (!chatId || !senderUid) return;

    const chatRef = doc(db, 'chats', chatId);
    let chatSnap;
    try {
      chatSnap = await getDoc(chatRef);
    } catch (e) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: chatRef.path,
        operation: 'get'
      }));
      return;
    }

    if (!chatSnap.exists()) return;

    const chatData = chatSnap.data() as Chat;
    let senderAlias = 'Cliente';

    if (role === 'editor' || role === 'admin') {
      let alias = chatData.editorAliases?.[senderUid];
      if (!alias) {
        alias = `Editor #${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        updateDoc(chatRef, {
          [`editorAliases.${senderUid}`]: alias
        }).catch(() => {});
      }
      senderAlias = alias;
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messageData = {
      senderUid,
      senderRole: role,
      senderAlias,
      type,
      text,
      createdAt: serverTimestamp(),
      memberUids: chatData.memberUids 
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

  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    if (!chatId) return () => {};

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    // NO usamos orderBy('createdAt') aquí porque filtraría los mensajes locales que aún no tienen timestamp del servidor.
    // En su lugar, ordenamos en memoria en el callback.
    const q = query(messagesRef);
    
    return onSnapshot(q, 
      (snap) => {
        const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
        // Ordenar en memoria por fecha (los nulos van al final o se manejan como "ahora")
        const sortedMessages = messages.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
          return timeA - timeB;
        });
        callback(sortedMessages);
      },
      (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: messagesRef.path,
          operation: 'list'
        }));
      }
    );
  }
};