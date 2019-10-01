import React from 'react'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../src/components/require-login'
import Layout from '../src/components/layout'

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
          <p>This is the Settings page</p>
        </Layout>
      )
    } else {
      return <RequireLogin />
    }
  }
}
