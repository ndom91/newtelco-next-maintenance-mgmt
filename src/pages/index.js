import React from 'react'
import Router from 'next/router'
import Layout from '@/newtelco/layout'
import dynamic from 'next/dynamic'
import RequireLogin from '@/newtelco/require-login'
import { getSession } from 'next-auth/client'
import MaintPanel from '@/newtelco/panel'
import UnreadBadge from '@/newtelco/unread'
import Store from '@/newtelco/store'
import { Loader, Panel } from 'rsuite'
import { Icon } from '@rsuite/icons'
import './style/index.css'

const AreaChart = dynamic(() => import('../components/homepage/areachart'), {
  ssr: false,
  loading: () => (
    <Panel
      bordered
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          Completed
          <Icon
            as='bar-chart'
            style={{ color: 'var(--primary)' }}
            size='lg'
          />
        </div>
      }
      style={{ height: '100%' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '200px',
        }}
      >
        <Loader />
      </div>
    </Panel>
  ),
})

const Heatmap = dynamic(() => import('../components/homepage/heatmap'))
const BarChart = dynamic(() => import('../components/homepage/perperson'))
const ActiveMaintenances = dynamic(() =>
  import('../components/homepage/active')
)

const Index = ({ session }) => {
  const store = Store.useStore()

  if (typeof window !== 'undefined' && !session) {
    Router.push('/auth/signin')
  }

  if (session) {
    return (
      <Layout>
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
    return <RequireLogin />
  }
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context),
    },
  }
}

export default Index
