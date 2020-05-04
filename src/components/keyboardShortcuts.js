import React, { useState } from 'react'
import Router from 'next/router'
import { Modal } from 'rsuite'
import { HotKeys } from 'react-hotkeys'

import {
  Container,
  Row,
  Col,
  Badge
} from 'shards-react'

const KeyboardShortcuts = props => {
  const [showHelpModal, setHelpModal] = useState(false)

  const keyMap = {
    TOGGLE_HELP: 'shift+?',
    NAV_HOME: 'alt+h',
    NAV_INBOX: 'alt+i',
    NAV_HISTORY: 'alt+y',
    NAV_SETTINGS: 'alt+s'
  }

  const handlers = {
    TOGGLE_HELP: () => setHelpModal(!showHelpModal),
    NAV_HOME: () => Router.push('/'),
    NAV_INBOX: () => Router.push('/inbox'),
    NAV_HISTORY: () => Router.push('/history'),
    NAV_SETTINGS: () => Router.push('/settings')
  }
  return (
    <HotKeys keyMap={keyMap} handlers={handlers}>
      <Modal backdropClassName='modal-backdrop' backdrop='static' size='md' show={showHelpModal} onHide={() => setHelpModal(!showHelpModal)} style={{ marginTop: '75px' }}>
        <Modal.Header className='keyboard-shortcut-header'>
              Keyboard Shortcuts
        </Modal.Header>
        <Modal.Body className='keyboard-shortcut-body'>
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
        </Modal.Body>
      </Modal>
      {props.children}
    </HotKeys>
  )
}

export default KeyboardShortcuts
