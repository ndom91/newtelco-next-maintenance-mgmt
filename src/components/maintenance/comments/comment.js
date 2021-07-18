import React from 'react'
import NextAuth from 'next-auth/client'
import { Avatar, FlexboxGrid, Dropdown, Icon, IconButton } from 'rsuite'

const Comment = ({ data, handleDelete }) => {
  const [session, loading] = NextAuth.useSession()
  const username = data.user.match(/^([^@]*)@/)[1]

  return (
    <FlexboxGrid>
      <FlexboxGrid.Item colspan={3} style={{ marginTop: '10px' }}>
        <Avatar
          src={`/static/images/avatars/${username}.png`}
          circle
          style={{
            color: 'var(--primary)',
            border: '2px solid var(--primary)',
          }}
        />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={19}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          <span
            style={{
              color: 'var(--grey2)',
              fontSize: '0.8rem',
              marginBottom: '20px',
            }}
          >
            {data.datetime}
          </span>
          <span style={{ marginBottom: '10px' }}>{data.body}</span>
        </div>
      </FlexboxGrid.Item>
      {!loading && session.user.email === data.user && (
        <FlexboxGrid.Item colspan={2}>
          <Dropdown
            placement="bottomEnd"
            renderTitle={() => {
              return (
                <IconButton
                  appearance="subtle"
                  icon={
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  }
                />
              )
            }}
          >
            <Dropdown.Item
              onClick={() => handleDelete(data.id)}
              className="deleteBtn"
              icon={
                <svg
                  width="18"
                  height="18"
                  style={{ marginRight: '5px' }}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              }
            >
              Delete
            </Dropdown.Item>
          </Dropdown>
        </FlexboxGrid.Item>
      )}
    </FlexboxGrid>
  )
}

export default Comment
