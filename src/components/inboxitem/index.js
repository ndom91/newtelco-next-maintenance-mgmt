import React, { useState, useEffect } from 'react'
import Router from 'next/router'
import UseAnimations from 'react-useanimations'
import trash2 from 'react-useanimations/lib/trash2'
import './inbox.css'
import {
  Panel,
  FlexboxGrid,
  IconButton,
  ButtonGroup,
  Whisper,
  Tooltip,
  Avatar,
} from 'rsuite'

const InboxItem = ({ toggle, mail, index, handleDelete }) => {
  const [loading, setLoading] = useState(true)
  const [faviconUrl, setFaviconUrl] = useState('')

  const createMaint = mail => {
    Router.push({
      pathname: '/maintenance',
      query: {
        id: 'NEW',
        mailId: mail.id,
        name: mail.domain,
        mailDomain: mail.domain,
        from: mail.from,
        subject: mail.subject,
        maileingang: mail.date,
        loaded: false,
      },
    })
  }

  useEffect(() => {
    try {
      fetch(`/v1/api/favicon?d=${mail.domain}`, {
        method: 'get',
      })
        .then(resp => resp.json())
        .then(data => {
          const iconUrl = data.icons
          if (data.icons.substr(0, 4) !== 'http') {
            setFaviconUrl(`https://${iconUrl}`)
          } else {
            setFaviconUrl(iconUrl)
          }
          setLoading(false)
        })
    } catch {
      setFaviconUrl('/static/images/office-building.png')
    }
  }, [mail])

  return (
    <Panel key={mail.id} className='mail-wrapper-panel'>
      <div className='mail-wrapper'>
        <Avatar
          alt='Icon'
          src={faviconUrl || ''}
          loading={loading}
          size='lg'
          style={{
            backgroundColor: 'transparent',
            width: '70px',
          }}
          onLoad={() => setLoading(false)}
        />
        <div className='mail-info'>
          <FlexboxGrid
            justify='start'
            align='middle'
            style={{ flexDirection: 'column' }}
          >
            <FlexboxGrid.Item>
              <h6>{mail.from}</h6>
              <h6>{mail.subject}</h6>
              <div>{mail.snippet}</div>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </div>
        <ButtonGroup vertical>
          <Whisper placement='left' speaker={<Tooltip>Read Mail</Tooltip>}>
            <IconButton
              appearance='subtle'
              size='md'
              style={{ justifyContent: 'start' }}
              onClick={() => toggle(mail.id)}
              icon={
                <svg
                  fill='none'
                  height='24'
                  width='24'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  viewBox='0 0 24 24'
                  stroke='var(--grey4)'
                >
                  <path d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'></path>
                </svg>
              }
            />
          </Whisper>
          <Whisper placement='left' speaker={<Tooltip>Edit</Tooltip>}>
            <IconButton
              appearance='subtle'
              onClick={() => createMaint(mail)}
              size='md'
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'start',
                display: 'flex',
              }}
              icon={
                <svg
                  height='24'
                  width='24'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  stroke='var(--grey4)'
                  viewBox='0 0 24 24'
                >
                  <path d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                </svg>
              }
            />
          </Whisper>
          <Whisper placement='left' speaker={<Tooltip>Delete</Tooltip>}>
            <IconButton
              appearance='subtle'
              size='md'
              onClick={() => handleDelete(mail.id)}
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'start',
                display: 'flex',
                padding: '4px',
                paddingLeft: '12px',
              }}
              icon={
                <UseAnimations
                  animation={trash2}
                  strokeColor='var(--grey4)'
                  size={28}
                  style={{
                    color: 'var(--grey4)',
                    cursor: 'pointer',
                  }}
                />
              }
            />
          </Whisper>
        </ButtonGroup>
      </div>
    </Panel>
  )
}

export default InboxItem
