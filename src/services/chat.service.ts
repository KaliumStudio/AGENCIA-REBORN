import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  query, where, serverTimestamp, onSnapshot, addDoc,
  orderBy, Timestamp, limit
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
    if (!batchId) throw new Error("ID de lote es requerido");

    const chatRef = doc(db, 'chats', batchId);
    const snap = await getDoc(chatRef);

    // Construir lista única de miembros
    const membersSet = new Set<string>();
    if (clientUserUid) membersSet.add(clientUserUid);
    if (currentUid) membersSet.add(currentUid);
    if (editorUids && Array.isArray(editorUids)) {
      editorUids.forEach(uid => { if (uid) membersSet.add(uid); });
    }
    const memberUids = Array.from(membersSet).filter(Boolean);

    if (snap.exists()) {
      // Si el chat ya existe, nos aseguramos de que el usuario actual esté en la lista
      const data = snap.data() as Chat;
      const existingMembers = data.memberUids || [];
      const isUserInChat = currentUid ? existingMembers.includes(currentUid) : true;
      
      if (!isUserInChat && currentUid) {
        const updatedMembers = Array.from(new Set([...existingMembers, currentUid]));
        await updateDoc(chatRef, { memberUids: updatedMembers });
      }
      return snap.id;
    }

    // Crear nuevo chat
    const chatData = {
      batchId,
      clientId,
      clientUserUid: clientUserUid || null,
      memberUids,
      editorAliases: {},
      lastMessageAt: serverTimestamp(),
      lastReadAtByUid: {}
    };

    await setDoc(chatRef, stripUndefined(chatData));
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
    fileData?: { url: string; name: string; size: number }
  ) {
    if (!chatId || !senderUid) return;

    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    
    if (!chatSnap.exists()) {
      console.error("No se encontró el chat para enviar el mensaje");
      return;
    }

    const chatData = chatSnap.data() as Chat;
    const editorAliases = chatData.editorAliases || {};

    let senderAlias = 'Cliente';
    if (role !== 'client') {
      senderAlias = editorAliases[senderUid];
      if (!senderAlias) {
        const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
        senderAlias = role === 'admin' ? 'Administrador' : `Editor #${randomHex}`;
        
        // Guardar el alias generado en el documento del chat
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
      fileUrl: fileData?.url || null,
      fileName: fileData?.name || null,
      fileSize: fileData?.size || null,
      createdAt: serverTimestamp(),
      // Mantenemos memberUids y clientId en el mensaje para facilitar reglas si fuera necesario,
      // pero la consulta principal ya no los usará como filtro obligatorio
      memberUids: chatData.memberUids,
      clientId: chatData.clientId
    });

    addDoc(messagesRef, messageData).catch(error => {
      console.error("Error enviando mensaje:", error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: messagesRef.path,
          operation: 'create',
          requestResourceData: messageData,
        })
      );
    });

    // Actualizar última actividad del chat
    updateDoc(chatRef, { lastMessageAt: serverTimestamp() }).catch(() => {});
  },

  subscribeToMessages(chatId: string, currentUid: string, role: UserRole, callback: (messages: Message[]) => void) {
    if (!chatId || !currentUid) return () => {};
    
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    
    // Simplificamos la consulta eliminando el filtro 'where' para evitar la necesidad de índices compuestos
    // La seguridad se maneja a nivel de reglas de Firestore (isChatMember)
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    return onSnapshot(q, (snap) => {
      const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      callback(messages);
    }, (error) => {
      console.error("Error en suscripción de mensajes:", error);
      const contextualError = new FirestorePermissionError({
        operation: 'list',
        path: `chats/${chatId}/messages`,
      });
      errorEmitter.emit('permission-error', contextualError);
    });
  },

  subscribeToUnreadCount(uid: string, callback: (count: number) => void) {
    if (!uid) return () => {};
    
    const q = query(
      collection(db, 'chats'), 
      where('memberUids', 'array-contains', uid)
    );

    return onSnapshot(q, (snap) => {
      let count = 0;
      snap.docs.forEach(doc => {
        const chat = doc.data() as Chat;
        const lastMessageAt = chat.lastMessageAt;
        const lastReadAt = chat.lastReadAtByUid?.[uid];

        if (lastMessageAt) {
          const lastMsgTime = lastMessageAt instanceof Timestamp ? lastMessageAt.toMillis() : new Date(lastMessageAt).getTime();
          const lastReadTime = lastReadAt ? (lastReadAt instanceof Timestamp ? lastReadAt.toMillis() : new Date(lastReadAt).getTime()) : 0;
          
          if (lastMsgTime > lastReadTime) {
            count++;
          }
        }
      });
      callback(count);
    }, (error) => {
      console.error("Error en suscripción de mensajes no leídos:", error);
    });
  }
};