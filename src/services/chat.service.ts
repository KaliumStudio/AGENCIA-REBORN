import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  query, where, orderBy, serverTimestamp, onSnapshot, addDoc, getDocs 
} from 'firebase/firestore';
import { Chat, Message, MessageType, UserRole } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const chatService = {
  async getOrCreateChat(batchId: string, clientId: string, editorUids: string[], currentUid: string): Promise<string> {
    // Safety check to prevent "Unsupported field value: undefined" errors
    if (!batchId || !currentUid) {
      console.error("Missing required parameters for getOrCreateChat:", { batchId, currentUid });
      throw new Error("Faltan parámetros obligatorios para inicializar el chat.");
    }

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef, 
      where('memberUids', 'array-contains', currentUid),
      where('batchId', '==', batchId)
    );
    
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
    
    if (!snap.empty) return snap.docs[0].id;

    // Create unique list of members
    const memberUids = Array.from(new Set([clientId, ...editorUids, currentUid]));

    const newChatRef = doc(chatsRef);
    const chatData = {
      batchId,
      clientId,
      memberUids,
      editorAliases: {},
      lastMessageAt: serverTimestamp()
    };

    // Use non-blocking write
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

    // Handle anonymous aliases for editors
    if (role === 'editor' || role === 'admin') {
      let alias = chatData.editorAliases?.[senderUid];
      if (!alias) {
        alias = `Editor #${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        // Update the chat with the new alias (non-blocking)
        updateDoc(chatRef, {
          [`editorAliases.${senderUid}`]: alias
        }).catch(e => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: chatRef.path,
            operation: 'update',
            requestResourceData: { [`editorAliases.${senderUid}`]: alias }
          }));
        });
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
      memberUids: chatData.memberUids // Denormalized for security rules
    };

    // Non-blocking add
    addDoc(messagesRef, messageData).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: messagesRef.path,
        operation: 'create',
        requestResourceData: messageData
      }));
    });

    // Update last message timestamp
    updateDoc(chatRef, { lastMessageAt: serverTimestamp() }).catch(() => {});
  },

  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    if (!chatId) return () => {};

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    return onSnapshot(q, 
      (snap) => {
        const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
        callback(messages);
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
