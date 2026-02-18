import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { UserProfile, UserRole } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const userService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    if (!uid) return null;
    const docRef = doc(db, 'users', uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    return null;
  },

  async saveProfile(profile: UserProfile) {
    const { uid, ...data } = profile;
    const docRef = doc(db, 'users', uid);
    
    // Non-blocking write
    setDoc(docRef, data, { merge: true })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data
        }));
      });
  },

  async updateProfile(uid: string, profile: Partial<UserProfile>) {
    const docRef = doc(db, 'users', uid);
    updateDoc(docRef, profile).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: profile
      }));
    });
  },

  async getEditors(): Promise<UserProfile[]> {
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'editor'), 
      where('active', '==', true)
    );
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    } catch (error) {
      return [];
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    } catch (error) {
      return [];
    }
  }
};
