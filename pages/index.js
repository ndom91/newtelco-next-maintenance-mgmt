import React from 'react'
import Layout from '../src/components/layout'
import RequireLogin from '../src/components/require-login'
import { NextAuth } from 'next-auth/client'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import Fonts from '../src/components/fonts'
import Footer from '../src/components/footer'
import UseAnimations from 'react-useanimations'
import {
  Badge,
  Container,
  Card,
  CardHeader,
  CardBody
} from 'shards-react'

export default class Blog extends React.Component {
  static async getInitialProps ({ res, req }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://api.${host}/inbox/count` // ?page=${query.page || 1}&limit=${query.limit || 41}`
    const fetchRes = await fetch(pageRequest, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
    const json = await fetchRes.json()
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
      jsonData: json,
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
              <Container className='card-container'>
                <Card className='card-inboxUnread'>
                  <Badge className='card-badge' outline>{this.props.jsonData.count}</Badge>
                  <CardBody>
                    <p className='card-body-text'>Unread Mails</p>
                    <UseAnimations animationKey='activity' size={24} className='card-inbox-activity' />
                  </CardBody>
                </Card>
              </Container>
            </CardBody>
            <Footer />
          </Card>
          <style jsx>{`
            :global(.card-badge) {
              font-size: 128px;
            }
            :global(.card-container) {
              display: flex;
              justify-content: flex-start;
            }
            :global(.card-inboxUnread) {
              max-width: 350px;
            }
            :global(.card-body) {
              padding: 1.275rem !important;
            }
            :global(.card-body-text) {
              margin-bottom: 0px !important;
            }
            :global(.card-inbox-activity) {
              position: absolute; 
              top: 110px;
              left: 73%;
              opacity: 0.3;
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
