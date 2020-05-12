import React, { useState } from 'react'
import Notify from '../../../lib/notification'
import Store from '../../store'
import fetch from 'isomorphic-unfetch'
import {
  Input,
  Icon,
  IconButton,
  FlexboxGrid
} from 'rsuite'

const CommentInput = ({ user }) => {
  const store = Store.useStore()
  const [comment, setComment] = useState('')

  const submitComment = () => {
    if (!comment) return Notify('error', 'No Comment')

    fetch('/api/comments/post', {
      method: 'post',
      body: JSON.stringify({
        body: comment,
        user: user,
        maintId: store.get('maintenance').id
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(r => r.json())
      .then(resp => {
        console.log('resp', resp)
      })
  }
  return (
    <FlexboxGrid justify='center' align='middle'>
      <FlexboxGrid.Item colspan={22}>
        <Input value={comment} onChange={e => setComment(e)} />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={2}>
        <IconButton icon={<Icon icon='send' />} onClick={submitComment} />
      </FlexboxGrid.Item>
    </FlexboxGrid>
  )
}

export default CommentInput
