
import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, orderBy, serverTimestamp, where 
} from 'firebase/firestore';
import { LandingRequest, LandingRequestStatus } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const landingRequestService = {
  async createRequest(data: Omit<LandingRequest, 'id' | 'createdAt' | 'status'>) {
    const requestsRef = collection(db, 'landing-requests');
    const newDoc = doc(requestsRef);
    const requestData = {
      ...data,
      id: newDoc.id,
      status: 'pending' as LandingRequestStatus,
      createdAt: serverTimestamp(),
    };
    
    await setDoc(newDoc, requestData).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: newDoc.path,
        operation: 'create',
        requestResourceData: requestData
      }));
    });
    
    return newDoc.id;
  },

  async getAllRequests(): Promise<LandingRequest[]> {
    const q = query(collection(db, 'landing-requests'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data() } as LandingRequest));
  },

  async getRequestsByClient(clientId: string): Promise<LandingRequest[]> {
    const q = query(
      collection(db, 'landing-requests'), 
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data() } as LandingRequest));
  },

  async getRequest(id: string): Promise<LandingRequest | null> {
    const docSnap = await getDoc(doc(db, 'landing-requests', id));
    return docSnap.exists() ? (docSnap.data() as LandingRequest) : null;
  },

  async updateStatus(id: string, status: LandingRequestStatus) {
    await updateDoc(doc(db, 'landing-requests', id), { status });
  }
};
