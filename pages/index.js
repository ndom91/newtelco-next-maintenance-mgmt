import React from 'react'
import Layout from '../src/components/layout'
import RequireLogin from '../src/components/require-login'
import { NextAuth } from 'next-auth/client'
import Router from 'next/router'
import Fonts from '../src/components/fonts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter
} from 'shards-react'

export default class Blog extends React.Component {
  static async getInitialProps ({ res, req }) {
    if (req && !req.user) {
      if (res) {
        res.writeHead(302, {
          Location: '/auth'
        })
        res.end()
      } else {
        Router.push('/auth')
      }
    }
    return {
      session: await NextAuth.init({ req })
    }
  }

  componentDidMount () {
    Fonts()
  }

  render () {
    // console.log(this.props.session)
    if (this.props.session.user) {
      return (
        <Layout session={this.props.session}>
          <Card style={{ maxWidth: '100%' }}>
            <CardHeader><h2>Newtelco Maintenance</h2></CardHeader>
            <CardBody>
              <CardTitle>Lorem Ipsum</CardTitle>
              <p>Lorem ipsum dolor sit amet.</p>
            </CardBody>
            <CardFooter>Card footer</CardFooter>
          </Card>
        </Layout>
      )
    } else {
      return (
        <RequireLogin />
      )
    }
  }
}
