/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

importScripts(
  "precache.gJcGY_iurO_N1mYV0dPHA.5df2c0a05f6178d48412b5c8857c7168.js"
);

workbox.core.skipWaiting();

workbox.core.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "static/css/ag-grid.css",
    "revision": "ba916b1dd4dde0d0233e6d5322d433ab"
  },
  {
    "url": "static/css/ag-theme-material.css",
    "revision": "87805c0706c254640d1418eb316ab5c6"
  },
  {
    "url": "static/css/darkmode.css",
    "revision": "5ea7af5ae803f8853310bedb7afce095"
  },
  {
    "url": "static/images/avatars/ALI.png",
    "revision": "b3e2d712a3171fcc74ebf46e379c5618"
  },
  {
    "url": "static/images/avatars/avatar1.svg",
    "revision": "628ad5c5cfe38d604d0ee067155f983d"
  },
  {
    "url": "static/images/avatars/avatar2.svg",
    "revision": "6d627573e28bd8291ee5ca098a5912d4"
  },
  {
    "url": "static/images/avatars/avatar3.svg",
    "revision": "6670fae2c14d5637c7aa804497ed0f2e"
  },
  {
    "url": "static/images/avatars/avatar4.svg",
    "revision": "038d3c02a941d09ba518f13a798c74de"
  },
  {
    "url": "static/images/avatars/avatar5.svg",
    "revision": "0c2c4e53fa8dde46a4511aba8536db4c"
  },
  {
    "url": "static/images/avatars/avatar6.svg",
    "revision": "192652353e49b34179f89d2939621760"
  },
  {
    "url": "static/images/avatars/FWA.png",
    "revision": "3d9dc3c7b55088c18571cd6736fa2b0a"
  },
  {
    "url": "static/images/avatars/NDO.png",
    "revision": "bf5d3a8fc52394aec4f51bb87eb69994"
  },
  {
    "url": "static/images/avatars/SST.png",
    "revision": "27189d02c1efcfa523f93c65c25159d3"
  },
  {
    "url": "static/images/error.svg",
    "revision": "bf8a3fa353f43dfcce0e26e047eb8ff6"
  },
  {
    "url": "static/images/favicon/android-chrome-192x192.png",
    "revision": "aee514fa74299beb32b9d030b50da45c"
  },
  {
    "url": "static/images/favicon/android-chrome-512x512.png",
    "revision": "7d8a2eb4a489b505a6d3a2a9340e1b45"
  },
  {
    "url": "static/images/favicon/apple-touch-icon.png",
    "revision": "b496a7642d6dae53038bff01c3f4f7cb"
  },
  {
    "url": "static/images/favicon/favicon-16x16.png",
    "revision": "66aa8f53053e39cf84f815025db04536"
  },
  {
    "url": "static/images/favicon/favicon-32x32.png",
    "revision": "d505bfca5477db3b580fd3697ccc194c"
  },
  {
    "url": "static/images/favicon/favicon.ico",
    "revision": "9207d6d7493ae82f74661ac05edae0a7"
  },
  {
    "url": "static/images/favicon/mstile-150x150.png",
    "revision": "dbcd091557a8ecb9b7133582e32381ed"
  },
  {
    "url": "static/images/icons/nt-128.png",
    "revision": "a7102ea8de399838538e0ccb84104d41"
  },
  {
    "url": "static/images/icons/nt-128.svg",
    "revision": "cf70ec2871c1c0860a22c6236421f5f2"
  },
  {
    "url": "static/images/icons/nt-16.png",
    "revision": "c29aacad3ce3bafb220f70a83bc9687b"
  },
  {
    "url": "static/images/icons/nt-256.png",
    "revision": "0ab91a9e34b654a29bf7d8d6c792e9b6"
  },
  {
    "url": "static/images/icons/nt-32.png",
    "revision": "218a5788aaa559c670987588ef077e4d"
  },
  {
    "url": "static/images/icons/nt-512.png",
    "revision": "6d540ce53fe08ca6fbab50278fe30f9d"
  },
  {
    "url": "static/images/icons/nt-64.png",
    "revision": "38283152623eaea04175b90c458eabcd"
  },
  {
    "url": "static/images/inbox0.svg",
    "revision": "732f610bb9fb96404829e9fc069801e2"
  },
  {
    "url": "static/images/nt-black.png",
    "revision": "3ff81ed46f04e41749939d9b8df0d093"
  },
  {
    "url": "static/manifest.json",
    "revision": "b98748f9b1afd92355a2f50a82e2972e"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.precaching.cleanupOutdatedCaches();

workbox.routing.registerRoute(/api/i, new workbox.strategies.NetworkFirst({ "cacheName":"api", plugins: [new workbox.expiration.Plugin({ maxEntries: 16, maxAgeSeconds: 60, purgeOnQuotaError: false })] }), 'GET');
workbox.routing.registerRoute(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i, new workbox.strategies.CacheFirst({ "cacheName":"google-fonts", plugins: [new workbox.expiration.Plugin({ maxEntries: 4, maxAgeSeconds: 31536000, purgeOnQuotaError: false })] }), 'GET');
workbox.routing.registerRoute(/^https:\/\/use\.fontawesome\.com\/releases\/.*/i, new workbox.strategies.CacheFirst({ "cacheName":"font-awesome", plugins: [new workbox.expiration.Plugin({ maxEntries: 1, maxAgeSeconds: 31536000, purgeOnQuotaError: false })] }), 'GET');
workbox.routing.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i, new workbox.strategies.StaleWhileRevalidate({ "cacheName":"static-font-assets", plugins: [new workbox.expiration.Plugin({ maxEntries: 4, maxAgeSeconds: 604800, purgeOnQuotaError: false })] }), 'GET');
workbox.routing.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i, new workbox.strategies.StaleWhileRevalidate({ "cacheName":"static-image-assets", plugins: [new workbox.expiration.Plugin({ maxEntries: 64, maxAgeSeconds: 86400, purgeOnQuotaError: false })] }), 'GET');
workbox.routing.registerRoute(/\.(?:js)$/i, new workbox.strategies.StaleWhileRevalidate({ "cacheName":"static-js-assets", plugins: [new workbox.expiration.Plugin({ maxEntries: 16, maxAgeSeconds: 86400, purgeOnQuotaError: false })] }), 'GET');
workbox.routing.registerRoute(/\.(?:css|less)$/i, new workbox.strategies.StaleWhileRevalidate({ "cacheName":"static-style-assets", plugins: [new workbox.expiration.Plugin({ maxEntries: 16, maxAgeSeconds: 86400, purgeOnQuotaError: false })] }), 'GET');
workbox.routing.registerRoute(/.*/i, new workbox.strategies.StaleWhileRevalidate({ "cacheName":"others", plugins: [new workbox.expiration.Plugin({ maxEntries: 16, maxAgeSeconds: 86400, purgeOnQuotaError: false })] }), 'GET');
