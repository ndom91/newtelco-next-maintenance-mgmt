import React from 'react'
import App from 'next/app'
import Head from 'next/head'
import ErrorBoundary from '../src/components/errorboundary'
import './style/app.css'
import 'bootstrap/dist/css/bootstrap.min.css'
// import 'shards-ui/dist/css/shards.min.css'
import './style/shards.min.css'
const LogRocket = require('logrocket')
// const setupLogRocketReact = require('logrocket-react')
const Sentry = require('@sentry/browser')

export default class MyApp extends App {
  static async getInitialProps ({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    if (typeof window !== 'undefined') {
      LogRocket.init('ui2vht/next-maintenance')
      // setupLogRocketReact(LogRocket)
      LogRocket.identify(pageProps.session.user.id, {
        name: pageProps.session.user.name,
        email: pageProps.session.user.email
      })
      Sentry.init({ dsn: 'https://627b5da84c4944f4acc2118b47dad88e@sentry.ndo.dev/3' })
      LogRocket.getSessionURL(sessionURL => {
        Sentry.configureScope(scope => {
          scope.setExtra('sessionURL', sessionURL)
        })
      })
    }

    return { pageProps }
  }

  render () {
    const { Component, pageProps } = this.props

    return (
      <ErrorBoundary>
        <Head>
          <title>Newtelco Maintenance</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='apple-touch-icon' sizes='180x180' href='/static/images/favicon/apple-touch-icon.png' />
          <link rel='icon' id='favicon' type='image/png' sizes='32x32' href='/static/images/favicon/favicon-32x32.png' />
          <link rel='icon' type='image/png' sizes='16x16' href='/static/images/favicon/favicon-16x16.png' />
          <link rel='mask-icon' href='/static/images/favicon/safari-pinned-tab.svg' color='#5bbad5' />
          <meta name='msapplication-TileColor' content='#603cba' />
          <meta name='msapplication-config' content='/static/images/favicon/browserconfig.xml' />
          <meta name='theme-color' content='#ffffff' />
        </Head>
        <Component {...pageProps} />
        <style jsx global>{`
          :root {
            --primary: #67B246 !important;
          }
          .navbar {
            padding: 0 1.5rem;
          }
          body,
          .container,
          .container-fluid,
          .row {
            background: none;
          }
        `}
        </style>
      </ErrorBoundary>
    )
  }
}
