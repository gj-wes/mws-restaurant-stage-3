(function () {
  // cache name - updated when amended
  const CACHE_NAME = 'static-cache-v7';
  // assets to be cached
  const urlsToCache = [
    '.',
    'index.html',
    'restaurant.html',
    'css/styles.css',
    'js/idb.js',
    'js/idbhelper.js',
    'js/dbhelper.js',
    'js/main.js',
    'js/restaurant_info.js',
    'js/lazysizes.min.js',
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
    'img/6.jpg',
    'img/7.jpg',
    'img/8.jpg',
    'img/9.jpg',
    'img/10.jpg',
    'img/1.webp',
    'img/2.webp',
    'img/3.webp',
    'img/4.webp',
    'img/5.webp',
    'img/6.webp',
    'img/7.webp',
    'img/8.webp',
    'img/9.webp',
    'img/10.webp'
  ];

  // install service worker
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(urlsToCache);
        })
    );
  });

  // add event listener for fetch requests. checks cache for asset then will either return it or trigger fetch function
  self.addEventListener('fetch', (event) => {
    let req = event.request.clone();

    if (req.clone().method != "POST") {
      event.respondWith(
        caches.match(event.request)
          .then(response => {
            return response || fetchAndCache(event.request);
          })
      );
    }


  });

  // sends a fetch request for an item not in the cache and will add it to the cache before returning the response
  function fetchAndCache(url) {
    return fetch(url)
      .then(response => {
        return caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(url, response.clone());
            return response;
          })
      })
      .catch(error => {
        console.log('Request failed:', error);
      });
  }

})();