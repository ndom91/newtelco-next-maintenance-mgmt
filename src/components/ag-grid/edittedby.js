import React, { useState } from 'react'
import { Loader } from 'rsuite'

const EdittedBy = ({ node }) => {
  const [loading, setLoading] = useState(true)
  const loadingStyle = loading ? { display: 'none' } : {}
  let avatarFile = 'avatar.svg'
  if (node && node.data.bearbeitetvon) {
    avatarFile = `${node.data.bearbeitetvon}.png`
  }
  return (
    <>
      {loading && <Loader />}
      <span className='user-pic-wrapper' style={loadingStyle}>
        <img
          className='user-pic'
          style={{ border: '2px solid #67B246', borderRadius: '50%' }}
          src={`/static/images/avatars/${avatarFile}`}
          width='32px'
          height='32px'
          onLoad={() => setLoading(false)}
        />
      </span>
    </>
  )
}

export default EdittedBy
