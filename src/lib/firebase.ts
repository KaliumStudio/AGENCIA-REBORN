import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCK2eGzq7rdG1ki-G6Asz-TsTHWdkPe3Nc",
  authDomain: "studio-7837102107-41ca8.firebaseapp.com",
  projectId: "studio-7837102107-41ca8",
  storageBucket: "studio-7837102107-41ca8.firebasestorage.app",
  messagingSenderId: "607157941153",
  appId: "1:607157941153:web:4d083a830f7fbb252111e0"
};

// Inicializar Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log("Firebase initialized with storage bucket:", firebaseConfig.storageBucket);

export { auth, db, app, storage };
