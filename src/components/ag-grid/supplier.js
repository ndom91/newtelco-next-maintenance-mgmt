import React from 'react'
import { FlexboxGrid } from 'rsuite'

const UpdatedAt = ({ node }) => {
  return (
    <FlexboxGrid justify='start' align='middle'>
      <FlexboxGrid.Item>
        <img
          src={`https://www.google.com/s2/favicons?domain=${node.data.mailDomain}`}
          style={{ padding: '5px' }}
          alt='Domain Favicon'
        />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item>
        <span>{node.data.name}</span>
      </FlexboxGrid.Item>
    </FlexboxGrid>
  )
}

export default UpdatedAt
