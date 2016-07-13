var staticCache = 'transport-info-v11';
var imagesCache = 'transport-imgs';

var allCaches = [
    staticCache,
    imagesCache
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(imagesCache).then((cache) => {
            return cache.addAll([
                'imgs/favicon.png',
                'fonts/FontAwesome.otf',
                'fonts/fontawesome-webfont.eot',
                'fonts/fontawesome-webfont.svg',
                'fonts/fontawesome-webfont.ttf',
                'fonts/fontawesome-webfont.woff',
                'fonts/fontawesome-webfont.woff2'
            ])
        })
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
        if (requestUrl.pathname.indexOf('/imgs/') != -1) {
            event.respondWith(serveAssets(event.request, imagesCache));
            return;
        }
        if (requestUrl.pathname.indexOf('/js/') != -1 || requestUrl.pathname.indexOf('/css/') != -1 || requestUrl.pathname.indexOf('/fonts/') != -1) {
            event.respondWith(serveAssets(event.request, staticCache));
            return;
        }
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    }
});


self.addEventListener('message', (event) => {
   if (event.data.skipWait) {
       self.skipWaiting();
   }
});

function serveAssets(request, cacheName) {
    var url = request.url;

    return caches.open(cacheName).then((cache) => {
        return cache.match(url).then((response) => {
            if (response) return response;
            return fetch(request).then((response) => {
                cache.put(url, response.clone());
                return response;
            });
        });
    });
}
