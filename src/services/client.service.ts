import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { Client } from '@/types';

export const clientService = {
  async getAllClients(): Promise<Client[]> {
    const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Client));
  },

  async getClient(id: string): Promise<Client | null> {
    const docSnap = await getDoc(doc(db, 'clients', id));
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Client) : null;
  },

  async createClient(data: { name: string; contact: string; contactEmail?: string; createdBy: string }) {
    const newDoc = doc(collection(db, 'clients'));
    const clientData = {
      ...data,
      active: true,
      createdAt: serverTimestamp(),
    };
    await setDoc(newDoc, clientData);
    return newDoc.id;
  },

  async updateClient(id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) {
    await updateDoc(doc(db, 'clients', id), data);
  },

  async toggleClientStatus(id: string, currentStatus: boolean) {
    await updateDoc(doc(db, 'clients', id), { active: !currentStatus });
  }
};
