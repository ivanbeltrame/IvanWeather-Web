const cacheVersion = "v38";
const statiCache = "site-static-" + cacheVersion;
const dynamicCache = "site-dynamic-" + cacheVersion;

const pages = [
    "/fallback",
    "404"
];

const pagesFullURL = [
    "/fallback.html",
    "/404.html"
];

const jsS = [
    "/js/app.js",
    "/js/main.js",
    "/js/forecast.js"
]

const cssS = [
    "/style.css"
];

const imgs = [
    "/img/icon38.png",
    "/img/icon48.png",
    "/img/icon72.png",
    "/img/icon96.png",
    "/img/icon144.png",
    "/img/icon192.png",
    "/img/icon512.png",
    "/img/icon640.png",
    "/img/favicon96.png",
    "/img/IvanWeather.png",
    "/img/IvanWeather.svg",
    "/img/fallback.jpg",
    "/img/404.jpg",
    "/img/cat-error.jpg",
    "/img/loading.gif",
    "/img/OpenWeather-Master-Logo-RGB.png"
];
const files = [
    "/manifest.json"
];
const thirdParty = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
    "https://openweathermap.org/img/wn/01d.png",
    "https://openweathermap.org/img/wn/01n.png",
    "https://openweathermap.org/img/wn/02d.png",
    "https://openweathermap.org/img/wn/02n.png",
    "https://openweathermap.org/img/wn/03d.png",
    "https://openweathermap.org/img/wn/03n.png",
    "https://openweathermap.org/img/wn/04d.png",
    "https://openweathermap.org/img/wn/04n.png",
    "https://openweathermap.org/img/wn/09d.png",
    "https://openweathermap.org/img/wn/09n.png",
    "https://openweathermap.org/img/wn/10d.png",
    "https://openweathermap.org/img/wn/10n.png",
    "https://openweathermap.org/img/wn/11d.png",
    "https://openweathermap.org/img/wn/11n.png",
    "https://openweathermap.org/img/wn/13d.png",
    "https://openweathermap.org/img/wn/13n.png",
    "https://openweathermap.org/img/wn/50d.png",
    "https://openweathermap.org/img/wn/50n.png",
];

// Cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
}

// Install service worker
self.addEventListener("install", evt => {
    console.log("Service worker has been installed");
    evt.waitUntil(
        caches.open(statiCache).then(cache => {
            console.log("Caching shell assets");
            cache.addAll(pages);
            cache.addAll(pagesFullURL);
            cache.addAll(jsS);
            cache.addAll(cssS);
            cache.addAll(imgs);
            cache.addAll(thirdParty);
            cache.addAll(files);
        })
    );
});

// Activate service worker event
self.addEventListener("activate", evt => {
    console.log("Service worker has been activated");
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== statiCache && key !== dynamicCache)
                .map(key => caches.delete(key))
            );
        })
    );
});

// Fetch to service worker event
self.addEventListener("fetch", evt => {
    console.log("Fetch event", evt);
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fetchRes => {
            // return fetch(evt.request).then(fetchRes => {
                return caches.open(dynamicCache).then(cache => {
                    // cache.put(evt.request.url, fetchRes.clone());
                    limitCacheSize(dynamicCache, 50);
                    return fetchRes;
                })
            });
        }).catch(() => {
            if (evt.request.headers.get("accept").includes("text/html")) {
                return caches.match("/fallback.html");
            }
        })
    );
});