import React from 'react'
import App from 'next/app'
import Head from 'next/head'
import './style/app.css'
import bugsnag from '@bugsnag/js'
import bugsnagReact from '@bugsnag/plugin-react'

const bugsnagClient = bugsnag('cccea6dd356e289efb3eb14ddc48bc43')
bugsnagClient.use(bugsnagReact, React)
const ErrorBoundary = bugsnagClient.getPlugin('react')

class MyApp extends App {
  // Only uncomment this method if you have blocking data requirements for
  // every single page in your application. This disables the ability to
  // perform automatic static optimization, causing every page in your app to
  // be server-side rendered.
  //
  // static async getInitialProps(appContext) {
  //   // calls page's `getInitialProps` and fills `appProps.pageProps`
  //   const appProps = await App.getInitialProps(appContext);
  //
  //   return { ...appProps }
  // }

  render () {
    const { Component, pageProps } = this.props

    return (
      <ErrorBoundary>
        <Head>
          <title>Newtelco Maintenance - NextJS</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' />
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css' integrity='sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm' crossOrigin='anonymous' />
        </Head>
        <Component {...pageProps} />
        <style jsx global>{`
          .content {
            margin: 80px 4em 0 4em;
            display: flex;
            justify-content: flex-start;

          }
        `}
        </style>
      </ErrorBoundary>
    )
  }
}

export default MyApp
