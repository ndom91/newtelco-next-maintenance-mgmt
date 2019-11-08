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
  Badge,
  Button
} from 'shards-react'

export default class Layout extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      openHelpModal: false,
      openA2HSModal: false,
      deferredPrompt: null
    }
    this.handleSignOutSubmit = this.handleSignOutSubmit.bind(this)
    this.toggleHelpModal = this.toggleHelpModal.bind(this)
    this.toggleA2HSModal = this.toggleA2HSModal.bind(this)
    this.addToHomescreen = this.addToHomescreen.bind(this)
  }

  componentDidMount () {
    const night = window.localStorage.getItem('theme')
    const installAsk = window.localStorage.getItem('askA2HS') || 0

    if (window.outerWidth < 500 && installAsk < 3) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.setState({
          openA2HSModal: !this.state.openA2HSModal,
          deferredPrompt: e
        })
        window.localStorage.setItem('askA2HS', parseInt(installAsk) + 1)
      })
    }

    var el = document.querySelector('html')
    el.setAttribute('data-theme', night)

    this.setState({
      night: night === 'dark'
    })
  }

  toggleA2HSModal () {
    this.setState({
      openA2HSModal: !this.state.openA2HSModal
    })
  }

  addToHomescreen () {
    this.state.deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    this.state.deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult)
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt')
      } else {
        console.log('User dismissed the AA2HS prompt')
        const a2hsDismisCount = window.localStorage.getItem('a2hs')
        if (!a2hsDismisCount) {
          window.localStorage.setItem('a2hs', 0)
        }
        window.localStorage.setItem('a2hs', a2hsDismisCount + 1)
      }
      this.setState({
        deferredPrompt: null,
        openA2HSModal: !this.state.openA2HSModal
      })
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
      openHelpModal,
      openA2HSModal
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
            <Row className='top-level-row'>
              <Col className='toplevel-col' sm='12' lg='12'>
                {this.props.children}
              </Col>
            </Row>
            <Modal className='a2hs-modal' backdropClassName='a2hs-modal-backdrop' animation backdrop size='md' open={openA2HSModal} toggle={this.toggleA2HSModal} style={{ marginTop: '75px' }}>
              <ModalHeader className='keyboard-shortcut-header'>
                Save Application
              </ModalHeader>
              <ModalBody className='keyboard-shortcut-body'>
                <Container className='keyboard-shortcut-container'>
                  Do you want to save this app to the homescreen?
                  <Button style={{ width: '100%', marginTop: '20px' }} onClick={this.addToHomescreen} className='a2hs-btn'>
                    Add to Homescreen
                  </Button>
                </Container>
              </ModalBody>
            </Modal>
            <Modal backdropClassName='modal-backdrop' animation backdrop size='md' open={openHelpModal} toggle={this.toggleHelpModal} style={{ marginTop: '75px' }}>
              <ModalHeader className='keyboard-shortcut-header'>
                Keyboard Shortcuts
              </ModalHeader>
              <ModalBody className='keyboard-shortcut-body'>
                <Container className='keyboard-shortcut-container'>
                  {typeof window !== 'undefined' && window.location.pathname === '/settings'
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
                      <>
                        <Row className='keyboard-row'>
                          <Col>
                            <Badge className='key-badge' outline theme='primary'>ALT</Badge> <span className='keyboard-plus'>+</span><Badge className='key-badge' outline theme='primary'>R</Badge>
                          </Col>
                          <Col>
                            Toggle Read Mail
                          </Col>
                        </Row>
                        <Row className='keyboard-row'>
                          <Col>
                            <Badge className='key-badge' outline theme='primary'>ALT</Badge> <span className='keyboard-plus'>+</span><Badge className='key-badge' outline theme='primary'>L</Badge>
                          </Col>
                          <Col>
                            Delete Reschedule
                          </Col>
                        </Row>
                      </>
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
                background-color: ${this.state.night ? 'rgba(103, 178, 70, 0.1)' : '#eee'} !important;
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
              :global(::-webkit-scrollbar-track) {
                  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0);
                  border-radius: 10px;
                  background-color: rgba(0,0,0,0);
              }
              :global(::-webkit-scrollbar) {
                width: 8px;
                height: 8px;
                background-color: transparent;
              }
              :global(::-webkit-scrollbar-thumb) {
                border-radius: 10px;
                -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.2);
                background-color: rgba(0,0,0,0.4);
              }
              :global(.a2hs-modal-backdrop) {
                opacity: 0.9 !important;
                background-color: #212529 !important;
               }
              :global(.a2hs-modal) {
                position: absolute;
                bottom: 0;
                left: 50%;
                width: 96%;
              }
              @media only screen and (max-width: 500px) {
                :global(.navbar) {
                  position: fixed;
                  z-index: 1000;
                  width: 100%;
                }
                :global(.top-card-wrapper) {
                  margin-top: 60px;
                }
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
                :global(.a2hs-modal) {
                  left: 0;
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
