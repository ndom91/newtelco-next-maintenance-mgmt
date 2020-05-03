import React from 'react'
import Layout from '../components/layout'
import dynamic from 'next/dynamic'
import RequireLogin from '../components/require-login'
import { NextAuth } from 'next-auth/client'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import MaintPanel from '../components/panel'
import UnreadBadge from '../components/unread'
import {
  FlexboxGrid,
  Placeholder
} from 'rsuite'

const BarChart = dynamic(
  () => import('../components/homepage/barchart'),
  { ssr: false }
)
const Heatmap = dynamic(
  () => import('../components/homepage/heatmap'),
  { ssr: false }
)

const isServer = typeof window === "undefined";

export default class Index extends React.Component {
  static async getInitialProps ({ res, req, query }) {
    const pageRequest = `/v1/api/inbox/count`
    const fetchRes = await fetch(pageRequest, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
    const json = await fetchRes.json()
    const mail = { count: 0 }
    if (json !== 'No unread emails') {
      mail.count = json.count
    }
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
      jsonData: mail,
      night: query.night,
      session: await NextAuth.init({ req })
    }
  }

  componentWillUnmount () {
    clearInterval(this.unreadInterval)
  }

  onSearchSelection = selection => {
    const newLocation = `/maintenance?id=${selection.id}`
    Router.push(newLocation)
  }

  render () {
    if (this.props.session.user) {
      return (
        <Layout night={this.props.night} handleSearchSelection={this.onSearchSelection} session={this.props.session} count={this.props.jsonData.count}>
          <MaintPanel header='Maintenance'>
            <FlexboxGrid align='middle' justify='space-around' style={{ width: '100%' }}>
              <UnreadBadge count={this.props.jsonData.count} />
              {!isServer ? (
                <React.Suspense fallback={<Placeholder.Graph active height='320' width='600' />}>
                  <BarChart />
                </React.Suspense>
              ) : (
                null
              )}
            </FlexboxGrid>
            <FlexboxGrid align='middle' justify='space-around' style={{ width: '100%', padding: '50px' }}>
              <Heatmap />
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
}
