var staticCache = 'transport-info-v2';
var imagesCache = 'transport-imgs';

var allCaches = [
    staticCache,
    imagesCache
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all(
            [
                caches.open(staticCache).then((cache) => {
                    return cache.addAll([
                        '/',
                        'js/lib.js',
                        'js/main.js',
                        'css/lib.css',
                        'css/style.css'
                    ])
                }),
                caches.open(imagesCache).then((cache) => {
                    return cache.addAll([
                        'imgs/favicon.png',
                        'fonts/FontAwesome.otf',
                        'fonts/fontawesome-webfont.eot',
                        'fonts/fontawesome-webfont.svg',
                        'fonts/fontawesome-webfont.ttf?v=4.6.3',
                        'fonts/fontawesome-webfont.woff?v=4.6.3',
                        'fonts/fontawesome-webfont.woff2?v=4.6.3',
                        'gtfs/stops.json',
                        'gtfs/stop_times.json'
                    ])
                })
            ]
        )
    )
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => {
                    return !allCaches.includes(cacheName);
                }).map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    var requestUrl = new URL(event.request.url);
    if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname.startsWith('/imgs/')) {
            event.respondWith(serveAssets(event.request, imagesCache));
            return;
        }
        if (requestUrl.pathname.startsWith('/fonts/')) {
            event.respondWith(serveAssets(event.request, imagesCache));
            return;
        }
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    }
});
//1

self.addEventListener('message', (event) => {
   if (event.data.skipWait) {
       self.skipWaiting();
   }
});

function serveAssets(request, cacheName) {
    return caches.open(cacheName).then((cache) => {
        return cache.match(request).then((response) => {
            if (response) return response;
            return fetch(request).then((response) => {
                cache.put(request, response.clone());
                return response;
            });
        });
    });
}
