import React from 'react'
import Layout from '../src/components/layout'
import Footer from '../src/components/footer'
import Link from 'next/link'
import RequireLogin from '../src/components/require-login'
import fetch from 'isomorphic-unfetch'
import { NextAuth } from 'next-auth/client'
import cogoToast from 'cogo-toast'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
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
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  Modal,
  ModalBody,
  ModalHeader,
  Tooltip
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
      translated: false,
      translateTooltipOpen: false,
      windowInnerHeight: 0,
      windowInnerWidth: 0
    }
    this.toggle = this.toggle.bind(this)
    this.toggleTooltip = this.toggleTooltip.bind(this)
  }

  componentDidMount () {
    this.setState({
      inboxMails: this.props.jsonData,
      windowInnerHeight: window.innerHeight,
      windowInnerWidth: window.innerWidth
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

  toggleTooltip () {
    this.setState({
      translateTooltipOpen: !this.state.translateTooltipOpen
    })
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
        if (data.status === 'complete') {
          cogoToast.success('Message Deleted!', {
            position: 'top-right'
          })
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
              <ListGroup>
                <TransitionGroup>
                  {inboxMails && inboxMails.map((mail, index) => {
                    return (
                      <CSSTransition
                        key={mail.id}
                        timeout={500}
                        // timeout={200 * index}
                        classNames='item'
                      >
                        <ListGroupItem key={mail.id}>
                          <div className='mail-wrapper'>
                            {this.state.windowInnerWidth > 500
                              ? (
                                <Badge outline theme='light' className='mail-badge'>
                                  {/* https://github.com/mat/besticon */}
                                  <img className='mail-icon' src={`https://besticon-demo.herokuapp.com/icon?size=40..100..360&url=${mail.domain}`} />
                                  <FontAwesomeIcon onClick={() => this.toggle(mail.id)} width='1.325em' className='mail-open-icon' icon={faEnvelopeOpenText} />
                                </Badge>
                              ) : (
                                <></>
                              )}
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
                              {this.state.windowInnerWidth < 500
                                ? (
                                  <Badge outline theme='light' className='mail-badge'>
                                    {/* https://github.com/mat/besticon */}
                                    <img className='mail-icon' src={`https://besticon-demo.herokuapp.com/icon?size=40..100..360&url=${mail.domain}`} />
                                    <FontAwesomeIcon onClick={() => this.toggle(mail.id)} width='1.525em' className='mail-open-icon' icon={faEnvelopeOpenText} />
                                  </Badge>
                                ) : (
                                  <></>
                                )}
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
                                <Button className='mail-edit-btn pencil-icon' outline>
                                  <FontAwesomeIcon width='1.2em' className='edit-icon' icon={faPencilAlt} />
                                </Button>
                              </Link>
                              <Button onClick={() => this.handleDelete(mail.id)} className='mail-edit-btn trash-icon' outline>
                                <FontAwesomeIcon width='1.2em' className='edit-icon' icon={faTrashAlt} />
                              </Button>
                            </ButtonGroup>
                          </div>
                        </ListGroupItem>
                      </CSSTransition>
                    )
                  })}
                </TransitionGroup>
              </ListGroup>
              <Modal className='mail-modal-body' animation backdrop backdropClassName='modal-backdrop' open={open} size='lg' toggle={this.toggle}>
                <ModalHeader>
                  <div className='modal-header-text'>
                    <div className='modal-from-text'>{this.state.modalFrom}</div>
                    <small className='modal-subject-text'>{this.state.modalSubject}</small>
                  </div>
                  <Button id='translate-tooltip' style={{ padding: '1em' }} onClick={this.handleTranslate.bind(this)}>
                    <FontAwesomeIcon width='1.5em' className='translate-icon' icon={faLanguage} />
                  </Button>
                </ModalHeader>
                <ModalBody className='mail-body' dangerouslySetInnerHTML={{ __html: this.state.modalBody }} />
                <Tooltip
                  open={this.state.translateTooltipOpen}
                  target='#translate-tooltip'
                  toggle={this.toggleTooltip}
                  placement='bottom'
                  noArrow
                >
                    Translate
                </Tooltip>
              </Modal>
            </CardBody>
            <Footer />
          </Card>
          <style jsx>{`
            @media only screen and (max-width: 500px) {
              :global(.inbox-btn-group) {
                display: flex;
                flex-direction: column;
                justify-content: center;
              }
              :global(.mail-open-icon) {
                margin-left: -50px;
              }
              :global(.mail-edit-btn) {
                border-radius: 0px;
              }
              :global(.list-group-item) {
                padding: 0.5rem !important;
              }
              :global(.mail-badge) {
                border: 1px solid var(--primary);
                min-width: 66px !important;
                width: 66px;
                border-radius: 5px 5px 0px 0px;
              }
              :global(.pencil-icon) {
                border-top: none;
                border-bottom: none;
              }
              :global(.trash-icon) {
                border-radius: 0px 0px 5px 5px !important;
              }
              :global(.btn-group > .btn) {
                flex: unset !important;
                height: 66px;
                width: 66px;
              }
              :global(.fa-pencil-alt),
              :global(.fa-trash-alt) {
                font-size: 25px;
              }
            }
            :global(.fa-language) {
              font-size: 20px;
            }
            :global(.item-enter) {
              opacity: 0;
            }
            :global(.item-enter-active) {
              opacity: 1;
              transition: all 500ms ease-in;
            }
            :global(.item-exit) {
              opacity: 1;
              transform: translateX(0);
            }
            :global(.item-exit-active) {
              opacity: 0;
              transform: translateX(100vw);
              transition: all 500ms ease-in;
            }
            .mail-wrapper {
              display: flex;
            }
            :global(#translate-tooltip) {
              transition: all 200ms ease-in-out;
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
              margin-bottom: -5px;
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
              transform: translate(-13px, 0px);
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
              font-weight: 400;
              letter-spacing: 1px;
            }
            .inbox-subject-text {
              max-height: 25px;
              overflow:hidden;
              font-weight: 700;
              letter-spacing: -1px;
            }
            :global(.list-group-item-heading > div) {
              padding-bottom: 3px;
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
