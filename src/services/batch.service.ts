import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { Batch, BatchStatus } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, SecurityRuleContext } from '@/firebase/errors';
import { chatService } from './chat.service';

const stripUndefined = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
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
      createdAt: serverTimestamp(),
    });
    
    // Escritura no bloqueante
    setDoc(newDoc, batchData)
      .then(() => {
        // Inicializar el chat automáticamente al crear la tanda
        chatService.getOrCreateChat(
          newDoc.id, 
          data.clientId, 
          data.clientUserUid, 
          data.assignedEditorUids,
          data.createdBy
        );
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: `batches/${newDoc.id}`,
          operation: 'create',
          requestResourceData: batchData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    
    return newDoc.id;
  },

  async getBatch(id: string): Promise<Batch | null> {
    const docRef = doc(db, 'batches', id);
    try {
      const snap = await getDoc(docRef);
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as Batch) : null;
    } catch (e) {
      return null;
    }
  },

  async updateBatchStatus(id: string, status: BatchStatus) {
    const docRef = doc(db, 'batches', id);
    updateDoc(docRef, { status }).catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: `batches/${id}`,
        operation: 'update',
        requestResourceData: { status }
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  },

  async assignEditors(id: string, editorUids: string[]) {
    const batchRef = doc(db, 'batches', id);
    
    // El getDoc es necesario para obtener metadatos para el chat, se mantiene el await aquí
    const batchSnap = await getDoc(batchRef);
    if (!batchSnap.exists()) return;
    const batchData = batchSnap.data() as Batch;

    const status: BatchStatus = editorUids.length > 0 ? 'in_progress' : 'new';
    
    updateDoc(batchRef, { 
      assignedEditorUids: editorUids,
      status
    }).then(() => {
      const memberUids = Array.from(new Set([batchData.clientUserUid, ...editorUids]));
      chatService.syncChatMembers(id, memberUids);
    }).catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: `batches/${id}`,
        operation: 'update',
        requestResourceData: { assignedEditorUids: editorUids, status }
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  },

  async submitDelivery(id: string, driveLink: string, uid: string) {
    const docRef = doc(db, 'batches', id);
    const updateData = { 
      driveLink,
      status: 'delivered' as BatchStatus,
      deliveredAt: serverTimestamp(),
      deliveredBy: uid
    };
    
    updateDoc(docRef, updateData).catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: `batches/${id}`,
        operation: 'update',
        requestResourceData: updateData
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
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
      const qFallback = query(collection(db, 'batches'), where('clientId', '==', clientId));
      const snap = await getDocs(qFallback);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
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
      const qFallback = query(collection(db, 'batches'), where('assignedEditorUids', 'array-contains', editorUid));
      const snap = await getDocs(qFallback);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
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
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }
  }
};