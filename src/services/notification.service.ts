
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { db } from "@/lib/firebase";
import { getFcmMessaging } from "@/firebase/messaging";

export const notificationService = {
  async enablePush(uid: string) {
    if (!uid) throw new Error("No user ID provided");

    if (typeof window === 'undefined' || !('Notification' in window)) {
      throw new Error("Las notificaciones no están soportadas en este navegador.");
    }

    // 1. Registrar Service Worker de forma explícita
    let registration;
    try {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      console.log("[NotificationService] SW registrado.");
    } catch (swError) {
      console.error("[NotificationService] SW Error:", swError);
      throw new Error("No se pudo registrar el controlador del navegador.");
    }

    const messaging = await getFcmMessaging();
    if (!messaging) throw new Error("FCM no inicializado.");

    // 2. Pedir permiso
    const permission = await Notification.requestPermission();
    if (permission === "denied") {
      throw new Error("Permiso denegado por el navegador.");
    }

    // 3. Obtener Token vinculado al SW
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
    try {
      const token = await getToken(messaging, { 
        vapidKey,
        serviceWorkerRegistration: registration 
      });
      
      if (!token) throw new Error("No se obtuvo token.");

      // 4. Guardar en Firestore
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token),
        fcmUpdatedAt: serverTimestamp(),
        "notificationPrefs.push": true
      });

      return token;
    } catch (error: any) {
      throw new Error(error.message || "Error al registrar dispositivo.");
    }
  },

  async disablePush(uid: string) {
    if (!uid) return;
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      fcmTokens: [],
      "notificationPrefs.push": false,
      fcmUpdatedAt: serverTimestamp()
    });
  }
};
