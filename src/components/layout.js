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

  componentDidMount () {
    const night = window.localStorage.getItem('theme')
    this.setState({
      night: night === 'dark'
    })
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

  onToggleNight = () => {
    if (this.state.night) {
      document.documentElement.setAttribute('data-theme', 'light')
      window.localStorage.setItem('theme', 'light')
    } else {
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
              :global(.card-body h5) {
                color: var(--font-color);
                font-weight: 100 !important;
              }
              :global(.card-header > h2) {
                color: var(--font-color);
                font-weight: 100 !important;
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
              :global(.ag-theme-material .ag-row) {
                border-color: ${this.state.night ? '#313131 !important' : '#e1e3e4 !important'};
              }
              :global(.ag-theme-material .ag-row-hover) {
                background-color: ${this.state.night ? '#121212' : ''};
              }
              :global(.ag-theme-material .ag-header) {
                background-color: ${this.state.night ? '#272727' : '#fff'} !important;
                color: ${this.state.night ? '#fff' : ''};
              }
              :global(.ag-theme-material .ag-row-selected) {
                background-color: ${this.state.night ? '#67B246' : '#eee'} !important;
              }
              :global(.ag-theme-material .ag-header-group-cell:not(.ag-column-resizing) + .ag-header-group-cell:hover, .ag-theme-material .ag-header-group-cell:not(.ag-column-resizing) + .ag-header-group-cell.ag-column-resizing, .ag-theme-material .ag-header-cell:not(.ag-column-resizing) + .ag-header-cell:hover, .ag-theme-material .ag-header-cell:not(.ag-column-resizing) + .ag-header-cell.ag-column-resizing, .ag-theme-material .ag-header-group-cell:first-of-type:hover, .ag-theme-material .ag-header-group-cell:first-of-type.ag-column-resizing, .ag-theme-material .ag-header-cell:first-of-type:hover, .ag-theme-material .ag-header-cell:first-of-type.ag-column-resizing) {
                background-color: var(--bg-secondary);
              }
              :global(.ag-theme-material .ag-paging-page-summary-panel .ag-paging-button.ag-disabled .ag-icon) {
                color: ${this.state.night ? '#fff' : ''};
              }
              :global(.row-emergency) {
                background: ${this.state.night ? 'repeating-linear-gradient( 45deg, #272727, #272727 10px, #c3565f2d 10px, #c3565f2d 20px) !important' : ''};
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
