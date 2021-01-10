import React, { useState, useEffect } from 'react'
import { getSession } from 'next-auth/client'
import Layout from '@/newtelco/layout'
import RequireLogin from '@/newtelco/require-login'
import useSWR from 'swr'
import MaintPanel from '@/newtelco/panel'
import InboxItem from '@/newtelco/inboxitem'
import Notify from '@/newtelco-utils/notification'
import Store from '@/newtelco/store'
import {
  List,
  Modal,
  Avatar,
  IconButton,
  Input,
  InputGroup,
  Whisper,
  Tooltip,
  FlexboxGrid,
  Loader,
} from 'rsuite'
import { Icon } from '@rsuite/icons'

const Inbox = ({ session, inboxItems }) => {
  const store = Store.useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [faviconLoading, setFaviconLoading] = useState(false)
  const [modalInfo, setModalInfo] = useState({})
  const [isTranslated, setIsTranslated] = useState(false)
  const [ogModalBody, setOgModalBody] = useState('')
  // cleanup whether SWR gets inbox items initally or getInitialProps, or what
  const [inboxMails, setInboxMails] = useState(inboxItems)
  const { data } = useSWR(
    '/v1/api/inbox',
    url => fetch(url).then(res => res.json()),
    {
      refreshInterval: 30000,
      focusThrottleInterval: 10000,
      initialData: inboxMails,
    }
  )

  useEffect(() => {
    setInboxMails(data)
  }, [data])

  useEffect(() => {
    if (inboxMails.length > 0) {
      inboxMails.forEach((mail, index) => {
        if (mail.faviconUrl.length === 0) {
          const mailDomain = mail.domain
          fetch(`/v1/api/favicon?d=${mailDomain}`, {
            method: 'get',
          })
            .then(resp => resp.json())
            .then(data => {
              const iconUrl = data.icons
              const newInboxMails = inboxMails
              if (data.icons.substr(0, 4) !== 'http') {
                mail.faviconUrl = `https://${iconUrl}`
                newInboxMails[index] = mail
                setInboxMails(inboxMails)
              } else {
                mail.faviconUrl = iconUrl
                newInboxMails[index] = mail
                setInboxMails(newInboxMails)
              }
            })
        }
      })
    }
  }, [])

  const toggle = mailId => {
    if (mailId) {
      const activeMail = inboxMails.findIndex(el => el.id === mailId)

      let mailBody = inboxMails[activeMail].body
      const htmlRegex = new RegExp(
        /<(?:"[^"]*"[`"]*|'[^']*'['"]*|[^'">])+>/,
        'gi'
      )
      // const htmlRegex2 = new RegExp('<([a-z]+)[^>]*(?<!/)>', 'gi')
      // const htmlRegex3 = new RegExp('<meta .*>', 'gi')

      if (htmlRegex.test(mailBody)) {
      } else {
        mailBody = `<pre>${mailBody}</pre>`
      }
      const modalInfo = {
        subject: inboxMails[activeMail].subject,
        from: inboxMails[activeMail].from,
        favicon: inboxMails[activeMail].faviconUrl,
        body: mailBody,
      }
      setIsOpen(!isOpen)
      setFaviconLoading(true)
      setModalInfo(modalInfo)
    } else {
      setIsOpen(!isOpen)
    }
  }

  const handleTranslate = () => {
    const modalBody = modalInfo.body

    if (isTranslated) {
      setModalInfo({ ...modalInfo, body: ogModalBody })
      setIsTranslated(!isTranslated)
    } else {
      fetch('/v1/api/translate', {
        method: 'post',
        body: JSON.stringify({ q: modalBody }),
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      })
        .then(resp => resp.json())
        .then(data => {
          const text = data.translatedText
          setOgModalBody(modalBody)
          setModalInfo({ ...modalInfo, body: text })
          setIsTranslated(!isTranslated)
        })
        .catch(err => console.error(`Error - ${err}`))
    }
  }

  const onDelete = mailId => {
    fetch('/v1/api/inbox/delete', {
      method: 'post',
      body: JSON.stringify({ m: mailId }),
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 'complete') {
          Notify('success', 'Message Deleted')
          const newUnread = store.get('count') - 1
          const array = inboxMails
          const index = inboxMails.findIndex(el => el.id === data.id)
          if (index !== -1) {
            array.splice(index, 1)
            setInboxMails(array)
            store.set('count')(newUnread)
          }
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  if (session) {
    return (
      <Layout>
        <MaintPanel header='Inbox'>
          {inboxMails.length === 0 ? (
            <FlexboxGrid
              justify='center'
              align='middle'
              style={{ margin: '40px 0' }}
            >
              <FlexboxGrid.Item>
                <img
                  src='/static/images/inbox0.svg'
                  alt='Inbox'
                  style={{ width: '400px' }}
                />
                <h4 style={{ textAlign: 'center' }}>
                  Congrats, nothing to do!
                </h4>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          ) : (
            <List bordered style={{ width: '100%' }}>
              {Array.isArray(inboxMails) &&
                inboxMails.map((mail, index) => {
                  return (
                    <List.Item key={index}>
                      <InboxItem
                        mail={mail}
                        index={index}
                        handleDelete={onDelete}
                        toggle={toggle}
                      />
                    </List.Item>
                  )
                })}
            </List>
          )}
        </MaintPanel>
        {isOpen && (
          <Modal
            className='mail-modal-body'
            autoFocus
            backdrop
            show={isOpen}
            size='lg'
            onHide={() => toggle(null)}
            full
          >
            <Modal.Header>
              <FlexboxGrid
                justify='start'
                align='middle'
                style={{ width: '100%' }}
              >
                <FlexboxGrid.Item
                  colspan={2}
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  {faviconLoading && <Loader />}
                  <Avatar
                    size='lg'
                    src={modalInfo.favicon}
                    style={{
                      backgroundColor: 'transparent',
                      display: faviconLoading ? 'none' : 'block',
                    }}
                    onLoad={() => setFaviconLoading(false)}
                  />
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={20}>
                  <div className='modal-preview-text-wrapper'>
                    <InputGroup className='modal-textbox'>
                      <InputGroup.Addon
                        style={{ height: '31px' }}
                        type='prepend'
                      >
                        From
                      </InputGroup.Addon>
                      <Input readonly='readonly' value={modalInfo.from} />
                    </InputGroup>
                    <InputGroup className='modal-textbox'>
                      <InputGroup.Addon
                        style={{ height: '31px' }}
                        type='prepend'
                      >
                        Subject
                      </InputGroup.Addon>
                      <Input
                        type='text'
                        readonly='readonly'
                        value={modalInfo.subject}
                      />
                    </InputGroup>
                  </div>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={1} style={{ marginLeft: '30px' }}>
                  <Whisper
                    speaker={<Tooltip>Translate</Tooltip>}
                    placement='bottom'
                  >
                    <IconButton
                      onClick={handleTranslate}
                      appearance='default'
                      style={{ color: 'var(--grey3)' }}
                      size='lg'
                      icon={<Icon as='globe' />}
                    />
                  </Whisper>
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </Modal.Header>
            <Modal.Body className='mail-body'>
              <div
                dangerouslySetInnerHTML={{ __html: modalInfo.body }}
                style={{ padding: '20px' }}
              />
            </Modal.Body>
          </Modal>
        )}
      </Layout>
    )
  } else {
    return <RequireLogin />
  }
}

export async function getServerSideProps({ req }) {
  const host = req ? req.headers['x-forwarded-host'] : window.location.hostname
  let protocol = 'https:'
  if (host?.indexOf('localhost') > -1) {
    protocol = 'http:'
  }
  const res = await fetch(`${protocol}//${host}/v1/api/inbox`)
  const inboxContent = await res.json()
  return {
    props: {
      session: await getSession({ req }),
      inboxItems: inboxContent === 'No unread emails' ? [] : inboxContent,
    },
  }
}

export default Inbox
