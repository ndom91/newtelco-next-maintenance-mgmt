const { parsed: localEnv } = require('dotenv').config({ path: './.env' })
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const dev = process.env.NEXT_PUBLIC_ENV === 'development'
const path = require('path')
const webpack = require('webpack')
const withCSS = require('@zeit/next-css')
const withLess = require('@zeit/next-less')
const withPWA = require('next-pwa')
const Dotenv = require('dotenv-webpack')
require('dotenv').config()

function HACK_removeMinimizeOptionFromCssLoaders(config) {
  // console.warn(
  //   'HACK: Removing `minimize` option from `css-loader` entries in Webpack config'
  // )
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

const nextConfig = {
  target: 'server',
  compress: false,
  experimental: {
    modern: true,
  },
  pwa: {
    dest: 'public',
    disable: dev,
    // register: true
    // scope: '/',
    // sw: 'sw.js',
    // modifyURLPrefix: {
    //   '.next': '/_next'
    // }
    // clientsClaim: true,
    // skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /api/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'next-api',
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 60,
          },
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-image-assets',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /^https:\/\/api\.maintenance.newtelco.de\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api',
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 60,
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/use\.fontawesome\.com\/releases\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'font-awesome',
          expiration: {
            maxEntries: 1,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
          },
        },
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-font-assets',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        urlPattern: /\.(?:js)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-js-assets',
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:css|less)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-style-assets',
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'others',
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
    ],
  },
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  webpack(config, { isServer, buildId, dev }) {
    config.plugins.push(new webpack.EnvironmentPlugin(localEnv))
    HACK_removeMinimizeOptionFromCssLoaders(config)
    config.stats = {
      warningsFilter: warn => warn.indexOf('Conflicting order between:') > -1,
    }
    // eslint-disable-next-line
    new Dotenv({
      path: path.join(__dirname, '.env'),
      systemvars: true,
    })
    return config
  },
}

module.exports = withBundleAnalyzer(withPWA(withLess(withCSS(nextConfig))))
