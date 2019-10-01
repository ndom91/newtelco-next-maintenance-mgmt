import React from 'react'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../src/components/require-login'
import Layout from '../src/components/layout'
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter
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
            <CardHeader><h2>Settings</h2></CardHeader>
            <CardBody>
              <CardTitle>Lorem Ipsum</CardTitle>
              <p>Lorem ipsum dolor sit amet.</p>
            </CardBody>
            <CardFooter>Card footer</CardFooter>
          </Card>
        </Layout>
      )
    } else {
      return <RequireLogin />
    }
  }
}
