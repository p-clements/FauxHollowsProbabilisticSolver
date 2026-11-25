const CACHE = "fhs-v28";
const ASSETS = [
	"./",
	"./index.html",
	"./style.css?v=28",
	"./code.js?v=28",
	"./planner.js?v=28",
	"./planner-worker.js?v=28",
	"./data.js",
	"./manifest.json",
	"./images/blocked.png",
	"./images/missed.png",
	"./images/chest.png",
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
				// cache: "reload" skips the browser's HTTP cache, so a fresh install never stores
				// a stale index.html that still points at the previous version's files.
				return c.addAll(
					ASSETS.map(function (url) {
						return new Request(url, { cache: "reload" });
					})
				);
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

// Versioned files (?v=N) and images never change under the same URL, so serve them from the
// cache. Everything else (the page itself, data.js, manifest.json) can change without a new
// URL, so fetch it from the network first and fall back to the cached copy when offline.
function isCacheFirst(url) {
	return url.searchParams.has("v") || url.pathname.indexOf("/images/") !== -1;
}

function networkFirst(request) {
	return fetch(request, { cache: "no-cache" })
		.then(function (res) {
			if (res.ok) {
				var copy = res.clone();
				caches.open(CACHE).then(function (c) {
					c.put(request, copy);
				});
			}
			return res;
		})
		.catch(function () {
			return caches.match(request).then(function (cached) {
				if (cached || request.mode !== "navigate") return cached || Response.error();
				return caches.match("./index.html");
			});
		});
}

self.addEventListener("fetch", function (e) {
	if (e.request.method !== "GET") return;
	var url = new URL(e.request.url);
	if (url.origin !== self.location.origin) return;
	if (e.request.mode === "navigate" || !isCacheFirst(url)) {
		e.respondWith(networkFirst(e.request));
		return;
	}
	e.respondWith(
		caches.match(e.request).then(function (cached) {
			return cached || fetch(e.request);
		})
	);
});
