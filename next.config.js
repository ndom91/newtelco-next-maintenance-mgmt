const { parsed: localEnv } = require('dotenv').config({ path: './.env' })
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const dev = process.env.NODE_ENV === 'development'
const path = require('path')
const webpack = require('webpack')
const withCSS = require('@zeit/next-css')
const withLess = require('@zeit/next-less')
const withPWA = require('next-pwa')
const Dotenv = require('dotenv-webpack')
require('dotenv').config()

const SentryWebpackPlugin = require('@sentry/webpack-plugin')
const {
  NEXT_PUBLIC_SENTRY_DSN: SENTRY_DSN,
  SENTRY_ORG,
  SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN,
  NODE_ENV,
  VERCEL_GITHUB_COMMIT_SHA,
  VERCEL_GITLAB_COMMIT_SHA,
  VERCEL_BITBUCKET_COMMIT_SHA,
} = process.env

const COMMIT_SHA = VERCEL_GITHUB_COMMIT_SHA

process.env.SENTRY_DSN = SENTRY_DSN

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
  productionBrowserSourceMaps: true, // For Sentry
  experimental: {
    modern: true,
  },
  maximumFileSizeToCacheInBytes: 5242880,
  pwa: {
    dest: 'public',
    disable: dev,
    runtimeCaching: [
      {
        // MUST be the same as "start_url" in manifest.json
        urlPattern: '/',
        // use NetworkFirst or NetworkOnly if you redirect un-authenticated user to login page
        // use StaleWhileRevalidate if you want to prompt user to reload when new version available
        handler: 'NetworkFirst',
        options: {
          // don't change cache name
          cacheName: 'start-url',
          expiration: {
            maxEntries: 1,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
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
    if (!isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/react'
    }
    if (
      SENTRY_DSN &&
      SENTRY_ORG &&
      SENTRY_PROJECT &&
      SENTRY_AUTH_TOKEN &&
      COMMIT_SHA &&
      NODE_ENV === 'production'
    ) {
      config.plugins.push(
        new SentryWebpackPlugin({
          include: '.next',
          ignore: ['node_modules'],
          urlPrefix: '~/_next',
          release: COMMIT_SHA,
          org: 'newtelco-gmbh',
          project: 'next-maintenance',
        })
      )
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
