import React from 'react'
import { NextAuth } from 'next-auth/client'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import Router, { withRouter } from 'next/router'
import RequireLogin from '../src/components/require-login'
import Layout from '../src/components/layout'
import Companies from '../src/components/settings/companies'
import CustomerCIDs from '../src/components/settings/customercids'
import SupplierCIDs from '../src/components/settings/suppliercids'
import Freeze from '../src/components/settings/freeze'
import Templates from '../src/components/settings/templates'
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
  static async getInitialProps ({ req, query }) {
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
      night: query.night,
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
        suppliercids: props.router.query.tab === 'suppliercids',
        templates: props.router.query.tab === 'templates',
        freeze: props.router.query.tab === 'freeze'
      }
    }
  }

  componentDidMount () {
    if (this.props.router.asPath) {
      const pathname = this.props.router.asPath
      const pathMatch = pathname.match(/^\/(.*)\/(.*)/)
      if (pathMatch && pathMatch[2]) {
        this.setState({
          active: {
            ...this.state.active,
            [pathMatch[2]]: true
          }
        })
      }
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const {
      tab
    } = this.props.router.query

    console.log(tab)
    const active = {
      companies: tab === 'companies',
      customercids: tab === 'customercids',
      suppliercids: tab === 'suppliercids',
      templates: tab === 'templates',
      freeze: tab === 'freeze'
    }

    if (prevState.active.companies !== active.companies ||
      prevState.active.customercids !== active.customercids ||
      prevState.active.suppliercids !== active.suppliercids ||
      prevState.active.freeze !== active.freeze ||
      prevState.active.templates !== active.templates) {
      this.setState({
        active: active
      })
    }
  }

  handleSearchSelection = selection => {
    const newLocation = `/maintenance?id=${selection.id}`
    Router.push(newLocation)
    // Router.pushRoute(`/maintenance?id=${selection.id}`)
    // this.setState({ selection })
  }

  render () {
    const {
      active: {
        companies,
        customercids,
        suppliercids,
        templates,
        freeze
      }
    } = this.state

    const {
      tab
    } = this.props.router.query

    if (this.props.session.user) {
      return (
        <Layout night={this.props.night} unread={this.props.unread} handleSearchSelection={this.handleSearchSelection} session={this.props.session}>
          {UnreadCount()}
          <Card style={{ maxWidth: '100%' }}>
            <CardHeader>
              <h2>Settings</h2>
              <Nav pills>
                <NavItem active={companies}>
                  <Link href={{ pathname: '/settings', query: { tab: 'companies' } }}>
                    <NavLink href=''>Companies</NavLink>
                  </Link>
                </NavItem>
                <NavItem active={suppliercids}>
                  <Link href={{ pathname: '/settings', query: { tab: 'suppliercids' } }}>
                    <NavLink href=''>Supplier CIDs</NavLink>
                  </Link>
                </NavItem>
                <NavItem active={customercids}>
                  <Link href={{ pathname: '/settings', query: { tab: 'customercids' } }}>
                    <NavLink href=''>Customer CIDs</NavLink>
                  </Link>
                </NavItem>
                <NavItem active={freeze}>
                  <Link href={{ pathname: '/settings', query: { tab: 'freeze' } }}>
                    <NavLink href=''>Freezes</NavLink>
                  </Link>
                </NavItem>
                <NavItem active={templates}>
                  <Link href={{ pathname: '/settings', query: { tab: 'templates' } }}>
                    <NavLink href=''>Templates</NavLink>
                  </Link>
                </NavItem>
              </Nav>
            </CardHeader>
            <CardBody>
              {tab === 'companies' && <Companies />}
              {tab === 'customercids' && <CustomerCIDs />}
              {tab === 'suppliercids' && <SupplierCIDs />}
              {tab === 'templates' && <Templates />}
              {tab === 'freeze' && <Freeze />}
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
              :global(.modal-backdrop) {
                background-color: rgba(0,0,0,0.8);
                opacity: 0.95;
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
