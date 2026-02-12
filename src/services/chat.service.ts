import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  query, where, serverTimestamp, onSnapshot, addDoc 
} from 'firebase/firestore';
import { Chat, Message, MessageType, UserRole } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const chatService = {
  /**
   * Obtiene o crea un chat para una tanda.
   * Usamos el batchId como el ID del documento del chat para que sea determinista.
   */
  async getOrCreateChat(batchId: string, clientId: string, editorUids: string[] = [], currentUid: string): Promise<string> {
    if (!batchId) throw new Error("Batch ID is required");

    const chatRef = doc(db, 'chats', batchId);
    let snap;
    
    try {
      snap = await getDoc(chatRef);
    } catch (e) {
      // Si falla por permisos, es probable que el usuario no sea miembro aún.
      // Pero como estamos en el flujo de creación/obtención, intentaremos crearlo si no existe.
    }

    const memberUids = Array.from(new Set([clientId, ...editorUids, currentUid]));

    if (snap?.exists()) {
      const chatData = snap.data() as Chat;
      // Si el usuario actual no está en la lista de miembros (ej: editor recién asignado), lo añadimos.
      if (!chatData.memberUids.includes(currentUid)) {
        updateDoc(chatRef, {
          memberUids: memberUids
        }).catch(() => {});
      }
      return snap.id;
    }

    // Si no existe, lo creamos usando el batchId como ID
    const chatData = {
      batchId,
      clientId,
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
        alias = `Editor #${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        updateDoc(chatRef, {
          [`editorAliases.${senderUid}`]: alias
        }).catch(() => {});
      }
      senderAlias = alias;
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messageData = {
      chatId, // Denormalización útil
      senderUid,
      senderRole: role,
      senderAlias,
      type,
      text,
      createdAt: serverTimestamp(),
      memberUids: chatData.memberUids // CRÍTICO para reglas de seguridad
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

  subscribeToMessages(chatId: string, currentUid: string, callback: (messages: Message[]) => void) {
    if (!chatId || !currentUid) return () => {};

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    
    // Para cumplir con las reglas de seguridad "resource.data.memberUids", 
    // la consulta debe incluir obligatoriamente el filtro de membresía.
    const q = query(
      messagesRef, 
      where('memberUids', 'array-contains', currentUid)
    );
    
    return onSnapshot(q, 
      (snap) => {
        const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
        // Ordenamos en memoria para manejar timestamps nulos (optimistic updates)
        const sortedMessages = messages.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
          return timeA - timeB;
        });
        callback(sortedMessages);
      },
      (e) => {
        console.error("Snapshot error:", e);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: messagesRef.path,
          operation: 'list'
        }));
      }
    );
  }
};