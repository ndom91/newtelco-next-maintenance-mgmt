import React, { useEffect } from 'react'
import Link from 'next/link'
import { Panel, Icon } from 'rsuite'
import './unread.css'

const UnreadBadge = ({ count }) => (
  <Panel
    header={
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        Unread
        <Icon icon="envelope-o" style={{ color: 'var(--primary)' }} size="lg" />
      </div>
    }
    bordered
    className="unread-panel"
  >
    <Link href="/inbox" passHref>
      <a className="unread-count">{count}</a>
    </Link>
  </Panel>
)

export default UnreadBadge
