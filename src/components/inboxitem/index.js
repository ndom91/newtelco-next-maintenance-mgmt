import React, { useState } from 'react'
import Link from 'next/link'
import {
  Panel,
  Badge,
  Icon,
  Button,
  IconButton,
  ButtonGroup,
  Whisper,
  Loader,
  Tooltip
} from 'rsuite'
import {
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText
} from 'shards-react'

const InboxItem = ({ mail, index, windowWidth }) => {
  const [loading, setLoading] = useState(true)

  const handleImageLoad = () => {
    setLoading(false)
  }

  return (
    <Panel bordered key={mail.id}>
      <div className='mail-wrapper'>
        <Whisper speaker={<Tooltip>Read Mail</Tooltip>}>
          <IconButton loading={loading} appearance='ghost' className='read-mail-btn' onClick={() => this.toggle(mail.id)} icon={<img alt='Icon' src={mail.faviconUrl} onLoad={() => handleImageLoad()} />} />
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
        <ButtonGroup className='inbox-btn-group'>
          {/* {windowWidth < 500
            ? (
              <IconButton onClick={() => this.toggle(mail.id)} icon={<img alt='Icon' className='mail-icon' src={mail.faviconUrl} />} />
            ) : (
              <></>
            )} */}
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
            <Button className='mail-edit-btn pencil-icon' outline>
              {/* <FontAwesomeIcon width='1.2em' className='edit-icon' icon={faPencilAlt} /> */}
            </Button>
          </Link>
          <Button onClick={() => this.handleDelete(mail.id)} className='mail-edit-btn trash-icon' outline>
            {/* <FontAwesomeIcon width='1.2em' className='edit-icon' icon={faTrashAlt} /> */}
          </Button>
        </ButtonGroup>
      </div>
    </Panel>
  )
}

export default InboxItem
