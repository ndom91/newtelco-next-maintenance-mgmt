const { withSentryConfig } = require('@sentry/nextjs')
const SentryWebpackPluginOptions = {
  silent: true,
}

const nextConfig = {
  maximumFileSizeToCacheInBytes: 5242880,
  cssModules: true,
}

module.exports = withSentryConfig(nextConfig, SentryWebpackPluginOptions)
