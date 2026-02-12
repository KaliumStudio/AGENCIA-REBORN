
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Los valores se inyectarán o deben coincidir con la config de firebase/config.ts
// En un SW, se prefiere hardcodear o pasar vía parámetros si fuera dinámico.
firebase.initializeApp({
  apiKey: "AIzaSyCK2eGzq7rdG1ki-G6Asz-TsTHWdkPe3Nc",
  authDomain: "studio-7837102107-41ca8.firebaseapp.com",
  projectId: "studio-7837102107-41ca8",
  storageBucket: "studio-7837102107-41ca8.firebasestorage.app",
  messagingSenderId: "607157941153",
  appId: "1:607157941153:web:4d083a830f7fbb252111e0"
});

const messaging = firebase.messaging();

// Handler para mensajes cuando la app está en segundo plano o cerrada
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano:', payload);

  const notificationTitle = payload.notification.title || 'Nuevo mensaje';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png', // Asegúrate de que este icono exista o usa uno genérico
    data: payload.data, // Aquí viene el chatId, url, etc.
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Al hacer click en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const chatId = event.notification.data?.chatId;
  const urlToOpen = chatId ? `/client/batches/${chatId}/chat` : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si ya hay una ventana abierta, enfocarla
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
