import React from 'react'
import Layout from '../src/components/layout'
import RequireLogin from '../src/components/require-login'
import fetch from 'isomorphic-unfetch'
import { NextAuth } from 'next-auth/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPencilAlt
} from '@fortawesome/free-solid-svg-icons'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText
} from 'shards-react'

export default class About extends React.Component {
  static async getInitialProps ({ req }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://api.${host}/inbox` // ?page=${query.page || 1}&limit=${query.limit || 41}`
    const res = await fetch(pageRequest, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
    const json = await res.json()
    return {
      jsonData: json,
      session: await NextAuth.init({ req })
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      inboxMails: []
    }
  }

  componentDidMount () {
    this.setState({ inboxMails: this.props.jsonData })
  }

  render () {
    if (this.props.session.user) {
      const {
        inboxMails
      } = this.state
      return (
        <Layout session={this.props.session}>
          <Card style={{ maxWidth: '100%' }}>
            <CardHeader><h2>Inbox</h2></CardHeader>
            <CardBody>
              {/* <CardTitle>Lorem Ipsum</CardTitle> */}
              <ListGroup>
                {inboxMails && inboxMails.map(mail => {
                  // console.log(mail)
                  // https://github.com/mat/besticon
                  return (
                    <ListGroupItem key={mail.id}>
                      <div className='mail-wrapper'>
                        <Badge outline theme='light' className='mail-badge'>
                          <img className='mail-icon' src={`https://besticon-demo.herokuapp.com/icon?size=40..100..360&url=${mail.domain}`} />
                          {/* <img src={`https://www.google.com/s2/favicons?domain=${mail.domain}`} /> */}
                        </Badge>
                        <div className='mail-info'>
                          <ListGroupItemHeading>{mail.from} - <b style={{ fontWeight: '900' }}>{mail.subject}</b></ListGroupItemHeading>
                          <ListGroupItemText>
                            {mail.snippet}
                          </ListGroupItemText>
                        </div>
                        <Button className='mail-edit-btn' outline>
                          <FontAwesomeIcon width='1.425em' className='edit-icon' icon={faPencilAlt} />
                        </Button>
                      </div>
                    </ListGroupItem>
                  )
                })}
              </ListGroup>
            </CardBody>
            <CardFooter>Card footer</CardFooter>
          </Card>
          <style jsx>{`
            .mail-wrapper {
              display: flex;
            }
            :global(.mail-badge) {
              width: 68px;
            }
            :global(.list-group-item-heading) {
              margin: 0 10px;
            }
            :global(.list-group-item-text) {
              margin: 0 10px;
            }
            .mail-icon {
              height: 50px;
              width: 50px;
            }
            .mail-info {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              justify-content: center;
            }
          `}
          </style>
        </Layout>
      )
    } else {
      return <RequireLogin />
    }
  }
}
