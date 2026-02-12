importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Configuración de Firebase para el Service Worker
// Estos valores vienen de src/firebase/config.ts
firebase.initializeApp({
  apiKey: "AIzaSyCK2eGzq7rdG1ki-G6Asz-TsTHWdkPe3Nc",
  authDomain: "studio-7837102107-41ca8.firebaseapp.com",
  projectId: "studio-7837102107-41ca8",
  messagingSenderId: "607157941153",
  appId: "1:607157941153:web:4d083a830f7fbb252111e0"
});

const messaging = firebase.messaging();

// Manejador de mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano:', payload);
  
  const notificationTitle = payload.notification.title || "Nuevo mensaje";
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico', // Opcional: puedes añadir un icono aquí
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
