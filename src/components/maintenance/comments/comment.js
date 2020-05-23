import React from 'react'
import NextAuth from 'next-auth/client'
import {
  Avatar,
  FlexboxGrid,
  Dropdown,
  Icon,
  IconButton
} from 'rsuite'

const Comment = ({ data, handleDelete }) => {
  const [session, loading] = NextAuth.useSession()
  const username = data.user.match(/^([^@]*)@/)[1]

  return (
    <FlexboxGrid>
      <FlexboxGrid.Item colspan={3} style={{ marginTop: '10px' }}>
        <Avatar
          src={`/static/images/avatars/${username}.png`}
          circle
          style={{ color: 'var(--primary)', border: '2px solid var(--primary)' }}
        />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={19}>
        <div
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}
        >
          <span style={{ color: 'var(--grey2)', fontSize: '0.8rem', marginBottom: '20px' }}>{data.datetime}</span>
          <span style={{ marginBottom: '10px' }}>{data.body}</span>
        </div>
      </FlexboxGrid.Item>
      {!loading && session.user.email === data.user && (
        <FlexboxGrid.Item colspan={2}>
          <Dropdown
            placement='bottomEnd'
            renderTitle={() => {
              return <IconButton appearance='subtle' icon={<Icon icon='ellipsis-v' />} />
            }}
          >
            <Dropdown.Item onClick={() => handleDelete(data.id)} icon={<Icon icon='trash' />}>Delete</Dropdown.Item>
          </Dropdown>
        </FlexboxGrid.Item>
      )}
    </FlexboxGrid>
  )
}

export default Comment
