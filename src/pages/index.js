import React from 'react'
import Layout from '../components/layout'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import RequireLogin from '../components/require-login'
import { NextAuth } from 'next-auth/client'
import ReactTooltip from 'react-tooltip'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import Fonts from '../components/fonts'
import Footer from '../components/cardFooter'
import CalendarHeatmap from 'react-calendar-heatmap'
import MaintPanel from '../components/panel'
// import * as S fro./styled.js
import {
  Badge,
  Container,
  Card,
  CardHeader,
  CardBody,
  Row,
  Col
} from 'shards-react'

const BarChart = dynamic(
  () => import('../components/homepage/barchart'),
  { ssr: false }
)
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
    const mail = { count: 0 }
    if (json !== 'No unread emails') {
      mail.count = json.count
    }
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
      jsonData: mail,
      night: query.night,
      session: await NextAuth.init({ req })
    }
  }

  constructor (props) {
    super(props)

    this.state = {
      heatmapData: []
    }
  }

  componentDidMount () {
    Fonts()

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
    const {
      heatmapData
    } = this.state

    if (this.props.session.user) {
      return (
        <Layout night={this.props.night} handleSearchSelection={this.handleSearchSelection} session={this.props.session} count={this.props.jsonData.count}>
          <MaintPanel header='Maintenance'>
            <Card className='card-inboxUnread'>
              <p className='card-body-text person-text unread-text'>Unread</p>
              <Link href='/inbox' passHref>
                <Badge className='card-badge'>{this.props.jsonData.count}</Badge>
              </Link>
            </Card>
          </MaintPanel>
          {/* <Card className='top-card-wrapper' style={{ maxWidth: '100%' }}>
            <CardHeader><h2 className='title-text'>Newtelco Maintenance</h2></CardHeader>
            <CardBody>
              <Container className='card-container'>
                <Row style={{ width: '90%'}}>
                  <Col>
                    <Card className='card-inboxUnread'>
                      <p className='card-body-text person-text unread-text'>Unread</p>
                      <Link href='/inbox' passHref>
                        <Badge className='card-badge'>{this.props.jsonData.count}</Badge>
                      </Link>
                    </Card>
                  </Col>
                  <BarChart />
                </Row>
                <Row className='heatmap-row' style={{ width: '90vw', padding: '50px' }}>
                  <Col>
                    <div
                      style={{ width: '100%' }}
                    >
                      <CalendarHeatmap
                        startDate={new Date('2019-01-01')}
                        endDate={new Date()}
                        values={heatmapData}
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
          </Card> */}
        </Layout>
      )
    } else {
      return (
        <RequireLogin />
      )
    }
  }
}
