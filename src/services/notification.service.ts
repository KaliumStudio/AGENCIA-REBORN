import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { db } from "@/lib/firebase";
import { getFcmMessaging } from "@/firebase/messaging";

export const notificationService = {
  /**
   * Requests permission and registers the FCM token for the current user.
   */
  async registerPushToken(uid: string) {
    if (!uid) throw new Error("No user ID provided");

    // Check if notifications are supported
    if (typeof window === 'undefined' || !('Notification' in window)) {
      throw new Error("Las notificaciones no están soportadas en este navegador.");
    }

    const messaging = await getFcmMessaging();
    if (!messaging) {
      throw new Error("No se pudo inicializar el servicio de mensajería.");
    }

    // Request browser permission
    const permission = await Notification.requestPermission();
    if (permission === "denied") {
      throw new Error("Permiso denegado. Por favor, habilita las notificaciones en la configuración de tu navegador para este sitio.");
    }
    if (permission !== "granted") {
      throw new Error("Se requiere permiso para activar las notificaciones.");
    }

    // Get FCM token
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
    if (!vapidKey) {
      console.error("Missing NEXT_PUBLIC_VAPID_KEY environment variable");
      throw new Error("Error de configuración: Falta VAPID Key.");
    }

    try {
      const token = await getToken(messaging, { vapidKey });
      
      if (!token) {
        throw new Error("No se pudo generar el token. Verifica que el Service Worker esté registrado.");
      }

      // Store token in Firestore as an array for the user
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token),
        fcmUpdatedAt: serverTimestamp(),
        "notificationPrefs.push": true
      });

      return token;
    } catch (error: any) {
      console.error("FCM Registration error:", error);
      if (error.code === 'messaging/permission-blocked') {
        throw new Error("Las notificaciones están bloqueadas por el navegador.");
      }
      throw new Error(error.message || "Error al registrar el dispositivo.");
    }
  },

  /**
   * Checks current permission status.
   */
  getPermissionStatus() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }
};
