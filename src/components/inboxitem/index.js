import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import UseAnimations from 'react-useanimations'
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
    <Panel key={mail.id}>
      <div className='mail-wrapper'>
        <Whisper placement='top' speaker={<Tooltip>Read Mail</Tooltip>}>
          <IconButton
            loading={loading}
            appearance='link'
            onClick={() => toggle(mail.id)}
            style={{
              height: '85px',
              flexBasis: '100px',
              border: '1px solid #eaeaea',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            icon={
              <Avatar
                alt='Icon'
                src={faviconUrl || ''}
                size='lg'
                style={{ backgroundColor: 'transparent' }}
                onLoad={() => setLoading(false)}
              />
            }
          />
        </Whisper>
        <div className='mail-info'>
          <FlexboxGrid
            justify='start'
            align='middle'
            style={{ flexDirection: 'column' }}
          >
            <FlexboxGrid.Item>
              <h5>{mail.from}</h5>
              <h5>{mail.subject}</h5>
              <div>{mail.snippet}</div>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </div>
        <ButtonGroup vertical>
          <IconButton
            appearance='subtle'
            onClick={() => createMaint(mail)}
            size='lg'
            style={{
              height: '50px',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
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
          <IconButton
            appearance='subtle'
            size='lg'
            onClick={() => handleDelete(mail.id)}
            style={{
              height: '50px',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
            }}
            icon={
              <UseAnimations
                animationKey='trash2'
                size={32}
                style={{
                  color: 'var(--grey4)',
                  cursor: 'pointer',
                }}
              />
              // <svg
              //   height='24'
              //   width='24'
              //   fill='none'
              //   strokeLinecap='round'
              //   strokeLinejoin='round'
              //   strokeWidth='2'
              //   stroke='var(--grey4)'
              //   viewBox='0 0 24 24'
              // >
              //   <path d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
              // </svg>
            }
          />
        </ButtonGroup>
      </div>
    </Panel>
  )
}

export default InboxItem
