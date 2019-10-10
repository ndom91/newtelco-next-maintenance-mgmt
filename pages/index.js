import React from 'react'
import Layout from '../src/components/layout'
import Link from 'next/link'
import RequireLogin from '../src/components/require-login'
import { NextAuth } from 'next-auth/client'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import Fonts from '../src/components/fonts'
import Footer from '../src/components/footer'
import { Sparklines, SparklinesLine } from 'react-sparklines'
import UseAnimations from 'react-useanimations'
import {
  Badge,
  Container,
  Card,
  CardHeader,
  CardBody
} from 'shards-react'

const people = ['fwaleska', 'alissitsin', 'sstergiou']

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
      jsonData: json,
      unread: display,
      session: await NextAuth.init({ req })
    }
  }

  constructor (props) {
    super(props)

    this.state = {
      alissitsin: {
        total: 0,
        weeks: []
      },
      fwaleska: {
        total: 0,
        weeks: []
      },
      sstergiou: {
        total: 0,
        weeks: []
      }
    }
    this.checkUnreadCount = this.checkUnreadCount.bind(this)
  }

  checkUnreadCount () {
    const host = window.location.host
    fetch(`https://api.${host}/inbox/count`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        let display
        console.log(data)
        if (data === 'No unread emails') {
          display = 0
        } else {
          display = data.count
        }
        console.log('loop ' + new Date())
        this.setState({
          unread: display
        })
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  fetchPersonStats (person) {
    const host = window.location.host
    fetch(`https://${host}/api/homepage/week?person=${person}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const keyArray = data.weekCountResults.map(item => item.yValue)
        this.setState({
          [person]: {
            total: data.totalCount.maints,
            weeks: keyArray
          }
        })
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  componentDidMount () {
    Fonts()

    // Keep Inbox Count uptodate
    this.unreadInterval = setTimeout(() => this.checkUnreadCount, 60 * 100000)
    people.forEach(person => {
      this.fetchPersonStats(person)
    })
  }

  componentWillUnmount () {
    clearInterval(this.unreadInterval)
  }

  render () {
    // console.log(this.props.session)
    if (this.props.session.user) {
      return (
        <Layout unread={this.props.unread} session={this.props.session}>
          <Card style={{ maxWidth: '100%' }}>
            <CardHeader><h2>Newtelco Maintenance</h2></CardHeader>
            <CardBody>
              <Container className='card-container'>
                <Card className='card-inboxUnread'>
                  <Link href='/inbox'>
                    <Badge className='card-badge'>{this.props.unread}</Badge>
                  </Link>
                  <CardBody>
                    <p className='card-body-text'>Unread</p>
                    <UseAnimations animationKey='activity' size={96} className='card-inbox-activity' />
                  </CardBody>
                </Card>
                {people.map(person => {
                  return (
                    <Card key={person} className='card-stats'>
                      <Badge className='card-person-badge' outline>
                        <span>
                          {eval(`this.state.${person}.total`)}
                        </span>
                        <Sparklines data={eval(`this.state.${person}.weeks`)} limit={10} width={100} height={40} margin={1}>
                          <SparklinesLine style={{ strokeWidth: 2, stroke: 'rgba(0, 123, 255, 0.5)', fill: '#007bff', fillOpacity: '0.1' }} />
                        </Sparklines>
                      </Badge>
                      <CardBody className='card-person-body'>
                        <p className='card-body-text'>{person}</p>
                      </CardBody>
                    </Card>
                  )
                }, this)}
              </Container>
            </CardBody>
            <Footer />
          </Card>
          <style jsx>{`
            @media only screen and (max-width: 500px) {
              :global(.card-container) {
                flex-wrap: wrap;
              }
              :global(.card-container > div) {
                margin: 20px 0;
              }
              :global(.card-badge) {
                font-size: 151px !important;
              }
              :global(.card-person-badge:first-of-type) {
                height: 160px;
              }
              :global(.card-person-badge) {
                font-size: 58px !important;
              }
              :global(.card-person-badge > svg) {
                bottom: 61px !important;
              }
              :global(.card-inbox-activity) {
                top: 50px !important;
                left: 12% !important;
                width: 76px !important;
              }
            }
            :global(.card-person-badge > svg) {
              position: absolute;
              left: 0px;
              bottom: 64px;
            }
            :global([class^="Component-root"]) {
              top: 0px;
              left: -5px;
              height: 200px !important;
              width: 250px;
              position: absolute;
            }
            :global(.card-badge) {
              font-size: 196px;
            }
            :global(.card-person-badge) {
              padding: 40px;
              font-size: 128px;
            }
            :global(.card-container) {
              display: flex;
              justify-content: space-around;
            }
            :global(.card-inboxUnread) {
              max-width: 350px;
            }
            :global(.card-person-body) {
              display: flex;
              justify-content: center;
              padding: 1.275rem !important;
            }
            :global(.card-body) {
              display: flex;
              justify-content: center;
              padding: 1.275rem !important;
            }
            :global(.card-body-text) {
              margin-bottom: 0px !important;
            }
            :global(.card-inbox-activity) {
              position: absolute; 
              top: 60px;
              left: 13%;
              opacity: 0.1;
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
