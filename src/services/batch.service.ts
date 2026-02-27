
import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, arrayUnion, increment 
} from 'firebase/firestore';
import { Batch, BatchStatus, VideoSpecification, EditHistoryEntry, Client } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { chatService } from './chat.service';

const stripUndefined = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
  );
};

export const batchService = {
  createBatch(data: {
    clientId: string;
    clientUserUid: string;
    title: string;
    productName: string;
    creativeCount: number;
    videoSpecs: VideoSpecification[];
    referenceLinks: string;
    landingPage: string;
    additionalNotes?: string;
    deliveryDeadlineTime: string;
    assignedEditorUids: string[];
    createdBy: string;
    brief?: string;
  }) {
    const batchesRef = collection(db, 'batches');
    const newDoc = doc(batchesRef);
    const batchData = stripUndefined({
      ...data,
      status: 'new',
      createdAt: serverTimestamp(),
      editHistory: [{
        uid: data.createdBy,
        userName: 'Sistema (Creación)',
        timestamp: new Date(),
        action: 'Tanda creada'
      }]
    });
    
    setDoc(newDoc, batchData)
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: newDoc.path,
          operation: 'create',
          requestResourceData: batchData
        }));
      });
    
    chatService.getOrCreateChat(
      newDoc.id, 
      data.clientId, 
      data.clientUserUid, 
      data.assignedEditorUids,
      data.createdBy
    );
    
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

  updateBatchStatus(id: string, status: BatchStatus) {
    const docRef = doc(db, 'batches', id);
    updateDoc(docRef, { status }).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { status }
      }));
    });
  },

  async updateBatch(id: string, data: Partial<Batch>, editorUid: string, editorName: string) {
    const docRef = doc(db, 'batches', id);
    const historyEntry: EditHistoryEntry = {
      uid: editorUid,
      userName: editorName,
      timestamp: new Date(),
      action: 'Actualización de detalles'
    };

    const updateData = {
      ...stripUndefined(data),
      editHistory: arrayUnion(historyEntry)
    };

    updateDoc(docRef, updateData).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updateData
      }));
    });
  },

  async deleteBatch(id: string) {
    const docRef = doc(db, 'batches', id);
    const chatRef = doc(db, 'chats', id);
    
    deleteDoc(docRef).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });
    
    deleteDoc(chatRef).catch(() => {});
  },

  async assignEditors(id: string, editorUids: string[], adminUid: string, adminName: string) {
    const batchRef = doc(db, 'batches', id);
    
    const batchSnap = await getDoc(batchRef);
    if (!batchSnap.exists()) return;
    const batchData = batchSnap.data() as Batch;

    const status: BatchStatus = editorUids.length > 0 ? 'in_progress' : 'new';
    
    const historyEntry: EditHistoryEntry = {
      uid: adminUid,
      userName: adminName,
      timestamp: new Date(),
      action: `Asignación de editores (${editorUids.length})`
    };

    updateDoc(batchRef, { 
      assignedEditorUids: editorUids,
      status,
      editHistory: arrayUnion(historyEntry)
    }).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: batchRef.path,
        operation: 'update',
        requestResourceData: { assignedEditorUids: editorUids, status }
      }));
    });

    const memberUids = Array.from(new Set([batchData.clientUserUid, ...editorUids])).filter(Boolean);
    chatService.syncChatMembers(id, memberUids);
  },

  async submitDelivery(id: string, driveLink: string, uid: string, userName: string) {
    const docRef = doc(db, 'batches', id);
    const batchSnap = await getDoc(docRef);
    if (!batchSnap.exists()) return;
    const batchData = batchSnap.data() as Batch;

    // Solo descontar si no estaba ya entregada para evitar dobles descuentos
    const isFirstDelivery = batchData.status !== 'delivered' && batchData.status !== 'approved';

    const historyEntry: EditHistoryEntry = {
      uid: uid,
      userName: userName,
      timestamp: new Date(),
      action: 'Entrega de material realizada'
    };

    const updateData = { 
      driveLink,
      status: 'delivered' as BatchStatus,
      deliveredAt: serverTimestamp(),
      deliveredBy: uid,
      editHistory: arrayUnion(historyEntry)
    };
    
    await updateDoc(docRef, updateData).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updateData
      }));
    });

    // Lógica de cupos de creativos
    if (isFirstDelivery && batchData.clientId) {
      // Formato IMAGEN = 0.5, Otros = 1.0
      const quotaCost = (batchData.videoSpecs || []).reduce((acc, spec) => {
        return acc + (spec.format === 'IMAGEN' ? 0.5 : 1.0);
      }, 0);

      const clientRef = doc(db, 'clients', batchData.clientId);
      updateDoc(clientRef, {
        creativeQuota: increment(-quotaCost)
      }).catch(err => console.error("Error updating client quota:", err));
    }
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
