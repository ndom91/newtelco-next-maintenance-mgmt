const { parsed: localEnv } = require('dotenv').config({ path: './.env' })
const webpack = require('webpack')
const withCSS = require('@zeit/next-css')
require('dotenv').config()
const path = require('path')
const Dotenv = require('dotenv-webpack')
// const NextWorkboxPlugin = require('next-workbox-webpack-plugin')
// const WebpackPwaManifest = require('webpack-pwa-manifest')
const withPWA = require('next-pwa')

function HACK_removeMinimizeOptionFromCssLoaders (config) {
  console.warn(
    'HACK: Removing `minimize` option from `css-loader` entries in Webpack config'
  )
  config.module.rules.forEach(rule => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach(u => {
        if (u.loader === 'css-loader' && u.options) {
          delete u.options.minimize
        }
      })
    }
  })
}

// const workboxOptions = {
//   clientsClaim: true,
//   skipWaiting: true,
//   globPatterns: ['.next/static/*', '.next/static/commons/*'],
//   modifyUrlPrefix: {
//     '.next': '/_next'
//   },
//   runtimeCaching: [
//     {
//       urlPattern: '/',
//       handler: 'networkFirst',
//       options: {
//         cacheName: 'html-cache'
//       }
//     },
//     {
//       urlPattern: /[^3]\/api\//,
//       handler: 'networkFirst',
//       options: {
//         cacheName: 'html-cache'
//       }
//     },
//     {
//       urlPattern: new RegExp('^https://api.maintenance.newtelco.de'),
//       handler: 'staleWhileRevalidate',
//       options: {
//         cacheName: 'api-cache',
//         cacheableResponse: {
//           statuses: [200]
//         }
//       }
//     },
//     {
//       urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif)/,
//       handler: 'cacheFirst',
//       options: {
//         cacheName: 'image-cache',
//         cacheableResponse: {
//           statuses: [0, 200]
//         }
//       }
//     }
//   ]
// }

const nextConfig = {
  target: 'server',
  compress: false,
  pwa: {
    dest: 'public',
    register: true,
    scope: '/',
    sw: 'sw.js'
  },
  experimental: {
    publicDirectory: true
  },
  // generateInDevMode: true,
  // workboxOpts: {
  //   swDest: 'static/service-worker.js',
  //   modifyUrlPrefix: {
  //     app: 'static'
  //   },
  //   runtimeCaching: [
  //     {
  //       urlPattern: /^https?.*/,
  //       handler: 'NetworkFirst',
  //       options: {
  //         cacheName: 'https-calls',
  //         networkTimeoutSeconds: 15,
  //         expiration: {
  //           maxEntries: 150,
  //           maxAgeSeconds: 30 * 24 * 60 * 60 // 1 month
  //         },
  //         cacheableResponse: {
  //           statuses: [0, 200]
  //         }
  //       }
  //     }
  //   ]
  // },
  // transformManifest: manifest => ['/'].concat(manifest),
  exportPathMap: function () {
    return {
      '/': { page: '/' }
    }
  },
  webpack (config, { isServer, buildId, dev }) {
    config.plugins.push(new webpack.EnvironmentPlugin(localEnv))
    HACK_removeMinimizeOptionFromCssLoaders(config)
    // Read the .env file
    new Dotenv({
      path: path.join(__dirname, '.env'),
      systemvars: true
    })
    // if (!isServer && !dev) {
    //   config.plugins.push(
    //     new NextWorkboxPlugin({
    //       buildId,
    //       ...workboxOptions
    //     }),
    //     new WebpackPwaManifest({
    //       filename: 'public/manifest.json',
    //       name: 'Newtelco Maintenance',
    //       short_name: 'Next-Maintenance',
    //       description: 'A NewTelco Maintenance Management Application',
    //       background_color: '#67B246',
    //       theme_color: '#5755d9',
    //       display: 'standalone',
    //       orientation: 'portrait',
    //       fingerprints: false,
    //       inject: false,
    //       start_url: '/',
    //       ios: {
    //         'apple-mobile-web-app-title': 'Newtelco Maintenance',
    //         'apple-mobile-web-app-status-bar-style': '#5755d9'
    //       },
    //       icons: [
    //         {
    //           src: path.resolve('static/images/favicon/android-chrome-512x512.png'),
    //           sizes: [96, 128, 192, 256, 384, 512],
    //           destination: '/static'
    //         }
    //       ],
    //       includeDirectory: true,
    //       publicPath: '..'
    //     })
    //   )
    // }
    return config
  }
}

module.exports = withPWA(withCSS(nextConfig))
