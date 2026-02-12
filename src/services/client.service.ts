import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { Client } from '@/types';

/**
 * Helper to remove undefined properties from an object to prevent Firestore errors.
 */
const stripUndefined = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

export const clientService = {
  async getAllClients(): Promise<Client[]> {
    // Firestore queries with orderBy omit documents that don't have the field.
    // We try the ordered query first, then fallback to a full fetch + memory sort if it fails
    // or to ensure manual docs without createdAt still show up.
    try {
      const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      
      // If we get results, we return them. If empty, it might be due to index/missing fields.
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Client));
      }
    } catch (e) {
      console.warn("Ordered query failed, falling back to unordered fetch:", e);
    }

    // Fallback: Fetch all and sort in memory to include docs without createdAt
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

  async createClient(data: { name: string; contact: string; contactEmail?: string; createdBy: string }) {
    const newDoc = doc(collection(db, 'clients'));
    const clientData = stripUndefined({
      ...data,
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
  }
};
