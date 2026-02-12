import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  query, where, serverTimestamp, onSnapshot, addDoc 
} from 'firebase/firestore';
import { Chat, Message, MessageType, UserRole } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Utility to remove undefined properties from an object for Firestore safety.
 */
const stripUndefined = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
  );
};

export const chatService = {
  async getOrCreateChat(batchId: string, clientId: string, clientUserUid?: string, editorUids: string[] = [], currentUid?: string): Promise<string> {
    if (!batchId) throw new Error("Batch ID is required");

    const chatRef = doc(db, 'chats', batchId);
    let snap;
    
    try {
      snap = await getDoc(chatRef);
    } catch (e) {
      console.warn("Chat fetch error, might not exist yet");
    }

    const safeClientUserUid = Array.isArray(clientUserUid) ? clientUserUid[0] : clientUserUid;
    const safeEditorUids = Array.isArray(editorUids) ? editorUids : [editorUids];
    
    const memberUids = Array.from(new Set([
      safeClientUserUid, 
      ...safeEditorUids, 
      currentUid
    ])).filter((uid): uid is string => !!uid && typeof uid === 'string');

    if (snap?.exists()) {
      const data = snap.data() as Chat;
      const userToSync = currentUid || safeClientUserUid;
      if (userToSync && typeof userToSync === 'string' && !data.memberUids.includes(userToSync)) {
        const newMembers = Array.from(new Set([...data.memberUids, userToSync])).filter(uid => typeof uid === 'string');
        updateDoc(chatRef, { memberUids: newMembers }).catch(() => {});
      }
      return snap.id;
    }

    const chatData = stripUndefined({
      batchId,
      clientId,
      clientUserUid: safeClientUserUid || null,
      memberUids,
      editorAliases: {},
      lastMessageAt: serverTimestamp(),
      lastReadAtByUid: {}
    });

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

  async markAsRead(chatId: string, uid: string) {
    if (!chatId || !uid) return;
    const chatRef = doc(db, 'chats', chatId);
    updateDoc(chatRef, {
      [`lastReadAtByUid.${uid}`]: serverTimestamp()
    }).catch(() => {});
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

  async syncChatMembers(chatId: string, memberUids: string[]) {
    const chatRef = doc(db, 'chats', chatId);
    const safeMembers = memberUids.filter(uid => !!uid && typeof uid === 'string');
    await updateDoc(chatRef, { memberUids: safeMembers }).catch(() => {});
  },

  subscribeToMessages(chatId: string, currentUid: string, role: UserRole, clientId: string | undefined, callback: (messages: Message[]) => void) {
    if (!chatId || !currentUid) return () => {};
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    
    let q;
    if (role === 'admin') {
      // Admins can see all messages in the chat without filtering
      q = query(messagesRef);
    } else if (role === 'client' && clientId) {
      q = query(messagesRef, where('clientId', '==', clientId));
    } else {
      q = query(messagesRef, where('memberUids', 'array-contains', currentUid));
    }
    
    return onSnapshot(q, (snap) => {
      const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      const sortedMessages = messages.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return timeA - timeB;
      });
      callback(sortedMessages);
    }, (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: messagesRef.path,
        operation: 'list'
      }));
    });
  },

  subscribeToUnreadCount(uid: string, callback: (count: number) => void) {
    const q = query(collection(db, 'chats'), where('memberUids', 'array-contains', uid));
    return onSnapshot(q, (snap) => {
      let unreadCount = 0;
      snap.docs.forEach(doc => {
        const chat = doc.data() as Chat;
        const lastMessage = chat.lastMessageAt?.toMillis ? chat.lastMessageAt.toMillis() : 0;
        const lastRead = chat.lastReadAtByUid?.[uid]?.toMillis ? chat.lastReadAtByUid[uid].toMillis() : 0;
        if (lastMessage > lastRead) {
          unreadCount++;
        }
      });
      callback(unreadCount);
    });
  }
};