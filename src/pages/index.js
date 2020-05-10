import React from 'react'
import Layout from '../components/layout'
import dynamic from 'next/dynamic'
import RequireLogin from '../components/require-login'
import NextAuth from 'next-auth/client'
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

export async function getServerSideProps ({ req }) {
  const session = await NextAuth.session({ req })
  return {
    props: {
      session
    }
  }
}

export default Index
