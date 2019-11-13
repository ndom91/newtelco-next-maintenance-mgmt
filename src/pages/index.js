import React from 'react'
import Layout from '../components/layout'
import Link from 'next/link'
import RequireLogin from '../components/require-login'
import { NextAuth } from 'next-auth/client'
import ReactTooltip from 'react-tooltip'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import Fonts from '../components/fonts'
import UnreadCount from '../components/unreadcount'
import Footer from '../components/footer'
import { Sparklines, SparklinesLine } from 'react-sparklines'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import UseAnimations from 'react-useanimations'
import {
  Badge,
  Container,
  Card,
  CardHeader,
  CardBody,
  Row,
  Col
} from 'shards-react'

const people = ['fwaleska', 'alissitsin', 'sstergiou']

export default class Index extends React.Component {
  static async getInitialProps ({ res, req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://api.${host}/inbox/count`
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
      night: query.night,
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
      heatmapData: []
    }
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

    people.forEach(person => {
      this.fetchPersonStats(person)
    })
    const host = window.location.host
    fetch(`https://${host}/api/maintenances/heatmap`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          heatmapData: data.maintenances
        })
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  componentWillUnmount () {
    clearInterval(this.unreadInterval)
  }

  handleSearchSelection = selection => {
    const newLocation = `/maintenance?id=${selection.id}`
    Router.push(newLocation)
  }

  render () {
    if (this.props.session.user) {
      return (
        <Layout night={this.props.night} handleSearchSelection={this.handleSearchSelection} unread={this.props.jsonData.count} session={this.props.session}>
          {UnreadCount()}
          <Card className='top-card-wrapper' style={{ maxWidth: '100%' }}>
            <CardHeader><h2 className='title-text'>Newtelco Maintenance</h2></CardHeader>
            <CardBody>
              <Container className='card-container'>
                <Row>
                  <Col>
                    <Card className='card-inboxUnread'>
                      <Link href='/inbox' passHref>
                        <Badge className='card-badge'>{this.props.jsonData.count}</Badge>
                      </Link>
                      <Link href='/inbox' passHref>
                        <CardBody className='card-unread-body'>
                          <UseAnimations animationKey='activity' size={34} className='card-inbox-activity' />
                          <p className='card-body-text'>Unread</p>
                        </CardBody>
                      </Link>
                    </Card>
                  </Col>
                  {people.map(person => {
                    return (
                      <Col key={person}>
                        <Card className='card-stats'>
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
                      </Col>
                    )
                  }, this)}
                </Row>
                <Row className='heatmap-row' style={{ width: '90vw', padding: '50px' }}>
                  <Col>
                    <div
                      style={{ width: '100%' }}
                    >
                      <CalendarHeatmap
                        startDate={new Date('2019-01-01')}
                        endDate={new Date()}
                        values={this.state.heatmapData}
                        showWeekdayLabels
                        classForValue={value => {
                          if (!value) {
                            return 'color-empty'
                          }
                          return `color-github-${value.value}`
                        }}
                        tooltipDataAttrs={value => {
                          return {
                            'data-tip': `${value.format} has ${value.value || '0'} maintenance(s)`
                          }
                        }}
                      />
                    </div>
                    <ReactTooltip />
                  </Col>
                </Row>
              </Container>
            </CardBody>
            <Footer />
          </Card>
          <style jsx>{`
            @media only screen and (max-width: 500px) {
              :global(.card-container) {
                flex-wrap: wrap;
              }
              :global(.card-container div.col) {
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
              :global(.heatmap-row) {
                padding: 0px !important;
              }
              :global(.title-text) {
                font-size: 2.2rem !important;
              }
            }
            :global(.break) {
              flex-basis: 100%;
              height: 0;
            }
            :global(.badge-primary[href]:focus, .badge-primary[href]:hover) {
              color: var(--primary-bg);
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
            :global(.card-header) {
              font-weight: 300 !important
            }
            :global(.card-badge) {
              font-size: 196px;
              cursor: pointer;
              color: var(--inv-font-color);
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
              flex-wrap: wrap;
            }
            :global(.card-stats) {
              border-radius: 0.625em;
            }
            :global(.card-inboxUnread) {
              max-width: 350px;
              border-radius: 0.625em;
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
            :global(.react-calendar-heatmap text) {
              font-size: 10px;
              fill: #aaa;
            }
            :global(.react-calendar-heatmap .react-calendar-heatmap-small-text) {
              font-size: 5px;
            }
            :global(.react-calendar-heatmap rect:hover) {
              stroke: #555;
              stroke-width: 1px;
            }
            :global(.react-calendar-heatmap .color-empty) {
              fill: var(--secondary-bg);
            }
            :global(.react-calendar-heatmap .color-filled) {
              fill: #8cc665;
            }
            :global(.react-calendar-heatmap .color-github-0) {
              fill: #eeeeee;
            }
            :global(.react-calendar-heatmap .color-github-1) {
              fill: #d6e685;
            }
            :global(.react-calendar-heatmap .color-github-2) {
              fill: #8cc665;
            }
            :global(.react-calendar-heatmap .color-github-3) {
              fill: #44a340;
            }
            :global(.react-calendar-heatmap .color-github-4) {
              fill: #1e6823;
            }
            :global(.react-calendar-heatmap .color-github-5) {
              fill: #16521a;
            }
            :global(.react-calendar-heatmap .color-github-6) {
              fill: #114014;
            }
            :global(.react-calendar-heatmap .color-github-7) {
              fill: #0a290c;
            }
            :global(.react-calendar-heatmap .color-github-8) {
              fill: #051906;
            }
            :global(.react-calendar-heatmap .color-github-9) {
              fill: #020a02;
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
