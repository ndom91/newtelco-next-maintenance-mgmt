import React, { useEffect } from 'react'
import './style/app.css'
import './style/ntTheme.less'
import 'algolia-react-autocomplete/build/css/index.css'
import Head from 'next/head'
import ErrorBoundary from '@/newtelco/errorboundary'
import Store from '@/newtelco/store'
import NextAuth from 'next-auth/client'
// import * as Sentry from '@sentry/browser'
// const LogRocket = require('logrocket')

export default ({ Component, pageProps }) => {
  const ConditionalWrap = ({ condition, wrap, children }) => (
    condition ? wrap(children) : children
  )

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === 'production') {
      if (process.browser && pageProps.session && pageProps.session.user) {
        // LogRocket.init('ui2vht/next-maintenance')
        // LogRocket.identify(pageProps.session.user.id, {
        //   name: pageProps.session.user.name,
        //   email: pageProps.session.user.email
        // })
        // Sentry setup: https://github.com/zeit/next.js/blob/canary/examples/with-sentry-simple/
        // Sentry.init({
        //   enabled: process.env.NODE_ENV === 'production',
        //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        // })
      }
    }
  }, [])

  return (
    <NextAuth.Provider>
      <ConditionalWrap
        condition={process.env.NEXT_PUBLIC_ENV === 'production'}
        wrap={children => (
          <ErrorBoundary>
            {children}
            <img src='https://analytics.newtelco.dev/ingress/7e406c80-f4f1-40f4-8407-1b0493dc86d1/pixel.gif' />
          </ErrorBoundary>
        )}
      >
        <Head>
          <title>Newtelco Maintenance</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='apple-touch-icon' sizes='180x180' href='/static/images/favicon/apple-touch-icon.png' />
          <link rel='mask-icon' href='/static/images/favicon/safari-pinned-tab.svg' color='#5bbad5' />
          <meta name='msapplication-TileColor' content='#603cba' />
          <meta name='theme-color' content='#ffffff' />
          <meta name='application-name' content='Newtelco Maintenance' />
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta name='apple-mobile-web-app-status-bar-style' content='default' />
          <meta name='apple-mobile-web-app-title' content='Newtelco Maintenance' />
          <meta name='description' content='Newtelco Maintenance Management' />
          <meta name='format-detection' content='telephone=no' />
          <meta name='mobile-web-app-capable' content='yes' />
          <meta name='msapplication-TileColor' content='#2B5797' />
          <meta name='msapplication-tap-highlight' content='no' />
          <meta name='theme-color' content='#000000' />
          <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover' />
          <link rel='apple-touch-icon' sizes='180x180' href='/static/images/favicon/apple-touch-icon.png' />
          <link rel='manifest' href='/manifest.json' />
          <link rel='mask-icon' href='/static/icons/safari-pinned-tab.svg' color='#5bbad5' />
          <link rel='shortcut icon' id='favicon' href='/static/images/favicon/favicon.ico' />
        </Head>
        <Store.Container>
          <Component {...pageProps} />
        </Store.Container>
      </ConditionalWrap>
    </NextAuth.Provider>
  )
}

export function reportWebVitals(metric) {
  if (process.env.NEXT_PUBLIC_VITALS) {
    console.table('metrics', metric.name, metric.value)
  }
}