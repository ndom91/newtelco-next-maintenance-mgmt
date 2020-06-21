import React, { useState } from 'react'
import Notify from '@/newtelco-utils/notification'
import { Tag } from 'rsuite'

const CustomerCid = props => {
  const [hover, setHover] = useState(false)
  const copyToClipboard = () => {
    navigator.clipboard.writeText(props.data.kundenCID)
    Notify('info', 'Customer CID Copied to Clipboard')
  }
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {props.data.kundenCID}
      <Tag
        style={{
          visibility: hover ? 'visible' : 'hidden',
          opacity: hover ? '0.9' : '0',
        }}
        onClick={copyToClipboard}
        className='copy-btn'
      >
        Copy
      </Tag>
    </div>
  )
}

export default CustomerCid
