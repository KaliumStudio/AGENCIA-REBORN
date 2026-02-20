import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { Batch, BatchStatus, VideoSpecification } from '@/types';
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

  updateBatch(id: string, data: Partial<Batch>) {
    const docRef = doc(db, 'batches', id);
    const updateData = stripUndefined(data);
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

  async assignEditors(id: string, editorUids: string[]) {
    const batchRef = doc(db, 'batches', id);
    
    const batchSnap = await getDoc(batchRef);
    if (!batchSnap.exists()) return;
    const batchData = batchSnap.data() as Batch;

    const status: BatchStatus = editorUids.length > 0 ? 'in_progress' : 'new';
    
    updateDoc(batchRef, { 
      assignedEditorUids: editorUids,
      status
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

  submitDelivery(id: string, driveLink: string, uid: string) {
    const docRef = doc(db, 'batches', id);
    const updateData = { 
      driveLink,
      status: 'delivered' as BatchStatus,
      deliveredAt: serverTimestamp(),
      deliveredBy: uid
    };
    
    updateDoc(docRef, updateData).catch(async (error) => {
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
