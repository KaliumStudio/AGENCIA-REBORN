import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  query, where, orderBy, serverTimestamp, onSnapshot, addDoc, getDocs 
} from 'firebase/firestore';
import { Chat, Message, MessageType, UserRole } from '@/types';

export const chatService = {
  async getOrCreateChat(batchId: string, clientId: string, editorUids: string[]): Promise<string> {
    const q = query(collection(db, 'chats'), where('batchId', '==', batchId));
    const snap = await getDocs(q);
    
    if (!snap.empty) return snap.docs[0].id;

    const members: Record<string, boolean> = { [clientId]: true };
    editorUids.forEach(uid => members[uid] = true);

    const newChatRef = doc(collection(db, 'chats'));
    await setDoc(newChatRef, {
      batchId,
      clientId,
      members,
      editorAliases: {},
      lastMessageAt: serverTimestamp()
    });
    return newChatRef.id;
  },

  async sendMessage(chatId: string, senderUid: string, role: UserRole, type: MessageType, text: string) {
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) return;

    const chatData = chatSnap.data() as Chat;
    let senderAlias = 'Cliente';

    if (role === 'editor' || role === 'admin') {
      let alias = chatData.editorAliases[senderUid];
      if (!alias) {
        alias = `Editor #${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        await updateDoc(chatRef, {
          [`editorAliases.${senderUid}`]: alias
        });
      }
      senderAlias = alias;
    }

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderUid,
      senderRole: role,
      senderAlias,
      type,
      text,
      createdAt: serverTimestamp()
    });

    await updateDoc(chatRef, { lastMessageAt: serverTimestamp() });
  },

  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      callback(messages);
    });
  }
};
