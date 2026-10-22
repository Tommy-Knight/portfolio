// Pass-through service worker. It exists only so browsers offer "Install":
// it caches nothing, so every load gets the latest deploy.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
