import React from 'react'
import Layout from '../src/components/layout'
import RequireLogin from '../src/components/require-login'
import { NextAuth } from 'next-auth/client'

export default class Blog extends React.Component {
  static async getInitialProps ({ req }) {
    return {
      session: await NextAuth.init({ req })
    }
  }

  render () {
    if (this.props.session.user) {
      return (
        <Layout session={this.props.session}>
          <h1>Newtelco Maintenance</h1>
          <style jsx>{`
            h1,
            a {
              font-family: 'Arial';
            }

            ul {
              padding: 0;
            }

            li {
              list-style: none;
              margin: 5px 0;
            }

            a {
              text-decoration: none;
              color: blue;
            }

            a:hover {
              opacity: 0.6;
            }
          `}
          </style>
        </Layout>
      )
    } else {
      return (
        <RequireLogin />
      )
    }
  }
}
