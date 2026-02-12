import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { UserProfile, UserRole } from '@/types';

export const userService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  },

  async createProfile(uid: string, profile: Partial<UserProfile>) {
    await setDoc(doc(db, 'users', uid), profile, { merge: true });
  },

  async updateProfile(uid: string, profile: Partial<UserProfile>) {
    await updateDoc(doc(db, 'users', uid), profile);
  },

  async getEditors(): Promise<UserProfile[]> {
    const q = query(collection(db, 'users'), where('role', '==', 'editor'), where('active', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserProfile);
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => d.data() as UserProfile);
  }
};