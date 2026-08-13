const filesToCache = [
	"Pinball.htm",
	"Pinball.json",
	"Pinball.png",
	"PinballFavIcon_16x16.png",
	"PinballFavIcon_192x192.png",
	"PinballFavIcon_512x512.png",
	"PinballGame.htm",
	"PinballGame.js",
	"PinballShare.png"
];

const staticCacheName = "Pinball-v2";

self.addEventListener("install", event => {
	event.waitUntil(
		caches.open(staticCacheName)
		.then(cache => {
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener("activate", event => {
	// Siivotaan vanhat versiot pois. Ilman tata haku osuisi yha vanhaan
	// valimuistiin, koska caches.match() etsii kaikista valimuisteista.
	event.waitUntil(
		caches.keys()
		.then(names => {
			return Promise.all(
				names.filter(name => name.startsWith("Pinball-") && name !== staticCacheName)
				.map(name => caches.delete(name))
			);
		})
	);
});

self.addEventListener("fetch", event => {
	event.respondWith(
		caches.match(event.request)
		.then(response => {
			if (response) {
				return response;
			}
			return fetch(event.request)
		}).catch(error => {
		})
	);
});