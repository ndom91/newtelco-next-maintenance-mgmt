import React, { useEffect } from 'react'
import './style/app.css'
import './style/ntTheme.less'
import 'algolia-react-autocomplete/build/css/index.css'
import Head from 'next/head'
import ErrorBoundary from '@/newtelco/errorboundary'
import Store from '@/newtelco/store'
import { Provider } from 'next-auth/client'
const LogRocket = require('logrocket')

const App = ({ Component, pageProps }) => {
  const ConditionalWrap = ({ condition, wrap, children }) =>
    condition ? wrap(children) : children

  const { session } = pageProps

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === 'production') {
      if (typeof window !== 'undefined' && session) {
        LogRocket.init('ui2vht/next-maintenance')
        LogRocket.identify(session.user.id, {
          name: session.user.name,
          email: session.user.email,
        })
      }
    }
  }, [])

  return (
    <Provider session={pageProps.session}>
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
          <meta name='msapplication-TileColor' content='#67b246' />
          <meta name='theme-color' content='#eaeaea' />
          <meta name='application-name' content='Newtelco Maintenance' />
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta name='description' content='Newtelco Maintenance Management' />
          <meta name='format-detection' content='telephone=no' />
          <meta name='mobile-web-app-capable' content='yes' />
          <meta name='msapplication-TileColor' content='#67b246' />
          <meta name='msapplication-tap-highlight' content='no' />
          <meta name='theme-color' content='#eaeaea' />
          <meta
            name='apple-mobile-web-app-status-bar-style'
            content='default'
          />
          <meta
            name='apple-mobile-web-app-title'
            content='Newtelco Maintenance'
          />
          <meta
            name='viewport'
            content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
          />
          <link
            rel='apple-touch-icon'
            sizes='180x180'
            href='/static/images/favicon/apple-touch-icon.png'
          />
          <link rel='manifest' href='/manifest.json' />
          <link
            rel='mask-icon'
            href='/static/icons/safari-pinned-tab.svg'
            color='#67b246'
          />
          <link
            rel='shortcut icon'
            id='favicon'
            href='/static/images/favicon/favicon.ico'
          />
        </Head>
        <Store.Container>
          <Component {...pageProps} />
        </Store.Container>
      </ConditionalWrap>
    </Provider>
  )
}

export default App
