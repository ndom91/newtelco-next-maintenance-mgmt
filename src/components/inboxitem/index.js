import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import './inbox.css'
import {
  Panel,
  FlexboxGrid,
  IconButton,
  ButtonGroup,
  Whisper,
  Tooltip,
  Avatar
} from 'rsuite'

const InboxItem = ({ toggle, mail, index, handleDelete }) => {
  const [loading, setLoading] = useState(true)
  const [faviconUrl, setFaviconUrl] = useState('')

  const handleImageLoad = () => {
    setLoading(false)
  }

  useEffect(() => {
    fetch(`/v1/api/favicon?d=${mail.domain}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const iconUrl = data.icons
        if (data.icons.substr(0, 4) !== 'http') {
          const newInboxMails = this.state.inboxMails
          setFaviconUrl(`https://${iconUrl}`)
        } else {
          setFaviconUrl(iconUrl)
        }
      })
      .catch(err => console.error(err))
  }, [mail])

  return (
    <Panel key={mail.id}>
      <div className='mail-wrapper'>
        <Whisper placement='top' speaker={<Tooltip>Read Mail</Tooltip>}>
          <IconButton
            loading={loading}
            appearance='link'
            onClick={() => toggle(mail.id)}
            style={{ height: '74px' }}
            icon={
              <Avatar
                alt='Icon'
                size='lg'
                src={faviconUrl}
                style={{ backgroundColor: 'transparent' }}
                onLoad={() => handleImageLoad()}
                onError={() => handleImageLoad()}
              />
            }
          />
        </Whisper>
        <div className='mail-info'>
          <FlexboxGrid justify='start' align='middle' style={{ flexDirection: 'column' }}>
            <FlexboxGrid.Item>
              <h5>{mail.from}</h5>
              <h5>{mail.subject}</h5>
              <div>{mail.snippet}</div>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </div>
        <ButtonGroup vertical>
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
            <IconButton appearance='subtle' size='lg' icon={<svg height='24' width='24' fill='none' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' stroke='var(--grey4)' viewBox='0 0 24 24'><path d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' /></svg>} />
          </Link>
          <IconButton appearance='subtle' size='lg' onClick={() => handleDelete(mail.id)} icon={<svg height='24' width='24' fill='none' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' stroke='var(--grey4)' viewBox='0 0 24 24'><path d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' /></svg>} />
        </ButtonGroup>
      </div>
    </Panel>
  )
}

export default InboxItem
