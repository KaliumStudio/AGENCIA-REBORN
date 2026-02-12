import { doc, updateDoc, arrayUnion, serverTimestamp, getDoc, arrayRemove } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { db, auth } from "@/lib/firebase";
import { getFcmMessaging } from "@/firebase/messaging";

export const notificationService = {
  /**
   * Habilita las notificaciones Push solicitando permisos y registrando el token.
   */
  async enablePush(uid: string) {
    if (!uid) throw new Error("No user ID provided");

    console.log("[NotificationService] Iniciando habilitación de push para:", uid);

    if (typeof window === 'undefined' || !('Notification' in window)) {
      throw new Error("Las notificaciones no están soportadas en este navegador.");
    }

    // 1. Registrar Service Worker de forma explícita si no existe
    let registration;
    try {
      registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (!registration) {
        console.log("[NotificationService] Registrando nuevo Service Worker...");
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }
      console.log("[NotificationService] Service Worker listo.");
    } catch (swError) {
      console.error("[NotificationService] Error Service Worker:", swError);
      throw new Error("Error al registrar el controlador de mensajes del navegador.");
    }

    const messaging = await getFcmMessaging();
    if (!messaging) {
      throw new Error("No se pudo inicializar el servicio de mensajería de Firebase.");
    }

    // 2. Pedir permiso
    const permission = await Notification.requestPermission();
    console.log("[NotificationService] Permiso del navegador:", permission);
    
    if (permission === "denied") {
      throw new Error("Permiso denegado. Debes habilitar las notificaciones en los ajustes del candado en la barra de direcciones.");
    }
    if (permission !== "granted") {
      throw new Error("Se requiere permiso para activar las notificaciones.");
    }

    // 3. Obtener Token
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
    if (!vapidKey) {
      throw new Error("Configuración incompleta: Falta VAPID Key.");
    }

    try {
      const token = await getToken(messaging, { 
        vapidKey,
        serviceWorkerRegistration: registration
      });
      
      if (!token) {
        throw new Error("No se pudo generar el token. Intenta recargar la página.");
      }

      console.log("[NotificationService] Token obtenido:", token.substring(0, 10) + "...");

      // 4. Guardar en Firestore
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token),
        fcmUpdatedAt: serverTimestamp(),
        "notificationPrefs.push": true
      });

      console.log("[NotificationService] Registro en Firestore exitoso.");
      return token;
    } catch (error: any) {
      console.error("[NotificationService] Error en getToken/Firestore:", error);
      throw new Error(error.message || "Error al registrar el dispositivo.");
    }
  },

  /**
   * Desactiva las notificaciones y limpia los tokens.
   */
  async disablePush(uid: string) {
    if (!uid) return;
    const userRef = doc(db, "users", uid);
    
    // Opcionalmente podríamos intentar obtener el token actual para borrar solo ese,
    // pero por simplicidad y seguridad de "limpieza total" de prefs:
    await updateDoc(userRef, {
      fcmTokens: [], // Limpia todos los tokens de este usuario
      "notificationPrefs.push": false,
      fcmUpdatedAt: serverTimestamp()
    });
    console.log("[NotificationService] Notificaciones desactivadas para:", uid);
  },

  /**
   * Verifica el estado del permiso del navegador.
   */
  getPermissionStatus() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }
};
