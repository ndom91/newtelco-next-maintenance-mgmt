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
// const ErrorBoundary = bugsnagClient.getPlugin('react')

class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props

    return (
    // <ErrorBoundary>
      <>
        <Head>
          <title>Newtelco Maintenance - NextJS</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' />
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

export default MyApp
