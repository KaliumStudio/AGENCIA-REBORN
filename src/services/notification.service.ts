
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { db } from "@/lib/firebase";
import { getFcmMessaging } from "@/firebase/messaging";

export const notificationService = {
  async enablePush(uid: string) {
    if (!uid) throw new Error("No user ID provided");

    if (typeof window === 'undefined') return;

    // Detección específica para iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isIOS && !isStandalone) {
      throw new Error("En iPhone, debes añadir esta web a tu pantalla de inicio ('Compartir' -> 'Añadir a pantalla de inicio') para activar las notificaciones.");
    }

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      throw new Error("Tu navegador no soporta notificaciones push.");
    }

    // 1. Registrar Service Worker
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
    if (!messaging) throw new Error("FCM no inicializado o no soportado.");

    // 2. Pedir permiso
    const permission = await Notification.requestPermission();
    if (permission === "denied") {
      throw new Error("Permiso denegado. Por favor, actívalo en los ajustes de tu navegador para este sitio.");
    }

    // 3. Obtener Token
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
    try {
      const token = await getToken(messaging, { 
        vapidKey,
        serviceWorkerRegistration: registration 
      });
      
      if (!token) throw new Error("No se pudo generar el identificador del dispositivo.");

      console.log("[NotificationService] Token obtenido:", token.substring(0, 10) + "...");

      // 4. Guardar en Firestore
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token),
        fcmUpdatedAt: serverTimestamp(),
        "notificationPrefs.push": true
      });

      console.log("[NotificationService] Guardado en Firestore ok.");
      return token;
    } catch (error: any) {
      console.error("[NotificationService] Error en proceso:", error);
      throw new Error(error.message || "Error al vincular el dispositivo.");
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
