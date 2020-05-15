import React from 'react'
import NextAuth from 'next-auth/client'
import Link from 'next/link'
import { withRouter } from 'next/router'
import RequireLogin from '../../components/require-login'
import Layout from '../../components/layout'
import Companies from '../../components/settings/companies'
import CustomerCIDs from '../../components/settings/customercids'
import SupplierCIDs from '../../components/settings/suppliercids'
import Freeze from '../../components/settings/freeze'
// import Templates from '../../components/settings/templates'
import MaintPanel from '../../components/panel'
import './settings.css'
import {
  Nav,
  FlexboxGrid
} from 'rsuite'

const Settings = ({ session, router }) => {
  const { tab } = router.query

  const SettingsNav = () => {
    return (
      <Nav appearance='subtle'>
        <Nav.Item key={tab} componentClass='div' active={tab === 'companies'}>
          <Link href={{ pathname: '/settings', query: { tab: 'companies' } }}>
            <a>Companies</a>
          </Link>
        </Nav.Item>
        <Nav.Item componentClass='div' active={tab === 'customercids'}>
          <Link href={{ pathname: '/settings', query: { tab: 'customercids' } }}>
            <a>Customer CIDs</a>
          </Link>
        </Nav.Item>
        <Nav.Item componentClass='div' active={tab === 'suppliercids'}>
          <Link href={{ pathname: '/settings', query: { tab: 'suppliercids' } }}>
            <a>Supplier CIDs</a>
          </Link>
        </Nav.Item>
        <Nav.Item componentClass='div' active={tab === 'freeze'}>
          <Link href={{ pathname: '/settings', query: { tab: 'freeze' } }}>
            <a>Freeze</a>
          </Link>
        </Nav.Item>
        {/* <Nav.Item>Templates</Nav.Item> */}
      </Nav>
    )
  }

  if (session) {
    return (
      <Layout>
        <MaintPanel header='Settings' buttons={<SettingsNav />}>
          <FlexboxGrid align='top' justify='center' style={{ width: '100%' }}>
            {tab === 'companies' && <Companies />}
            {tab === 'customercids' && <CustomerCIDs />}
            {tab === 'suppliercids' && <SupplierCIDs />}
            {/* {tab === 'templates' && <Templates />} */}
            {tab === 'freeze' && <Freeze />}
          </FlexboxGrid>
        </MaintPanel>
      </Layout>
    )
  } else {
    return <RequireLogin />
  }
}

export async function getServerSideProps({ req }) {
  const session = await NextAuth.session({ req })
  return {
    props: {
      session
    }
  }
}

export default withRouter(Settings)
