import React from 'react'
import Layout from '../src/components/layout'
import Link from 'next/link'
import RequireLogin from '../src/components/require-login'
import { NextAuth } from 'next-auth/client'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import Fonts from '../src/components/fonts'
import UnreadCount from '../src/components/unreadcount'
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

export default class Index extends React.Component {
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
      },
      logRocketLoaded: false
    }
    // this.checkUnreadCount = this.checkUnreadCount.bind(this)
  }

  // checkUnreadCount () {
  //   const host = window.location.host
  //   fetch(`https://api.${host}/inbox/count`, {
  //     method: 'get'
  //   })
  //     .then(resp => resp.json())
  //     .then(data => {
  //       let display
  //       if (data === 'No unread emails') {
  //         display = 0
  //       } else {
  //         display = data.count
  //         if (document !== undefined) {
  //           const favicon = document.getElementById('favicon')
  //           const faviconSize = 16

  //           const canvas = document.createElement('canvas')
  //           canvas.width = faviconSize
  //           canvas.height = faviconSize

  //           const context = canvas.getContext('2d')
  //           const img = document.createElement('img')
  //           img.src = favicon.href

  //           img.onload = () => {
  //             // Draw Original Favicon as Background
  //             context.drawImage(img, 0, 0, faviconSize, faviconSize)

  //             // Draw Notification Circle
  //             context.beginPath()
  //             context.arc(canvas.width - faviconSize / 4, faviconSize / 4, faviconSize / 4, 0, 2 * Math.PI)
  //             context.fillStyle = '#FF0000'
  //             context.fill()

  //             // Draw Notification Number
  //             // context.font = '9px "helvetica", sans-serif'
  //             // context.textAlign = 'center'
  //             // context.textBaseline = 'middle'
  //             // context.fillStyle = '#FFFFFF'
  //             // context.fillText(display, canvas.width - faviconSize / 3, faviconSize / 3)

  //             // Replace favicon
  //             favicon.href = canvas.toDataURL('image/png')
  //             this.setState({
  //               faviconEl: favicon
  //             })
  //           }
  //         }
  //       }
  //       // console.log('loop ' + new Date())
  //       this.setState({
  //         unread: display
  //       })
  //     })
  //     .catch(err => console.error(`Error - ${err}`))
  // }

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
    // this.checkUnreadCount()
    // this.unreadInterval = setTimeout(() => this.checkUnreadCount, 60 * 1000)
    people.forEach(person => {
      this.fetchPersonStats(person)
    })
  }

  componentWillUnmount () {
    clearInterval(this.unreadInterval)
  }

  handleSearchSelection = selection => {
    const newLocation = `/maintenance?id=${selection.id}`
    Router.push(newLocation)
    // Router.pushRoute(`/maintenance?id=${selection.id}`)
    // this.setState({ selection })
  }

  render () {
    // console.log(this.props.session)
    if (this.props.session.user) {
      return (
        <Layout handleSearchSelection={this.handleSearchSelection} unread={this.props.unread} session={this.props.session}>
          {UnreadCount()}
          <Card style={{ maxWidth: '100%' }}>
            <CardHeader><h2>Newtelco Maintenance</h2></CardHeader>
            <CardBody>
              <Container className='card-container'>
                <Card className='card-inboxUnread'>
                  <Link href='/inbox' passHref>
                    <Badge className='card-badge'>{this.props.unread}</Badge>
                  </Link>
                  <Link href='/inbox'>
                    <a href='/inbox'>
                      <CardBody className='card-unread-body'>
                        <UseAnimations animationKey='activity' size={34} className='card-inbox-activity' />
                        <p className='card-body-text'>Unread</p>
                      </CardBody>
                    </a>
                  </Link>
                </Card>
                {people.map(person => {
                  return (
                    <Card key={person} className='card-stats'>
                      <Badge className='card-person-badge' outline>
                        <span>
                          {eval(`this.state.${person}.total`)}
                        </span>
                        <Sparklines data={eval(`this.state.${person}.weeks`)} limit={10} width={100} height={40} margin={1}>
                          <SparklinesLine style={{ strokeWidth: 2, stroke: 'rgba(53, 146, 59, 0.5)', fill: '#67B246', fillOpacity: '0.1' }} />
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
                pointer-events: none;
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
              cursor: pointer;
            }
            :global(.card-unread-body) {
              cursor: pointer;
              text-decoration: none;
              color: var(--secondary);
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
              top: 171px;
              left: 70%;
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
