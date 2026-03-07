// Firebase Messaging Service Worker
// Handles push notifications when the app is in the background or closed.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC8X2ryugN6PJIkrK11QrYY04mA90lfdHw",
  authDomain: "alerta-plus.firebaseapp.com",
  projectId: "alerta-plus",
  storageBucket: "alerta-plus.firebasestorage.app",
  messagingSenderId: "956724663412",
  appId: "1:956724663412:web:8d8fb984ef3fe7bf3a6d21",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'Alerta+';
  const body = payload.notification?.body ?? 'Novo alerta na sua região';
  self.registration.showNotification(title, {
    body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200],
    data: payload.data ?? {},
  });
});
