import React from 'react'
import { NextAuth } from 'next-auth/client'
import Link from 'next/link'
import { withRouter } from 'next/router'
import RequireLogin from '../src/components/require-login'
import Layout from '../src/components/layout'
import Companies from '../src/components/settings/companies'
import CustomerCIDs from '../src/components/settings/customercids'
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
    return {
      session: await NextAuth.init({ req })
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      active: {
        companies: props.router.query.tab === 'companies' ? true : false,
        customercids: props.router.query.tab === 'customercids' ? true : false,
        ourcids: props.router.query.tab === 'ourcids' ? true : false,
        templates: props.router.query.tab === 'templates' ? true : false
      }
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const {
      tab
    } = this.props.router.query

    console.log(tab)
    const active = {
      companies: tab === 'companies' ? true : false,
      customercids: tab === 'customercids' ? true : false,
      ourcids: tab === 'ourcids' ? true : false,
      templates: tab === 'templates' ? true : false
    }

    console.log(prevState.active, active)

    if (prevState.active.companies !== active.companies ||
      prevState.active.customercids !== active.customercids ||
      prevState.active.ourcids !== active.ourcids ||
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
        ourcids,
        templates
      }
    } = this.state

    const {
      tab
    } = this.props.router.query

    if (this.props.session.user) {
      return (
        <Layout session={this.props.session}>
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
                    <NavLink href=''>Their CIDs</NavLink>
                  </Link>
                </NavItem>
                <NavItem active={ourcids}>
                  <Link href={{ pathname: '/settings', query: { tab: 'ourcids' } }} as='/settings/ourcids'>
                    <NavLink href=''>Our CIDs</NavLink>
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
