import React from 'react'
import Link from 'next/link'
import { IconButton } from 'rsuite'

const EditBtn = ({ node }) => {
  return (
    <Link href={{ pathname: '/maintenance', query: { id: node.data.id } }} as={`/maintenance?id=${node.data.id}`} passHref>
      <IconButton
        size='md'
        appearance='subtle'
        style={{ paddingLeft: '12px', border: '1px solid var(--primary)' }}
        icon={
          <svg
            height='20'
            width='20'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            stroke='var(--primary)'
            viewBox='0 0 24 24'
          >
            <path d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
          </svg>
        }
      />
    </Link>
  )
}

export default EditBtn

