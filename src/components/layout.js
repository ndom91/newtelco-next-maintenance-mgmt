import React, { useState, useEffect } from 'react'
import MaintHeader from './header'
import useSWR from 'swr'
import Router from 'next/router'
import dynamic from 'next/dynamic'
import KeyboardShortcuts from './keyboardShortcuts'
import { NextAuth } from 'next-auth/client'
import Store from './store'
import Fonts from './fonts'
import {
  Container,
  Content,
  Modal,
  Button,
  FlexboxGrid
} from 'rsuite'

// TODO: Darkmode
// https://github.com/kazzkiq/darkmode

const UnreadFavicon = dynamic(
  () => import('./unreadcount'),
  { ssr: false }
)

const Layout = ({ session, children }) => {
  const [openA2HS, setOpenA2HS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [night, setNight] = useState(false)
  const store = Store.useStore()

  const { data } = useSWR(
    `/v1/api/count`,
    url => fetch(url).then(res => res.json()),
    { refreshInterval: 30000, focusThrottleInterval: 10000 }
  )

  useEffect(() => {
    store.set('count')(data ? data.count : 0)
  }, [data])

  useEffect(() => {
    Fonts()

    let nightStorage = window.localStorage.getItem('theme')
    const mqNight = window.matchMedia('(prefers-color-scheme: dark)').matches
    const installAsk = window.localStorage.getItem('askA2HS') || 0

    if (window.outerWidth < 500 && installAsk < 3) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        setOpenA2HS(!openA2HS)
        setDeferredPrompt(e)
        window.localStorage.setItem('askA2HS', parseInt(installAsk) + 1)
      })
    }

    if (nightStorage === undefined && mqNight) {
      nightStorage = 'dark'
    } else {
      nightStorage = 'light'
    }

    var el = document.querySelector('html')
    el.setAttribute('data-theme', nightStorage)

    setNight(nightStorage === 'dark')
    store.set('night')(nightStorage === 'dark')
  }, [])

  const toggleA2HSModal = () => {
    setOpenA2HS(!openA2HS)
  }

  const addToHomescreen = () => {
    deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
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
      setDeferredPrompt(null)
      setOpenA2HS(!openA2HS)
    })
  }

  return (
    <div>
      <KeyboardShortcuts>
        <UnreadFavicon count={store.get('count')} />
        <Container>
          <MaintHeader unread={store.get('count')} night={night} />
          <Content>
            <FlexboxGrid justify='center'>
              <FlexboxGrid.Item colspan={23} style={{ marginTop: '20px' }}>
                {children}
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Content>
        </Container>
        <Modal className='a2hs-modal' backdrop='static' size='md' show={openA2HS} onHide={() => toggleA2HSModal} style={{ marginTop: '75px' }}>
          <Modal.Header className='keyboard-shortcut-header'>
                Save Application
          </Modal.Header>
          <Modal.Body className='keyboard-shortcut-body'>
            <Container className='keyboard-shortcut-container'>
                Do you want to save this app to the homescreen?
              <Button style={{ width: '100%', marginTop: '20px' }} onClick={addToHomescreen} className='a2hs-btn'>
                  Add to Homescreen
              </Button>
            </Container>
          </Modal.Body>
        </Modal>
      </KeyboardShortcuts>
    </div>
  )
}

export default Layout
