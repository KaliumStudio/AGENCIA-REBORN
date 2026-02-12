
// This script runs in the background to handle notifications when the app is not in focus.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// These values must be filled manually or during the build process if they change.
// Since we are in a prototyper, we use a template.
firebase.initializeApp({
  apiKey: "AIzaSyCK2eGzq7rdG1ki-G6Asz-TsTHWdkPe3Nc",
  projectId: "studio-7837102107-41ca8",
  messagingSenderId: "607157941153",
  appId: "1:607157941153:web:4d083a830f7fbb252111e0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || "Nuevo mensaje";
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico', // Fallback to favicon
    data: payload.data,
    tag: payload.data?.chatId || 'creativeflow-msg' // Group notifications by chat
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
