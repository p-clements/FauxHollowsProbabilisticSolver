const CACHE = "fhs-v21";
const ASSETS = [
	"./",
	"./index.html",
	"./style.css?v=21",
	"./code.js?v=21",
	"./data.js",
	"./manifest.json",
	"./images/blocked.png",
	"./images/missed.png",
	"./images/chest.png",
	"./images/present.png",
	"./images/swords.png",
	"./images/fox.png",
	"./images/erase.png",
	"./images/prediction.png",
	"./images/verified.png",
	"./images/sighting.png",
	"./images/logo.png",
	"./images/apple-touch-icon.png",
	"./images/icon-192.png",
	"./images/icon-512.png"
];

self.addEventListener("install", function (e) {
	e.waitUntil(
		caches
			.open(CACHE)
			.then(function (c) {
				return c.addAll(ASSETS);
			})
			.then(function () {
				return self.skipWaiting();
			})
	);
});

self.addEventListener("activate", function (e) {
	e.waitUntil(
		caches
			.keys()
			.then(function (keys) {
				return Promise.all(
					keys
						.filter(function (k) {
							return k !== CACHE;
						})
						.map(function (k) {
							return caches.delete(k);
						})
				);
			})
			.then(function () {
				return self.clients.claim();
			})
	);
});

self.addEventListener("fetch", function (e) {
	if (e.request.method !== "GET") return;
	e.respondWith(
		caches.match(e.request).then(function (cached) {
			return (
				cached ||
				fetch(e.request).then(function (res) {
					return res;
				})
			);
		})
	);
});
