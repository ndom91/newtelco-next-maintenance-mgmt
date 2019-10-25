import React from 'react'
import Header from './header'
import Head from 'next/head'
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
    const nightTrue = this.props.night === 'true'
    this.state = {
      openHelpModal: false,
      night: nightTrue || false
    }
    this.handleSignOutSubmit = this.handleSignOutSubmit.bind(this)
    this.toggleHelpModal = this.toggleHelpModal.bind(this)
  }

  // componentDidMount () {
  //   if (this.state.night) {
  //     this.addClass('html', 'darkmode')
  //     this.addClass('.unread-badge', 'darkmode')
  //     this.addClass('.bg-secondary', 'darkmode-bgdark-dp2')
  //     this.addClass('.card-body', 'darkmode-bgdark')
  //     this.addClass('.card-header', 'darkmode-bgdark-dp2')
  //     this.addClass('.card-footer', 'darkmode-bgdark-dp2')
  //     this.addClass('.card-footer', 'darkmode-fgdark-dp2')
  //     this.addClass('h1,h2,h3,h5,h6', 'darkmode-bgdark-dp2')
  //     this.addClass('.card', 'darkmode-bgdark-dp2')
  //     this.addClass('.card', 'darkmode-boxshadow')
  //     this.addClass('.badge-primary', 'darkmode-fgdark')
  //     this.addClass('.list-group-item', 'darkmode-bgdark-dp2')
  //     this.addClass('.inbox0-text', 'darkmode-bgdark-dp4')
  //   } else if (!this.state.night) {
  //     this.removeClass('html', 'darkmode')
  //     this.removeClass('.unread-badge', 'darkmode')
  //     this.removeClass('.bg-secondary', 'darkmode-bgdark-dp2')
  //     this.removeClass('.card-body', 'darkmode-bgdark')
  //     this.removeClass('.card-header', 'darkmode-bgdark-dp2')
  //     this.removeClass('.card-footer', 'darkmode-bgdark-dp2')
  //     this.removeClass('.card-footer', 'darkmode-fgdark-dp2')
  //     this.removeClass('h1,h2,h3,h5,h6', 'darkmode-bgdark-dp2')
  //     this.removeClass('.card', 'darkmode-bgdark-dp2')
  //     this.removeClass('.card', 'darkmode-boxshadow')
  //     this.removeClass('.badge-primary', 'darkmode-fgdark')
  //     this.removeClass('.list-group-item', 'darkmode-bgdark-dp2')
  //     this.removeClass('.inbox0-text', 'darkmode-bgdark-dp4')
  //   }
  // }

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

  // addClass = (elements, myClass) => {
  //   if (!elements) { return }
  //   if (typeof (elements) === 'string') {
  //     elements = document.querySelectorAll(elements)
  //   } else if (elements.tagName) { elements = [elements] }
  //   for (var i = 0; i < elements.length; i++) {
  //     if ((' ' + elements[i].className + ' ').indexOf(' ' + myClass + ' ') < 0) {
  //       elements[i].className += ' ' + myClass
  //     }
  //   }
  // }

  // removeClass = (elements, myClass) => {
  //   if (!elements) { return }
  //   if (typeof (elements) === 'string') {
  //     elements = document.querySelectorAll(elements)
  //   } else if (elements.tagName) { elements = [elements] }
  //   var reg = new RegExp('(^| )' + myClass + '($| )', 'g')
  //   for (var i = 0; i < elements.length; i++) {
  //     elements[i].className = elements[i].className.replace(reg, ' ')
  //   }
  // }

  onToggleNight = () => {
    if (this.state.night) {
      // this.removeClass('html', 'darkmode')
      // this.removeClass('.unread-badge', 'darkmode')
      // this.removeClass('.bg-secondary', 'darkmode-bgdark-dp2')
      // this.removeClass('.card-body', 'darkmode-bgdark')
      // this.removeClass('.card-header', 'darkmode-bgdark-dp2')
      // this.removeClass('.card-footer', 'darkmode-bgdark-dp2')
      // this.removeClass('.card-footer', 'darkmode-fgdark-dp2')
      // this.removeClass('h1,h2,h3,h5,h6', 'darkmode-bgdark-dp2')
      // this.removeClass('.card', 'darkmode-bgdark-dp2')
      // this.removeClass('.card', 'darkmode-boxshadow')
      // this.removeClass('.badge-primary', 'darkmode-fgdark')
      // this.removeClass('.list-group-item', 'darkmode-bgdark-dp2')
      // this.removeClass('.inbox0-text', 'darkmode-bgdark-dp4')
      document.documentElement.setAttribute('data-theme', 'light')
      window.localStorage.setItem('theme', 'light')
    } else {
      // this.addClass('html', 'darkmode')
      // this.addClass('.unread-badge', 'darkmode')
      // this.addClass('.bg-secondary', 'darkmode-bgdark-dp2')
      // this.addClass('.card-body', 'darkmode-bgdark')
      // this.addClass('.card-header', 'darkmode-bgdark-dp2')
      // this.addClass('.card-footer', 'darkmode-bgdark-dp2')
      // this.addClass('.card-footer', 'darkmode-fgdark-dp2')
      // this.addClass('h1,h2,h3,h5,h6', 'darkmode-bgdark-dp2')
      // this.addClass('.card', 'darkmode-bgdark-dp2')
      // this.addClass('.card', 'darkmode-boxshadow')
      // this.addClass('.badge-primary', 'darkmode-fgdark')
      // this.addClass('.list-group-item', 'darkmode-bgdark-dp2')
      // this.addClass('.inbox0-text', 'darkmode-bgdark-dp4')
      document.documentElement.setAttribute('data-theme', 'dark')
      window.localStorage.setItem('theme', 'dark')
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
          <Head>
            <link rel='stylesheet' type='text/css' src={this.state.night ? '/static/css/darkmode.css' : ''} />
          </Head>
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
              :global(html) {
                background-color: var(--secondary-bg);
                color: var(--light);
              }
              :global(.card) {
                border-radius: 1rem;
                background-color: var(--primary-bg);
              }
              :global(.card-header > h2) {
                color: var(--font-color);
              }
              :global(.card-header) {
                background-color: var(--secondary-bg);
                color: var(--font-color);
              }
              :global(.card-body) {
                background-color: var(--primary-bg);
              }
              :global(.card-footer) {
                background-color: var(--secondary-bg);
                color: var(--bg-font-color);
              }
              :global([class^="ct-"]) {
                pointer-events: none
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
              :global(.card-header > h2) {
                font-weight: 100 !important;
              }
              :global(.ag-theme-material) {
                background-color: ${this.state.night ? '#272727' : '#fff'} !important;
              }
              :global(.ag-root-wrapper-body.ag-layout-normal) {
                background-color: ${this.state.night ? '#272727' : '#fff'} !important;
                color: ${this.state.night ? '#fff' : ''};
              }
              :global(.ag-theme-material .ag-paging-panel) {
                color: ${this.state.night ? '#fff' : ''};
              }
              :global(.ag-theme-material .ag-row-hover) {
                background-color: ${this.state.night ? '#121212' : ''};
              }
              :global(.ag-theme-material .ag-header) {
                background-color: ${this.state.night ? '#272727' : '#fff'} !important;
                color: ${this.state.night ? '#fff' : ''};
              }
              :global(.ag-theme-material .ag-row-selected) {
                background-color: ${this.state.night ? '' : '#eee'};
              }
              :global(.btn-dark) {
                color: ${this.state.night ? '#fff' : ''};
                border-color: ${this.state.night ? '#fff' : ''};
              }
              :global(.btn-outline-dark) {
                color: ${this.state.night ? '#fff' : ''};
                border-color: ${this.state.night ? '#fff' : ''};
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
