import React from 'react'
import {
  Avatar,
  Panel,
  FlexboxGrid
} from 'rsuite'

const Comment = ({ data }) => {
  const username = data.user.match(/^([^@]*)@/)[1]
  return (
    <FlexboxGrid>
      <FlexboxGrid.Item colspan={22}>
        <Panel
          border
          header={<span style={{ color: 'var(--grey2)', fontSize: '0.8rem' }}>{data.datetime}</span>}
          style={{ display: 'flex', flexDirection: 'column-reverse' }}
        >
          {data.body}
        </Panel>
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={2}>
        <Avatar
          src={`/static/images/avatars/${username}.png`}
          circle
          style={{ color: 'var(--primary)' }}
        />
      </FlexboxGrid.Item>
    </FlexboxGrid>
  )
}

export default Comment
