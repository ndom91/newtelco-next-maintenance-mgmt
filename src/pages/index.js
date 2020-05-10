import React from 'react'
import Layout from '../components/layout'
import dynamic from 'next/dynamic'
import RequireLogin from '../components/require-login'
import NextAuth from 'next-auth/client'
import MaintPanel from '../components/panel'
import UnreadBadge from '../components/unread'
import Store from '../components/store'
import {
  Loader,
  Panel,
  Icon
} from 'rsuite'
import './style/index.css'

const AreaChart = dynamic(() => import('../components/homepage/areachart'), {
  ssr: false,
  loading: () => (
    <Panel bordered header={<div style={{ display: 'flex', justifyContent: 'space-between' }}>Completed<Icon icon='bar-chart' style={{ color: 'var(--primary)' }} size='lg' /></div>} style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '200px' }}>
        <Loader />
      </div>
    </Panel>
  )
})

const Heatmap = dynamic(() => import('../components/homepage/heatmap'))
const BarChart = dynamic(() => import('../components/homepage/perperson'))
const ActiveMaintenances = dynamic(() => import('../components/homepage/active'))

const Index = ({ session }) => {
  const store = Store.useStore()

  if (session) {
    return (
      <Layout session={session}>
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
              <AreaChart />
            </div>
            <div className='chart2'>
              <BarChart />
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

export async function getServerSideProps ({ req }) {
  const session = await NextAuth.session({ req })
  return {
    props: {
      session
    }
  }
}

export default Index
