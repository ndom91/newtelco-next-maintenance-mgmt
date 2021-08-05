import React from "react"

export const MaintId = ({ node }) => {
  const maintId = node.data.id
  return `NT-${maintId}`
}
