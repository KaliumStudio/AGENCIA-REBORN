
import { initializeFirebase } from '@/firebase';

const services = initializeFirebase();

export const app = services.firebaseApp;
export const auth = services.auth;
export const db = services.firestore;
export const storage = services.storage;
