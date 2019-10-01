import React from 'react'
import { NextAuth } from 'next-auth/client'
import Layout from '../src/components/layout'

export default class About extends React.Component {
  static async getInitialProps ({ req }) {
    return {
      session: await NextAuth.init({ req })
    }
  }

  render () {
    return (
      <Layout session={this.props.session}>
        <p>This is the Settings page</p>
      </Layout>
    )
  }
}
