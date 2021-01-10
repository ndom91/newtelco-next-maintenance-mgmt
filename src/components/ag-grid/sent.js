import React from 'react'
import { Badget } from 'rsuite'
import { Icon } from '@rsuite/icons'

const SentIcon = ({ node }) => {
  const { sent } = node.data

  if (sent === '2' || sent === 2) {
    return (
      <div style={{ width: '32px', height: '40px' }}>
        <Badge content={sent}>
          <Icon
            style={{ color: 'var(--primary)' }}
            size='lg'
            as='check-circle'
          />
        </Badge>
      </div>
    )
  } else if (sent === '1' || sent === 1) {
    return (
      <div style={{ width: '32px', height: '40px' }}>
        <Icon
          style={{ color: 'var(--primary)' }}
          size='lg'
          as='check-circle'
        />
      </div>
    )
  } else {
    return (
      <div style={{ width: '32px', height: '40px' }}>
        <Icon size='lg' as='warning' />
      </div>
    )
  }
}

export default SentIcon
