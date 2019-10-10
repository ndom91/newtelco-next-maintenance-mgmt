import React from 'react'
import App from 'next/app'
import Head from 'next/head'
import './style/app.css'
// import bugsnag from '@bugsnag/js'
// import bugsnagReact from '@bugsnag/plugin-react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'shards-ui/dist/css/shards.min.css'
// const bugsnagClient = bugsnag('cccea6dd356e289efb3eb14ddc48bc43')
// bugsnagClient.use(bugsnagReact, React)

export default class MyApp extends App {
  static async getInitialProps ({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  render () {
    const { Component, pageProps } = this.props

    return (
    // <ErrorBoundary>
      <>
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
      </>
    // </ErrorBoundary>
    )
  }
}
