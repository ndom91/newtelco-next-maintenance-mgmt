import React from 'react'
import App from 'next/app'
import Head from 'next/head'
import ErrorBoundary from '../components/errorboundary'
import './style/app.css'
import './style/ntTheme.less'
import 'algolia-react-autocomplete/build/css/index.css'
import Store from '../components/store'
const LogRocket = require('logrocket')

export default class MaintApp extends App {
  static async getInitialProps ({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    if (process.browser && pageProps.session && pageProps.session.user) {
      LogRocket.init('ui2vht/next-maintenance')
      LogRocket.identify(pageProps.session.user.id, {
        name: pageProps.session.user.name,
        email: pageProps.session.user.email
      })
    }

    return { pageProps }
  }

  render () {
    const { Component, pageProps, router } = this.props

    return (
      <ErrorBoundary>
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
          {/* <script src='https://analytics.newtelco.dev/ingress/7e406c80-f4f1-40f4-8407-1b0493dc86d1/script.js'></script> */}
        </Head>
        <img src='https://analytics.newtelco.dev/ingress/7e406c80-f4f1-40f4-8407-1b0493dc86d1/pixel.gif' />
        <Store.Container>
          <Component {...pageProps} key={router.route} />
        </Store.Container>
      </ErrorBoundary>
    )
  }
}
