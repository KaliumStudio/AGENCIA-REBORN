
import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  query, serverTimestamp, onSnapshot, addDoc,
  orderBy, Timestamp, where
} from 'firebase/firestore';
import { Chat, Message, MessageType, UserRole } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { userService } from './user.service';

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
        return batchId;
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

      setDoc(chatRef, stripUndefined(chatData)).catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: chatRef.path,
          operation: 'create',
          requestResourceData: chatData
        }));
      });

      return batchId;
    } catch (error) {
      console.error("Error in getOrCreateChat:", error);
      return batchId;
    }
  },

  syncChatMembers(chatId: string, memberUids: string[]) {
    const chatRef = doc(db, 'chats', chatId);
    const data = { memberUids: Array.from(new Set(memberUids)).filter(Boolean) };
    
    updateDoc(chatRef, data)
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: chatRef.path,
          operation: 'update',
          requestResourceData: data
        }));
      });
  },

  markAsRead(chatId: string, uid: string) {
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

    // Fetch user profile to get real display name
    const [chatSnap, userProfile] = await Promise.all([
      getDoc(doc(db, 'chats', chatId)),
      userService.getProfile(senderUid)
    ]);
    
    if (!chatSnap.exists()) return;
    const chatData = chatSnap.data() as Chat;

    let senderAlias = 'Cliente';
    let senderName = userProfile?.displayName || 'Desconocido';

    if (role !== 'client') {
      const editorAliases = chatData.editorAliases || {};
      senderAlias = editorAliases[senderUid] || (role === 'admin' ? 'Administrador' : 'Editor');
      
      // Si es un editor y no tiene alias en este chat, asignarle uno aleatorio para anonimato ante el cliente
      if (role === 'editor' && !editorAliases[senderUid]) {
        const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(4, '0');
        senderAlias = `Editor #${randomHex}`;
        updateDoc(doc(db, 'chats', chatId), { [`editorAliases.${senderUid}`]: senderAlias }).catch(() => {});
      }
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messageData = stripUndefined({
      chatId,
      senderUid,
      senderRole: role,
      senderAlias, // Lo que ve el cliente (Anónimo)
      senderName,  // Lo que ve el administrador (Real)
      type,
      text,
      fileUrl: fileData?.url || null,
      fileName: fileData?.name || null,
      fileSize: fileData?.size || null,
      createdAt: serverTimestamp(),
      memberUids: chatData.memberUids,
      clientId: chatData.clientId
    });

    addDoc(messagesRef, messageData).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `chats/${chatId}/messages/new`,
        operation: 'create',
        requestResourceData: messageData
      }));
    });

    updateDoc(doc(db, 'chats', chatId), { lastMessageAt: serverTimestamp() }).catch(() => {});
  },

  subscribeToMessages(chatId: string, currentUid: string, role: UserRole, callback: (messages: Message[]) => void) {
    if (!chatId || !currentUid) return () => {};
    
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    return onSnapshot(q, (snap) => {
      const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      callback(messages);
    }, async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `chats/${chatId}/messages`,
        operation: 'list',
      }));
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
      console.error("Error subscribing to unread count:", error);
    });
  }
};
