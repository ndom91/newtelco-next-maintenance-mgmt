import React from 'react'

const MaintId = ({ node }) => {
  const maintId = node.data.id
  return `NT-${maintId}`
}

export default MaintId
