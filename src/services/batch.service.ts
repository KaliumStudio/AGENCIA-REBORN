import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { Batch, BatchStatus } from '@/types';

/**
 * Helper to remove undefined properties from an object to prevent Firestore errors.
 */
const stripUndefined = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

export const batchService = {
  async createBatch(data: {
    clientId: string;
    title: string;
    brief: string;
    dueDate?: string;
    assignedEditorUids: string[];
    createdBy: string;
  }) {
    if (!data.createdBy) {
      throw new Error("El ID del creador (uid) es obligatorio para crear una tanda.");
    }

    const newDoc = doc(collection(db, 'batches'));
    const batchData = stripUndefined({
      ...data,
      status: 'new',
      driveLink: null,
      createdAt: serverTimestamp(),
    });
    
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
    const status: BatchStatus = editorUids.length > 0 ? 'in_progress' : 'new';
    await updateDoc(doc(db, 'batches', id), { 
      assignedEditorUids: editorUids,
      status
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
