import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { Batch, BatchStatus } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
      throw new Error("El ID del creador es obligatorio.");
    }

    const batchesRef = collection(db, 'batches');
    const newDoc = doc(batchesRef);
    const batchData = stripUndefined({
      ...data,
      status: 'new',
      driveLink: null,
      createdAt: serverTimestamp(),
    });
    
    await setDoc(newDoc, batchData).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: newDoc.path,
        operation: 'create',
        requestResourceData: batchData
      }));
      throw e;
    });
    
    return newDoc.id;
  },

  async getBatch(id: string): Promise<Batch | null> {
    const docRef = doc(db, 'batches', id);
    try {
      const snap = await getDoc(docRef);
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as Batch) : null;
    } catch (e) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'get'
      }));
      throw e;
    }
  },

  async updateBatchStatus(id: string, status: BatchStatus) {
    const docRef = doc(db, 'batches', id);
    updateDoc(docRef, { status }).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { status }
      }));
    });
  },

  async assignEditors(id: string, editorUids: string[]) {
    const batchRef = doc(db, 'batches', id);
    const batchSnap = await getDoc(batchRef);
    if (!batchSnap.exists()) return;

    const batchData = batchSnap.data() as Batch;
    const status: BatchStatus = editorUids.length > 0 ? 'in_progress' : 'new';
    
    // Actualizar tanda
    updateDoc(batchRef, { 
      assignedEditorUids: editorUids,
      status
    }).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: batchRef.path,
        operation: 'update',
        requestResourceData: { assignedEditorUids: editorUids, status }
      }));
    });

    // Actualizar miembros del chat para que los editores tengan acceso por seguridad
    const chatRef = doc(db, 'chats', id);
    const chatSnap = await getDoc(chatRef).catch(() => null);
    if (chatSnap?.exists()) {
      const memberUids = Array.from(new Set([batchData.clientId, ...editorUids]));
      updateDoc(chatRef, { memberUids }).catch(() => {});
    }
  },

  async submitDelivery(id: string, driveLink: string, uid: string) {
    const docRef = doc(db, 'batches', id);
    const updateData = { 
      driveLink,
      status: 'delivered',
      deliveredAt: serverTimestamp(),
      deliveredBy: uid
    };
    
    updateDoc(docRef, updateData).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updateData
      }));
    });
  },

  async getBatchesByClient(clientId: string): Promise<Batch[]> {
    const q = query(collection(db, 'batches'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch));
    } catch (e) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'batches',
        operation: 'list'
      }));
      throw e;
    }
  },

  async getBatchesByEditor(editorUid: string): Promise<Batch[]> {
    const q = query(collection(db, 'batches'), where('assignedEditorUids', 'array-contains', editorUid), orderBy('createdAt', 'desc'));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch));
    } catch (e) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'batches',
        operation: 'list'
      }));
      throw e;
    }
  },

  async getAllBatches(): Promise<Batch[]> {
    const q = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch));
    } catch (e) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'batches',
        operation: 'list'
      }));
      throw e;
    }
  }
};