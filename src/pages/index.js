import React from 'react'
import Layout from '../components/layout'
import dynamic from 'next/dynamic'
import RequireLogin from '../components/require-login'
import { NextAuth } from 'next-auth/client'
import Router from 'next/router'
import MaintPanel from '../components/panel'
import UnreadBadge from '../components/unread'
import Store from '../components/store'
import {
  Loader
} from 'rsuite'
import './style/index.css'

const BarChart = dynamic(() => import('../components/homepage/barchart'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '342px', width: '327px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader />
    </div>
  )
})

const Heatmap = dynamic(() => import('../components/homepage/heatmap'))
const PerPerson = dynamic(() => import('../components/homepage/perperson'))
const ActiveMaintenances = dynamic(() => import('../components/homepage/active'))

const Index = props => {
  const store = Store.useStore()

  const onSearchSelection = selection => {
    const newLocation = `/maintenance?id=${selection.id}`
    Router.push(newLocation)
  }

  if (props.session.user) {
    return (
      <Layout night={props.night} handleSearchSelection={onSearchSelection} session={props.session}>
        <MaintPanel header='Maintenance'>
          <div className='grid-container'>
            <div className='unread'>
              <UnreadBadge count={store.get('count')} />
            </div>
            <div className='heatmap'>
              <Heatmap />
            </div>
            <div className='recents'>
              <ActiveMaintenances />
            </div>
            <div className='chart1'>
              <BarChart />
            </div>
            <div className='chart2'>
              <PerPerson />
            </div>
          </div>
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
