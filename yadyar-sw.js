/* یادیار — سرویس‌ورکر
   کروم اندروید نوتیفیکیشن را فقط از طریق سرویس‌ورکر نشان می‌دهد؛
   این فایل باید کنار yadyar-web-app.html آپلود شود (همان پوشه ریپو). */
const CACHE = 'yadyar-cache-v1';

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* نمایش نوتیفیکیشن با پیام از صفحه */
self.addEventListener('message', e => {
  const d = e.data || {};
  if(d.cmd === 'notify'){
    self.registration.showNotification(d.title || 'یادیار', {
      body: d.body || '', lang: 'fa', dir: 'rtl', tag: 'yadyar-' + Date.now()
    });
  }
});

/* کلیک روی نوتیف → باز کردن/فوکوس اپ */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for(const c of cs){ if('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  }));
});

/* کش برای کار آفلاین — پاسخ از کش، وگرنه از شبکه (و ذخیره در کش) */
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      try{
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }catch(err){}
      return res;
    }).catch(() => caches.match('./')))
  );
});
