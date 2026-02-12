
import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { Batch, BatchStatus } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { chatService } from './chat.service';

const stripUndefined = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

export const batchService = {
  async createBatch(data: {
    clientId: string;
    clientUserUid: string;
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
    
    // Crear el chat inicial si tenemos un usuario cliente asignado
    if (data.clientUserUid) {
      await chatService.getOrCreateChat(newDoc.id, data.clientId, data.clientUserUid, data.assignedEditorUids);
    }
    
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

    if (batchData.clientUserUid) {
      const memberUids = Array.from(new Set([batchData.clientUserUid, ...editorUids]));
      await chatService.syncChatMembers(id, memberUids);
    }
  },

  async submitDelivery(id: string, driveLink: string, uid: string) {
    const docRef = doc(db, 'batches', id);
    const updateData = { 
      driveLink,
      status: 'delivered' as BatchStatus,
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
    const q = query(
      collection(db, 'batches'), 
      where('clientId', '==', clientId), 
      orderBy('createdAt', 'desc')
    );
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch));
    } catch (e) {
      // Fallback si falla el ordenamiento (ej: falta de índice o campos nulos)
      const qFallback = query(
        collection(db, 'batches'), 
        where('clientId', '==', clientId)
      );
      const snap = await getDocs(qFallback);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch))
        .sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tB - tA;
        });
    }
  },

  async getBatchesByEditor(editorUid: string): Promise<Batch[]> {
    const q = query(
      collection(db, 'batches'), 
      where('assignedEditorUids', 'array-contains', editorUid), 
      orderBy('createdAt', 'desc')
    );
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch));
    } catch (e) {
      const qFallback = query(
        collection(db, 'batches'), 
        where('assignedEditorUids', 'array-contains', editorUid)
      );
      const snap = await getDocs(qFallback);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch))
        .sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tB - tA;
        });
    }
  },

  async getAllBatches(): Promise<Batch[]> {
    const q = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch));
    } catch (e) {
      const snap = await getDocs(collection(db, 'batches'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch))
        .sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tB - tA;
        });
    }
  }
};
