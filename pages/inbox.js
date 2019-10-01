import React from 'react'
import Layout from '../src/components/layout'
import { NextAuth } from 'next-auth/client'

export default class About extends React.Component {
  static async getInitialProps ({ req }) {
    return {
      session: await NextAuth.init({ req })
    }
  }

  render () {
    return (
      <Layout session={this.props.session}>
        <p>This is the Inbox page</p>
      </Layout>
    )
  }
}
