import React, { useState } from 'react'
import Link from 'next/link'
import './inbox.css'
import {
  Panel,
  IconButton,
  ButtonGroup,
  Whisper,
  Tooltip
} from 'rsuite'
import {
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText
} from 'shards-react'

const InboxItem = ({ mail, index, handleDelete }) => {
  const [loading, setLoading] = useState(true)

  const handleImageLoad = () => {
    setLoading(false)
  }

  return (
    <Panel bordered key={mail.id}>
      <div className='mail-wrapper'>
        <Whisper speaker={<Tooltip>Read Mail</Tooltip>}>
          <IconButton
            loading={loading}
            appearance='ghost'
            className='read-mail-btn'
            onClick={() => this.toggle(mail.id)}
            icon={
              <img
                alt='Icon'
                src={mail.faviconUrl}
                onLoad={() => handleImageLoad()}
                onError={() => handleImageLoad()}
              />
            }
          />
        </Whisper>
        <div className='mail-info'>
          <ListGroupItemHeading>
            <div className='inbox-from-text'>{mail.from}</div>
            <div className='inbox-subject-text'>{mail.subject}</div>
          </ListGroupItemHeading>
          <ListGroupItemText>
            {mail.snippet}
          </ListGroupItemText>
        </div>
        <ButtonGroup className='inbox-btn-group' vertical>
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
