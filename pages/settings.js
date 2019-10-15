import React from 'react'
import { NextAuth } from 'next-auth/client'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import { Router, withRouter } from 'next/router'
import RequireLogin from '../src/components/require-login'
import Layout from '../src/components/layout'
import Companies from '../src/components/settings/companies'
import CustomerCIDs from '../src/components/settings/customercids'
import SupplierCIDs from '../src/components/settings/suppliercids'
import UnreadCount from '../src/components/unreadcount'
import Footer from '../src/components/footer'
import {
  Nav,
  NavItem,
  NavLink,
  Card,
  CardHeader,
  CardBody
} from 'shards-react'

class Settings extends React.Component {
  static async getInitialProps ({ req }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest2 = `https://api.${host}/inbox/count`
    const res2 = await fetch(pageRequest2)
    const count = await res2.json()
    let display
    if (count === 'No unread emails') {
      display = 0
    } else {
      display = count.count
    }
    return {
      unread: display,
      session: await NextAuth.init({ req })
    }
  }

  constructor (props) {
    super(props)
    // todo: clean up active tab stuff - this is ugly!
    this.state = {
      active: {
        companies: props.router.query.tab === 'companies',
        customercids: props.router.query.tab === 'customercids',
        suppliercids: props.router.query.tab === 'ourcids',
        templates: props.router.query.tab === 'templates'
      }
    }
  }

  // componentDidMount () {
  //   if (typeof window !== 'undefined' && window.location.pathname === '/settings') {
  //     this.setState({
  //       active: {
  //         ...this.state.active,
  //         companies: true
  //       }
  //     })
  //     Router.push({
  //       pathname: '/settings',
  //       query: { tab: 'companies' }
  //     })
  //   }
  // }

  componentDidUpdate (prevProps, prevState) {
    const {
      tab
    } = this.props.router.query

    console.log(tab)
    const active = {
      companies: tab === 'companies',
      customercids: tab === 'customercids',
      suppliercids: tab === 'suppliercids',
      templates: tab === 'templates'
    }

    if (prevState.active.companies !== active.companies ||
      prevState.active.customercids !== active.customercids ||
      prevState.active.suppliercids !== active.suppliercids ||
      prevState.active.templates !== active.templates) {
      this.setState({
        active: active
      })
    }
  }

  render () {
    const {
      active: {
        companies,
        customercids,
        suppliercids,
        templates
      }
    } = this.state

    const {
      tab
    } = this.props.router.query

    if (this.props.session.user) {
      return (
        <Layout unread={this.props.unread} session={this.props.session}>
          {UnreadCount()}
          <Card style={{ maxWidth: '100%' }}>
            <CardHeader>
              <h2>Settings</h2>
              <Nav pills>
                <NavItem active={companies}>
                  <Link href={{ pathname: '/settings', query: { tab: 'companies' } }} as='/settings/companies'>
                    <NavLink href=''>Companies</NavLink>
                  </Link>
                </NavItem>
                <NavItem active={customercids}>
                  <Link href={{ pathname: '/settings', query: { tab: 'customercids' } }} as='/settings/customercids'>
                    <NavLink href=''>Customer CIDs</NavLink>
                  </Link>
                </NavItem>
                <NavItem active={suppliercids}>
                  <Link href={{ pathname: '/settings', query: { tab: 'suppliercids' } }} as='/settings/suppliercids'>
                    <NavLink href=''>Supplier CIDs</NavLink>
                  </Link>
                </NavItem>
                <NavItem active={templates}>
                  <Link href={{ pathname: '/settings', query: { tab: 'templates' } }} as='/settings/templates'>
                    <NavLink href=''>Templates</NavLink>
                  </Link>
                </NavItem>
              </Nav>
            </CardHeader>
            <CardBody>
              {tab === 'companies' && <Companies />}
              {tab === 'customercids' && <CustomerCIDs />}
              {tab === 'suppliercids' && <SupplierCIDs />}
            </CardBody>
            <Footer />
          </Card>
          <style jsx>{`
              :global(.card-header) {
                display: flex;
                justify-content: space-between;
              }
              :global(.nav-pills:hover) {
                background-color: transparent;
              }
              :global(.nav-item.active) {
                border: 1px solid var(--primary);
                border-radius: 5px;
              }
            `}
          </style>
        </Layout>
      )
    } else {
      return <RequireLogin />
    }
  }
}

export default withRouter(Settings)
