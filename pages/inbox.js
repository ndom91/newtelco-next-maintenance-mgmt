import React from 'react'
import Layout from '../src/components/layout'
import RequireLogin from '../src/components/require-login'
import fetch from 'isomorphic-unfetch'
import { NextAuth } from 'next-auth/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPencilAlt,
  faEnvelopeOpenText
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
  ListGroupItemText,
  Modal,
  ModalBody,
  ModalHeader
} from 'shards-react'

export default class Inbox extends React.Component {
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
      inboxMails: [],
      open: false
    }
    this.toggle = this.toggle.bind(this)
  }

  toggle (mailId) {
    const {
      inboxMails
    } = this.state

    if (mailId) {
      const activeMail = inboxMails.findIndex(el => el.id === mailId)
      this.setState({
        open: !this.state.open,
        modalSubject: inboxMails[activeMail].subject,
        modalFrom: inboxMails[activeMail].from,
        modalBody: inboxMails[activeMail].body
      })
    } else {
      this.setState({
        open: !this.state.open
      })
    }
  }

  componentDidMount () {
    this.setState({
      inboxMails: this.props.jsonData,
      windowInnerHeight: window.innerHeight
    })
  }

  render () {
    if (this.props.session.user) {
      const {
        inboxMails,
        open
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
                          <FontAwesomeIcon onClick={() => this.toggle(mail.id)} width='1.325em' className='mail-open-icon' icon={faEnvelopeOpenText} />
                        </Badge>
                        <div className='mail-info'>
                          <ListGroupItemHeading>
                            {mail.from} - <b style={{ fontWeight: '900' }}>{mail.subject}</b>
                          </ListGroupItemHeading>
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
                <Modal className='mail-modal-body' animation open={open} size='lg' toggle={this.toggle}>
                  <ModalHeader>{this.state.modalFrom} <br /><small className='mail-subject'>{this.state.modalSubject}</small></ModalHeader>
                  <ModalBody className='mail-body' dangerouslySetInnerHTML={{ __html: this.state.modalBody }} />
                </Modal>
              </ListGroup>
            </CardBody>
            <CardFooter>Card footer</CardFooter>
          </Card>
          <style jsx>{`
            .mail-wrapper {
              display: flex;
            }
            :global(.mail-badge:hover) {
              min-height: 64px;
              min-width: 68px;
              transition: all 150ms ease-in-out;
            }
            :global(.mail-badge) {
              width: 68px;
              transition: all 150ms ease-in-out;
            }
            :global(.list-group-item-heading) {
              margin: 0 10px;
            }
            :global(.list-group-item-text) {
              margin: 0 10px;
            }
            :global(.mail-open-icon) {
              color: var(--primary);
              position: absolute;
              left: 50px;
              top: 30px;
              font-size: 24px;
              visibility: hidden;
              opacity: 0;
              transition: visibility 0s, opacity 200ms ease-in-out;
            }
            :global(.mail-badge:hover) > :global(.mail-open-icon) {
              visibility:visible;
              opacity: 1;
              transition: all 150ms ease-in-out;
              cursor: pointer;
              transition: visibility 0s, opacity 200ms ease-in-out;
            }
            .mail-icon {
              height: 50px;
              transition: all 150ms ease-in-out;
              width: 50px;
              transition: visibility 0s, opacity 200ms ease-in-out;
            }
            :global(.mail-badge:hover) > .mail-icon {
              visibility: hidden;
              opacity: 0;
              transition: visibility 0s, opacity 200ms ease-in-out;
            }
            .mail-info {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              justify-content: center;
            }
            .mail-subject {
              font-weight: 100;
              letter-spacing: -0.5px;
              font-family: Poppins, Helvetica;
            }
            :global(.modal-content) {
              max-height: calc(${this.state.windowInnerHeight}px - 50px);
            }
            :global(.mail-body) {
              font-family: Poppins, Helvetica;
              overflow-y: scroll;
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
