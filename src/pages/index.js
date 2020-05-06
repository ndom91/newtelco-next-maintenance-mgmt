import React from 'react'
import Layout from '../components/layout'
import dynamic from 'next/dynamic'
import RequireLogin from '../components/require-login'
import { NextAuth } from 'next-auth/client'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import MaintPanel from '../components/panel'
import UnreadBadge from '../components/unread'
import Store from '../components/store'
import {
  FlexboxGrid,
  Placeholder,
  Loader
} from 'rsuite'

const BarChart = React.lazy(() => import('../components/homepage/barchart'))
const Heatmap = React.lazy(() => import('../components/homepage/heatmap'))

const isServer = typeof window === "undefined";

const Index = props => {
  const store = Store.useStore()

  const onSearchSelection = selection => {
    const newLocation = `/maintenance?id=${selection.id}`
    Router.push(newLocation)
  }

  if (props.session.user) {
    return (
      <Layout night={props.night} handleSearchSelection={onSearchSelection} session={props.session} >
        <MaintPanel header='Maintenance'>
          <FlexboxGrid align='middle' justify='space-around' style={{ width: '100%' }}>
            <UnreadBadge count={store.get('count')} />
            {!isServer ? (
              <React.Suspense fallback={<Placeholder.Graph height='375px' width='640px' />}>
                <BarChart />
              </React.Suspense>
            ) : (
              null
            )}
          </FlexboxGrid>
          <FlexboxGrid align='middle' justify='space-around' style={{ width: '100%', padding: '50px' }}>
            {!isServer ? (
              <React.Suspense fallback={<Placeholder.Graph active height='165px' style={{ maxWidth: '1300px' }} />}>
                <Heatmap />
              </React.Suspense>
            ) : (
              null
            )}
          </FlexboxGrid>
        </MaintPanel>
      </Layout>
    )
  } else {
    return (
      <RequireLogin />
    )
  }
}

Index.getInitialProps = async ({ req, res }) => {
  if (req && !req.user) {
    if (res) {
      res.writeHead(302, {
        Location: '/auth'
      })
      res.end()
    } else {
      Router.push('/auth')
    }
  }
  return {
    // night: req.query.night,
    session: await NextAuth.init({ req })
  }
}

export default Index