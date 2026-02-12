import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { Batch, BatchStatus } from '@/types';

export const batchService = {
  async createBatch(data: Omit<Batch, 'id' | 'createdAt' | 'status'>) {
    const newDoc = doc(collection(db, 'batches'));
    const batchData = {
      ...data,
      status: 'new',
      createdAt: serverTimestamp(),
    };
    await setDoc(newDoc, batchData);
    return newDoc.id;
  },

  async getBatch(id: string): Promise<Batch | null> {
    const snap = await getDoc(doc(db, 'batches', id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Batch) : null;
  },

  async updateBatchStatus(id: string, status: BatchStatus) {
    await updateDoc(doc(db, 'batches', id), { status });
  },

  async updateDriveLink(id: string, driveLink: string) {
    await updateDoc(doc(db, 'batches', id), { 
      driveLink,
      status: 'delivered'
    });
  },

  async assignEditors(id: string, editorUids: string[]) {
    await updateDoc(doc(db, 'batches', id), { 
      assignedEditorUids: editorUids,
      status: 'in_progress'
    });
  },

  async getBatchesByClient(clientId: string): Promise<Batch[]> {
    const q = query(collection(db, 'batches'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch));
  },

  async getBatchesByEditor(editorUid: string): Promise<Batch[]> {
    const q = query(collection(db, 'batches'), where('assignedEditorUids', 'array-contains', editorUid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch));
  },

  async getAllBatches(): Promise<Batch[]> {
    const q = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch));
  }
};