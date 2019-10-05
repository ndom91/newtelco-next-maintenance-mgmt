import React from 'react'
import Layout from '../src/components/layout'
import Link from 'next/link'
import RequireLogin from '../src/components/require-login'
import fetch from 'isomorphic-unfetch'
import { NextAuth } from 'next-auth/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPencilAlt,
  faEnvelopeOpenText,
  faTrashAlt,
  faLanguage
} from '@fortawesome/free-solid-svg-icons'
import {
  Badge,
  Button,
  ButtonGroup,
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
      open: false,
      modalSubject: '',
      modalFrom: '',
      modalBody: '',
      originalModayBody: '',
      translated: false
    }
    this.toggle = this.toggle.bind(this)
  }

  componentDidMount () {
    this.setState({
      inboxMails: this.props.jsonData,
      windowInnerHeight: window.innerHeight
    })
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

  handleTranslate () {
    const {
      modalBody
    } = this.state

    if (this.state.translated) {
      this.setState({
        modalBody: this.state.originalModalBody,
        translated: !this.state.translated
      })
    } else {
      const host = window.location.host
      fetch(`https://api.${host}/translate`, {
        method: 'post',
        body: JSON.stringify({ q: modalBody }),
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      })
        .then(resp => resp.json())
        .then(data => {
          const text = data.translatedText
          this.setState({
            originalModalBody: this.state.modalBody,
            modalBody: text,
            translated: !this.state.translated
          })
        })
        .catch(err => console.error(`Error - ${err}`))
    }
  }

  handleDelete (mailId) {
    const host = window.location.host
    fetch(`https://api.${host}/inbox/delete`, {
      method: 'post',
      body: JSON.stringify({ m: mailId }),
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
      .then(resp => resp.json())
      .then(data => {
        console.log(data)
        if (data.status === 'complete') {
          const array = [...this.state.inboxMails]
          const index = this.state.inboxMails.findIndex(el => el.id === data.id)
          if (index !== -1) {
            array.splice(index, 1)
            this.setState({ inboxMails: array })
          }
        }
      })
      .catch(err => console.error(`Error - ${err}`))
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
                            <div className='inbox-from-text'>{mail.from}</div>
                            <div className='inbox-subject-text'>{mail.subject}</div>
                          </ListGroupItemHeading>
                          <ListGroupItemText>
                            {mail.snippet}
                          </ListGroupItemText>
                        </div>
                        <ButtonGroup className='inbox-btn-group'>
                          <Link
                            href={{
                              pathname: '/maintenance',
                              query: {
                                id: 'NEW',
                                mailId: mail.id,
                                name: mail.domain,
                                from: mail.from,
                                subject: mail.subject,
                                maileingang: mail.date,
                                body: mail.body
                              }
                            }}
                            as='/m/new'
                          >
                            <Button className='mail-edit-btn' outline>
                              <FontAwesomeIcon width='1.2em' className='edit-icon' icon={faPencilAlt} />
                            </Button>
                          </Link>
                          <Button onClick={() => this.handleDelete(mail.id)} className='mail-edit-btn' outline>
                            <FontAwesomeIcon width='1.2em' className='edit-icon' icon={faTrashAlt} />
                          </Button>
                        </ButtonGroup>
                      </div>
                    </ListGroupItem>
                  )
                })}
                <Modal className='mail-modal-body' animation backdrop backdropClassName='modal-backdrop' open={open} size='lg' toggle={this.toggle}>
                  <ModalHeader>
                    <div className='modal-header-text'>
                      <div className='modal-from-text'>{this.state.modalFrom}</div>
                      <small className='modal-subject-text'>{this.state.modalSubject}</small>
                    </div>
                    <Button style={{ padding: '1em' }} onClick={this.handleTranslate.bind(this)}>
                      <FontAwesomeIcon width='1.5em' className='translate-icon' icon={faLanguage} />
                    </Button>
                  </ModalHeader>
                  <ModalBody className='mail-body' dangerouslySetInnerHTML={{ __html: this.state.modalBody }} />
                </Modal>
              </ListGroup>
            </CardBody>
            <CardFooter />
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
            :global(.mail-edit-btn) {
              height: 50px;
              width: 50px;
              padding: 0;
              align-self: center;
            }
            :global(.mail-badge) {
              min-width: 68px;
              min-height: 64px;
              align-self: center;
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
              align-self: center;
              margin-left: -50px;
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
              width: 50px;
              transform: translate(-8px, 0px);
              transition: all 150ms ease-in-out;
              transition: visibility 0s, opacity 200ms ease-in-out;
            }
            :global(.mail-badge:hover) > .mail-icon {
              visibility: hidden;
              opacity: 0;
              transition: visibility 0s, opacity 200ms ease-in-out;
            }
            .mail-btn-group {
              display: flex;
            }
            .mail-info {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              justify-content: center;
            }
            .inbox-from-text {

            }
            .inbox-subject-text {
              max-height: 25px;
              overflow:hidden;
              font-weight: 700;
              letter-spacing: -1px;
            }
            :global(.list-group-item-text) {
            }
            .modal-subject-text {
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
            :global(.modal-backdrop) {
              background-color: #000;
              transition: all 150ms ease-in-out;
            }
            :global(.modal-backdrop.show) {
              opacity: 0.5;
            }
            .modal-header-text {
              flex-grow: 1;
            }
            :global(.modal-title) {
              display: flex;
              justify-content: space-between;
              width: 100%;
              align-items: center;
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
