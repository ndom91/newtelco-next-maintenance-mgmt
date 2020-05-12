import React, { useState, useEffect } from 'react'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Store from '../../store'
import Comment from './comment'
import CommentInput from './input'
import {
  List,
  FlexboxGrid,
  Loader,
  Divider
} from 'rsuite'

const CommentList = ({ user, id }) => {
  const store = Store.useStore()
  const [comments, setComments] = useState([])

  const maintId = id
  const { data } = useSWR(
    `/api/comments?m=${maintId}`,
    (...args) => fetch(...args).then(res => res.json()),
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    store.set('comments')(data)
  }, [data])

  const reverseArrayInPlace = (arr) => {
    for (var i = 0; i <= (arr.length / 2); i++) {
      let el = arr[i]
      arr[i] = arr[arr.length - 1 - i]
      arr[arr.length - 1 - i] = el
    }
    return arr
  }

  return (
    <FlexboxGrid style={{ flexDirection: 'column' }} alignItems='middle'>
      <FlexboxGrid.Item colspan={22}>
        <Divider />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '100', fontFamily: 'var(--font-body)' }}>Comments</div>
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={22}>
        <CommentInput user={user} />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={22}>
        <List style={{ marginTop: '15px' }} hover bordered>
          {!data ? (
            <div style={{ width: '100%', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Loader />
            </div>
          ) : (
            data.comments.length && reverseArrayInPlace(data.comments).map(comment => {
              return (
                <List.Item key={comment.id}>
                  <Comment data={comment} />
                </List.Item>
              )
            })
          )}
        </List>
      </FlexboxGrid.Item>
    </FlexboxGrid>
  )
}

export default CommentList
