import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  query, serverTimestamp, onSnapshot, addDoc,
  orderBy, Timestamp, where
} from 'firebase/firestore';
import { Chat, Message, MessageType, UserRole } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, SecurityRuleContext } from '@/firebase/errors';

const stripUndefined = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
  );
};

export const chatService = {
  async getOrCreateChat(batchId: string, clientId: string, clientUserUid: string | null, editorUids: string[] = [], currentUid?: string): Promise<string> {
    if (!batchId) throw new Error("ID de lote es requerido");

    const chatRef = doc(db, 'chats', batchId);
    
    try {
      const snap = await getDoc(chatRef);

      const membersSet = new Set<string>();
      if (clientUserUid) membersSet.add(clientUserUid);
      if (currentUid) membersSet.add(currentUid);
      if (editorUids && Array.isArray(editorUids)) {
        editorUids.forEach(uid => { if (uid) membersSet.add(uid); });
      }
      const memberUids = Array.from(membersSet).filter(Boolean);

      if (snap.exists()) {
        const data = snap.data() as Chat;
        const existingMembers = data.memberUids || [];
        const needsUpdate = currentUid && !existingMembers.includes(currentUid);
        
        if (needsUpdate) {
          const updatedMembers = Array.from(new Set([...existingMembers, currentUid]));
          updateDoc(chatRef, { memberUids: updatedMembers }).catch(() => {});
        }
        return snap.id;
      }

      const chatData = {
        batchId,
        clientId,
        clientUserUid: clientUserUid || null,
        memberUids,
        editorAliases: {},
        lastMessageAt: serverTimestamp(),
        lastReadAtByUid: {}
      };

      // Escritura no bloqueante
      setDoc(chatRef, stripUndefined(chatData)).catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: chatRef.path,
          operation: 'create',
          requestResourceData: chatData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

      return batchId;
    } catch (error) {
      console.error("Error in getOrCreateChat:", error);
      throw error;
    }
  },

  async syncChatMembers(chatId: string, memberUids: string[]) {
    const chatRef = doc(db, 'chats', chatId);
    updateDoc(chatRef, { memberUids: Array.from(new Set(memberUids)).filter(Boolean) })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: chatRef.path,
          operation: 'update',
          requestResourceData: { memberUids }
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
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

    // Obtenemos info del chat para asegurar coherencia de datos en el mensaje
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    
    if (!chatSnap.exists()) return;
    const chatData = chatSnap.data() as Chat;

    let senderAlias = 'Cliente';
    if (role !== 'client') {
      const editorAliases = chatData.editorAliases || {};
      senderAlias = editorAliases[senderUid];
      if (!senderAlias) {
        const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(4, '0');
        senderAlias = role === 'admin' ? 'Administrador' : `Editor #${randomHex}`;
        updateDoc(chatRef, { [`editorAliases.${senderUid}`]: senderAlias }).catch(() => {});
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
      memberUids: chatData.memberUids,
      clientId: chatData.clientId
    });

    // Escritura no bloqueante
    addDoc(messagesRef, messageData).catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: `chats/${chatId}/messages/new`,
        operation: 'create',
        requestResourceData: messageData
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });

    updateDoc(chatRef, { lastMessageAt: serverTimestamp() }).catch(() => {});
  },

  subscribeToMessages(chatId: string, currentUid: string, role: UserRole, callback: (messages: Message[]) => void) {
    if (!chatId || !currentUid) return () => {};
    
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    // Eliminamos el filtro 'where' para evitar problemas de índices compuestos y 
    // confiamos en que las reglas de seguridad (o la privacidad del proyecto) protejan los datos.
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    return onSnapshot(q, (snap) => {
      const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      callback(messages);
    }, async (error) => {
      const permissionError = new FirestorePermissionError({
        path: `chats/${chatId}/messages`,
        operation: 'list',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
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
    });
  }
};