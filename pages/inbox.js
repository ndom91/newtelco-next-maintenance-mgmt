import React from 'react'
import Layout from '../src/components/layout'
import Footer from '../src/components/footer'
import Link from 'next/link'
import Router from 'next/router'
import RequireLogin from '../src/components/require-login'
import fetch from 'isomorphic-unfetch'
import { NextAuth } from 'next-auth/client'
import cogoToast from 'cogo-toast'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UnreadCount from '../src/components/unreadcount'
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
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://api.${host}/inbox`
    const res = await fetch(pageRequest, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
    const json = await res.json()
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
      night: query.night,
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
    const host = window.location.host
    if (Array.isArray(this.props.jsonData)) {
      this.props.jsonData.forEach((mail, index) => {
        const mailDomain = mail.domain
        fetch(`https://api.${host}/favicon?d=${mailDomain}`, {
          method: 'get'
        })
          .then(resp => resp.json())
          .then(data => {
            const iconUrl = data.icons
            if (data.icons.substr(0, 4) !== 'http') {
              const newInboxMails = this.state.inboxMails
              newInboxMails[index].faviconUrl = `https://${iconUrl}`
              this.setState(prevState => ({
                inboxMails: newInboxMails
              }))
            } else {
              const newInboxMails = this.state.inboxMails
              newInboxMails[index].faviconUrl = iconUrl
              this.setState(prevState => ({
                inboxMails: newInboxMails
              }))
            }
          })
      })
    }
  }

  toggle (mailId) {
    const {
      inboxMails
    } = this.state

    if (mailId) {
      const activeMail = inboxMails.findIndex(el => el.id === mailId)

      let mailBody = inboxMails[activeMail].body
      const htmlRegex = new RegExp(/<(?:"[^"]*"[`"]*|'[^']*'['"]*|[^'">])+>/, 'gi')
      // const htmlRegex2 = new RegExp('<([a-z]+)[^>]*(?<!/)>', 'gi')
      // const htmlRegex3 = new RegExp('<meta .*>', 'gi')

      if (htmlRegex.test(mailBody)) {
        console.log('html true')
        this.setState({
          incomingMailIsHtml: true
        })
      } else {
        console.log('html false')
        mailBody = `<pre>${mailBody}</pre>`
        this.setState({
          incomingMailIsHtml: false
        })
      }
      this.setState({
        open: !this.state.open,
        modalSubject: inboxMails[activeMail].subject,
        modalFrom: inboxMails[activeMail].from,
        modalBody: mailBody
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

  handleSearchSelection = selection => {
    const newLocation = `/maintenance?id=${selection.id}`
    Router.push(newLocation)
    // Router.pushRoute(`/maintenance?id=${selection.id}`)
    // this.setState({ selection })
  }

  render () {
    if (this.props.session.user) {
      const {
        inboxMails,
        open
      } = this.state

      return (
        <Layout night={this.props.night} handleSearchSelection={this.handleSearchSelection} unread={this.props.unread} session={this.props.session}>
          {UnreadCount()}
          <Card style={{ maxWidth: '100%' }}>
            <CardHeader><h2>Inbox</h2></CardHeader>
            <CardBody>
              <ListGroup>
                <TransitionGroup>
                  {Array.isArray(inboxMails) && inboxMails.length !== 0
                    ? inboxMails.map((mail, index) => {
                      return (
                        <CSSTransition
                          key={mail.id}
                          timeout={500}
                          classNames='item'
                        >
                          <ListGroupItem key={mail.id}>
                            <div className='mail-wrapper'>
                              {this.state.windowInnerWidth > 500
                                ? (
                                  <Badge outline theme='light' className='mail-badge'>
                                    <img className='mail-icon' src={mail.faviconUrl} />
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
                                      <img className='mail-icon' src={mail.faviconUrl} />
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
                                  passHref
                                  as='/maintenance/new'
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
                    }) : (
                      null
                    )}

                  {!Array.isArray(inboxMails) && (
                    <div className='inbox0-wrapper'>
                      <img src='/static/images/inbox0.svg' alt='Inbox 0' style={{ width: '400px' }} />
                      <h4 className='inbox0-text'>Congrats, nothing to do!</h4>
                    </div>
                  )}
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
                flex-direction: column !important;
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
                min-height: 64px !important;
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
                font-size: 20px;
              }
              .mail-info {
                max-width: 80%;
              }
            }
            :global(.inbox0-text) {
              font-family: Poppins, Helvetica;
              font-weight: 200 !important;
              margin-top: 20px;
              color: var(--font-color);
            }
            :global(.inbox0-wrapper) {
              display: flex;
              align-items: center;
              flex-direction: column;
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
              align-items: center;
            }
            :global(#translate-tooltip) {
              transition: all 200ms ease-in-out;
              min-height: 60px;
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
              display: flex;
              justify-content: center;
            }
            :global(.mail-badge) {
              min-width: 68px;
              max-height: 64px;
              transition: all 150ms ease-in-out;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            :global(.inbox-btn-group) {
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: row;
            }
            :global(.list-group-item) {
              background-color: var(--primary-bg);
              color: var(--font-color);
              border-color: var(--border-color);
            }
            :global(.list-group-item-heading) {
              margin: 0 10px;
              color: var(--font-color);
            }
            :global(.list-group-item-text) {
              margin: 0 10px;
              color: var(--font-color);
            }
            :global(.mail-open-icon) {
              color: var(--primary);
              align-self: center;
              margin-left: -40px;
              margin-bottom: 0px;
              font-size: 20px;
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
              height: 40px;
              width: 40px;
              transform: translate(-5px, 0px);
              transition: all 150ms ease-in-out;
              transition: visibility 0s, opacity 200ms ease-in-out;
              margin: 5px 0;
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
              height: ${this.state.incomingMailIsHtml ? '100%' : '550px'};
              overflow-y: ${this.state.incomingMailIsHtml ? 'scroll' : 'hidden'};
              background-color: var(--primary-bg);
              color: var(--font-color);
            }
            :global(.mail-body > :first-child) {
              position: ${this.state.incomingMailIsHtml ? 'relative' : 'absolute'};
              top: 0;
              left: 0;
              height: ${this.state.incomingMailIsHtml ? '' : '100%'};
              width: 100%;
              padding: 40px;
              overflow-y: ${this.state.incomingMailIsHtml ? 'hidden' : 'scroll'};
              background-color: var(--primary-bg);
            }
            :global(.mail-modal-body .modal-header) {
              background-color: var(--secondary-bg);
              color: var(--font-color);
            }
            :global(.mail-body *) {
              color: var(--font-color);
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
