
import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, orderBy, serverTimestamp, increment 
} from 'firebase/firestore';
import { Client } from '@/types';

const stripUndefined = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

export const clientService = {
  async getAllClients(): Promise<Client[]> {
    try {
      const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Client));
      }
    } catch (e) {
      console.warn("Ordered query failed, falling back to unordered fetch:", e);
    }

    const qFallback = query(collection(db, 'clients'));
    const snapFallback = await getDocs(qFallback);
    return snapFallback.docs.map(d => ({ id: d.id, ...d.data() } as Client))
      .sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
  },

  async getClient(id: string): Promise<Client | null> {
    const docSnap = await getDoc(doc(db, 'clients', id));
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Client) : null;
  },

  async createClient(data: { name: string; contact: string; contactEmail?: string; creativeQuota?: number; imageQuota?: number; createdBy: string }) {
    const newDoc = doc(collection(db, 'clients'));
    const clientData = stripUndefined({
      ...data,
      creativeQuota: data.creativeQuota || 0,
      imageQuota: data.imageQuota || 0,
      active: true,
      createdAt: serverTimestamp(),
    });
    await setDoc(newDoc, clientData);
    return newDoc.id;
  },

  async updateClient(id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) {
    const updateData = stripUndefined(data);
    await updateDoc(doc(db, 'clients', id), updateData);
  },

  async toggleClientStatus(id: string, currentStatus: boolean) {
    await updateDoc(doc(db, 'clients', id), { active: !currentStatus });
  },

  async deductImageQuota(clientId: string, amount: number) {
    const clientRef = doc(db, 'clients', clientId);
    await updateDoc(clientRef, {
      imageQuota: increment(-amount)
    });
  }
};
