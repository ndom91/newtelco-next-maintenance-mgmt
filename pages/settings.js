import React from 'react'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../src/components/require-login'
import Layout from '../src/components/layout'
import Companies from '../src/components/settings/companies'
import Footer from '../src/components/footer'
import {
  Nav,
  NavItem,
  NavLink,
  Card,
  CardHeader,
  CardTitle,
  CardBody
} from 'shards-react'

export default class About extends React.Component {
  static async getInitialProps ({ req }) {
    return {
      session: await NextAuth.init({ req })
    }
  }

  render () {
    if (this.props.session.user) {
      return (
        <Layout session={this.props.session}>
          <Card style={{ maxWidth: '100%' }}>
            <CardHeader>
              <h2>Settings</h2>
              <Nav pills>
                <NavItem>
                  <NavLink href='#'>Companies</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href='#'>Their CIDs</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href='#'>Our CIDs</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href='#'>Templates</NavLink>
                </NavItem>
              </Nav>
            </CardHeader>
            <CardBody>
              <CardTitle>Lorem Ipsum</CardTitle>
              <Companies />
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
            `}
          </style>
        </Layout>
      )
    } else {
      return <RequireLogin />
    }
  }
}
