const CACHE_NAME = 'cache';
const CACHE_LIST = [
    './cache.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CACHE_LIST);
        })
    );
});

self.addEventListener('fetch', event => {
    const requestURL = new URL(event.request.url);

    if (requestURL.origin !== location.origin) return;

    if (requestURL.pathname.endsWith("index.html")) {
        event.respondWith(fetch(event.request.url));

        return;
    }

    if (event.request.destination !== 'document') {
        event.respondWith(fetch(event.request.url));

        return;
    }

    const encodeStream = new TextEncoderStream();
    const stream = new ReadableStream({
        async start(controller) {
            let html = await caches.match('cache.html').then(res => res.text());
            const chunkSize = 1;
            let pos = 0;

            function push() {
                if (pos >= html.length) {
                    controller.close();
                    return;
                }

                controller.enqueue(html.slice(pos, pos + chunkSize));

                pos += chunkSize;
                setTimeout(push, 5);
            }

            push();
        }
    });

    event.respondWith(new Response(stream.pipeThrough(encodeStream), {
        headers: {'Content-Type': 'text/html'}
    }));
});
