import React from 'react'
import Header from './header'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import { HotKeys } from 'react-hotkeys'
import {
  Container,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  Badge
} from 'shards-react'

export default class Layout extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      openHelpModal: false,
      night: false
    }
    this.handleSignOutSubmit = this.handleSignOutSubmit.bind(this)
    this.toggleHelpModal = this.toggleHelpModal.bind(this)
  }

  handleSignOutSubmit (event) {
    event.preventDefault()
    NextAuth.signout()
      .then(() => {
        Router.push('/auth/callback')
      })
      .catch(err => {
        process.env.NODE_ENV === 'development' && console.err(err)
        Router.push('/auth/error?action=signout')
      })
  }

  toggleHelpModal () {
    this.setState({
      openHelpModal: !this.state.openHelpModal
    })
  }

  addClass = (elements, myClass) => {
    if (!elements) { return }
    if (typeof (elements) === 'string') {
      elements = document.querySelectorAll(elements)
    } else if (elements.tagName) { elements = [elements] }
    for (var i = 0; i < elements.length; i++) {
      if ((' ' + elements[i].className + ' ').indexOf(' ' + myClass + ' ') < 0) {
        elements[i].className += ' ' + myClass
      }
    }
  }

  removeClass = (elements, myClass) => {
    if (!elements) { return }
    if (typeof (elements) === 'string') {
      elements = document.querySelectorAll(elements)
    } else if (elements.tagName) { elements = [elements] }
    var reg = new RegExp('(^| )' + myClass + '($| )', 'g')
    for (var i = 0; i < elements.length; i++) {
      elements[i].className = elements[i].className.replace(reg, ' ')
    }
  }

  onToggleNight = () => {
    if (this.state.night) {
      this.removeClass('html', 'darkmode')
      this.removeClass('.unread-badge', 'darkmode')
      this.removeClass('.bg-secondary', 'darkmode-bgdark-dp2')
      this.removeClass('.card-body', 'darkmode-bgdark')
      this.removeClass('.card-header', 'darkmode-bgdark-dp2')
      this.removeClass('.card-footer', 'darkmode-bgdark-dp2')
      this.removeClass('.card-footer', 'darkmode-fgdark-dp2')
      this.removeClass('h1,h2,h3,h4,h5,h6', 'darkmode-bgdark-dp2')
      this.removeClass('.card', 'darkmode-bgdark-dp2')
      this.removeClass('.card', 'darkmode-boxshadow')
      this.removeClass('.badge-primary', 'darkmode-fgdark')
      this.removeClass('.list-group-item', 'darkmode-bgdark-dp2')
    } else {
      this.addClass('html', 'darkmode')
      this.addClass('.unread-badge', 'darkmode')
      this.addClass('.bg-secondary', 'darkmode-bgdark-dp2')
      this.addClass('.card-body', 'darkmode-bgdark')
      this.addClass('.card-header', 'darkmode-bgdark-dp2')
      this.addClass('.card-footer', 'darkmode-bgdark-dp2')
      this.addClass('.card-footer', 'darkmode-fgdark-dp2')
      this.addClass('h1,h2,h3,h4,h5,h6', 'darkmode-bgdark-dp2')
      this.addClass('.card', 'darkmode-bgdark-dp2')
      this.addClass('.card', 'darkmode-boxshadow')
      this.addClass('.badge-primary', 'darkmode-fgdark')
      this.addClass('.list-group-item', 'darkmode-bgdark-dp2')
    }
    this.setState({
      night: !this.state.night
    })
  }

  render () {
    const {
      openHelpModal
    } = this.state

    const keyMap = {
      TOGGLE_HELP: 'shift+?',
      NAV_HOME: 'alt+h',
      NAV_INBOX: 'alt+i',
      NAV_HISTORY: 'alt+y',
      NAV_SETTINGS: 'alt+s'
    }

    const handlers = {
      TOGGLE_HELP: this.toggleHelpModal,
      NAV_HOME: () => Router.push('/'),
      NAV_INBOX: () => Router.push('/inbox'),
      NAV_HISTORY: () => Router.push('/history'),
      NAV_SETTINGS: () => Router.push('/settings')
    }

    return (
      <div>
        <HotKeys keyMap={keyMap} handlers={handlers}>
          <Header night={this.state.night} toggleNight={this.onToggleNight} handleSearchSelection={this.props.handleSearchSelection} unread={this.props.unread} session={this.props.session} />
          <Container fluid>
            <Row style={{ height: '20px' }} />
            <Row>
              <Col className='toplevel-col' sm='12' lg='12'>
                {this.props.children}
              </Col>
            </Row>
            <Modal backdropClassName='modal-backdrop' animation backdrop size='md' open={openHelpModal} toggle={this.toggleHelpModal} style={{ marginTop: '75px' }}>
              <ModalHeader className='keyboard-shortcut-header'>
                Keyboard Shortcuts
              </ModalHeader>
              <ModalBody className='keyboard-shortcut-body'>
                <Container className='keyboard-shortcut-container'>
                  {typeof window !== 'undefined' && window.location.pathname === '/history'
                    ? (
                      <Row className='keyboard-row'>
                        <Col>
                          <Badge className='key-badge' outline theme='primary'>ALT</Badge> <span className='keyboard-plus'>+</span><Badge className='key-badge' outline theme='primary'>L</Badge>
                        </Col>
                        <Col>
                          Delete Selected
                        </Col>
                      </Row>
                    ) : (
                      null
                    )}
                  {typeof window !== 'undefined' && window.location.pathname === '/maintenance'
                    ? (
                      <Row className='keyboard-row'>
                        <Col>
                          <Badge className='key-badge' outline theme='primary'>ALT</Badge> <span className='keyboard-plus'>+</span><Badge className='key-badge' outline theme='primary'>R</Badge>
                        </Col>
                        <Col>
                          Toggle Read Mail
                        </Col>
                      </Row>
                    ) : (
                      null
                    )}
                  <Row className='keyboard-row'>
                    <Col>
                      <Badge className='key-badge' outline theme='primary'>ALT</Badge> <span className='keyboard-plus'>+</span><Badge className='key-badge' outline theme='primary'>H</Badge>
                    </Col>
                    <Col>
                      Home
                    </Col>
                  </Row>
                  <Row className='keyboard-row'>
                    <Col>
                      <Badge className='key-badge' outline theme='primary'>ALT</Badge> <span className='keyboard-plus'>+</span><Badge className='key-badge' outline theme='primary'>I</Badge>
                    </Col>
                    <Col>
                      Inbox
                    </Col>
                  </Row>
                  <Row className='keyboard-row'>
                    <Col>
                      <Badge className='key-badge' outline theme='primary'>ALT</Badge> <span className='keyboard-plus'>+</span><Badge className='key-badge' outline theme='primary'>Y</Badge>
                    </Col>
                    <Col>
                      History
                    </Col>
                  </Row>
                  <Row className='keyboard-row'>
                    <Col>
                      <Badge className='key-badge' outline theme='primary'>ALT</Badge> <span className='keyboard-plus'>+</span><Badge className='key-badge' outline theme='primary'>S</Badge>
                    </Col>
                    <Col>
                      Settings
                    </Col>
                  </Row>
                </Container>
              </ModalBody>
            </Modal>
            <style jsx>{`
              :root {
                --white: ${this.state.night ? '#444' : '#fff'} !important;
              }
              html {
                background-color: var(--white);
              }
              :global(.key-badge) {
                font-size: 90%;
                padding: 0.7rem;
              }
              .keyboard-plus {
                margin: 5px;
              }
              :global(.keyboard-row > .col:last-child) {
                font-size: 18px;
              }
              :global(.keyboard-shortcut-header > .modal-title) {
                justify-content: center !important;
              }
              :global(.keyboard-shortcut-header) {
                background: var(--light);
              }
              :global(.keyboard-shortcut-body) {
                padding: 1rem;
              }
              :global(.keyboard-row > .col) {
                display: flex;
                justify-content: center;
              }
              :global(.keyboard-row) {
                border-top: 1px solid var(--light);
                padding-top: 15px;
                padding-bottom: 15px;
              }
              :global(.keyboard-row:first-child) {
                border-top: none;
              }
              :global(.toplevel-col) {
                margin-bottom: 50px !important;
              }
              @media only screen and (min-width: 1024px) {
                :global(div.toplevel-col) {
                  flex: 1;
                  margin: 0 30px;
                }
              }
              @media only screen and (max-width: 1024px) {
                :global(div.toplevel-col) {
                  flex: 1;
                  margin: 0;
                }
              }
            `}
            </style>
          </Container>
        </HotKeys>
        {/* <Footer /> */}
      </div>
    )
  }
}
