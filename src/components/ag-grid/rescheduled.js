import React from 'react'
import { Badge } from 'rsuite'

export const RescheduledIcon = ({ node }) => {
  if (node.data.rescheduled) {
    return (
      // Rescheduled
      <span>
        <Badge
          content={node.data.rescheduled}
          style={{
            display: 'flex',
            justifyContent: 'center',
            height: '50px',
            alignItems: 'center',
          }}
        >
          <svg
            height="30"
            width="30"
            stroke="var(--primary)"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Badge>
      </span>
    )
  } else {
    return (
      // Not rescheduled
      <span
        style={{
          display: 'flex',
          justifyContent: 'center',
          height: '50px',
          alignItems: 'center',
        }}
      >
        <svg height="30" width="30" fill="var(--grey4)" viewBox="0 0 20 20">
          <path
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
            fillRule="evenodd"
          />
        </svg>
      </span>
    )
  }
}
