// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA4NndmuQHTCKh7IyQYAz3DL_r8mttyRYg",
  authDomain: "digitalliberia-notification.firebaseapp.com",
  projectId: "digitalliberia-notification",
  storageBucket: "digitalliberia-notification.appspot.com",
  messagingSenderId: "537791418352",
  appId: "1:537791418352:web:378b48439b2c9bed6dd735"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.data?.title || 'Digital Liberia';
  const notificationOptions = {
    body: payload.data?.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: payload.data,
    actions: [
      {
        action: 'approve',
        title: 'Approve',
        icon: '/approve-icon.png'
      },
      {
        action: 'deny',
        title: 'Deny',
        icon: '/deny-icon.png'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'approve') {
    // Handle approve action
    const challengeId = event.notification.data?.challengeId;
    if (challengeId) {
      // Send approval to backend
      fetch('https://libpayapp.liberianpost.com:8081/gov-services/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: challengeId,
          action: 'approved'
        })
      });
    }
  } else if (event.action === 'deny') {
    // Handle deny action
    const challengeId = event.notification.data?.challengeId;
    if (challengeId) {
      fetch('https://libpayapp.liberianpost.com:8081/gov-services/deny', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: challengeId,
          action: 'denied'
        })
      });
    }
  } else {
    // Default click behavior
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
