import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { Client } from '@/types';

export const clientService = {
  async getAllClients(): Promise<Client[]> {
    const snap = await getDocs(collection(db, 'clients'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Client));
  },

  async getClient(id: string): Promise<Client | null> {
    const docSnap = await getDoc(doc(db, 'clients', id));
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Client) : null;
  },

  async createClient(data: Omit<Client, 'id' | 'createdAt'>) {
    const newDoc = doc(collection(db, 'clients'));
    await setDoc(newDoc, {
      ...data,
      createdAt: serverTimestamp()
    });
    return newDoc.id;
  }
};