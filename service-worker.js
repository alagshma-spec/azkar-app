/**
 * service-worker.js
 * يخزّن كل ملفات التطبيق محليًا (Cache) عند أول زيارة، ويقدّمها من الجهاز
 * مباشرة بعدها — يعني التطبيق يشتغل بالكامل بدون إنترنت من الزيارة الثانية.
 *
 * مهم: كل ما تضيف صفحة أو ملف جديد للمشروع، لازم تضيفه بقائمة APP_FILES تحت،
 * وترفع رقم CACHE_VERSION عشان الأجهزة تحمّل النسخة الجديدة.
 */

const CACHE_VERSION = 'azkar-v1';

const APP_FILES = [
  './',
  'index.html',
  'dhikr.html',
  'search.html',
  'favorites.html',
  'settings.html',
  'stats.html',
  'tasbeeh.html',
  'manifest.json',

  'css/variables.css',
  'css/base.css',
  'css/components.css',
  'css/layout.css',

  'js/icons.js',
  'js/storage.js',
  'js/toast.js',
  'js/stats.js',
  'js/settings-init.js',
  'js/settings.js',
  'js/app.js',
  'js/dhikr.js',
  'js/search.js',
  'js/favorites.js',
  'js/tasbeeh.js',

  'data/azkar/categories.json',
  'data/azkar/morning.json',
  'data/azkar/evening.json',
  'data/azkar/sleep.json',
  'data/azkar/wakeup.json',
  'data/azkar/after_prayer.json',
  'data/azkar/mosque.json',
  'data/azkar/home.json',
  'data/azkar/food.json',
  'data/azkar/travel.json',
  'data/azkar/ruqyah.json',

  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-apple-touch.png'
];

/* ---------- التثبيت: تحميل كل الملفات وتخزينها ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

/* ---------- التفعيل: حذف أي نسخة قديمة من الكاش ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ---------- الجلب: الكاش أولًا، والشبكة كخطة بديلة ---------- */
self.addEventListener('fetch', (event) => {
  // نتجاهل طلبات الخطوط الخارجية (Google Fonts) — تفشل بهدوء بدون إنترنت
  // ويعود المتصفح تلقائيًا للخط الاحتياطي (serif/sans-serif) بدون كسر الصفحة
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // تخزين أي ملف جديد يُطلب مستقبلاً (تحديث تدريجي للكاش)
        const clone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // لا يوجد اتصال ولا نسخة محفوظة — لا شيء نقدر نقدّمه لهذا الملف تحديدًا
        return new Response('غير متوفر بدون إنترنت', { status: 503 });
      });
    })
  );
});
