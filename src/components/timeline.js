import React, { useState, useEffect } from 'react'
import fetch from 'isomorphic-unfetch'
import format from 'date-fns/format'
// import Timeline from 'react-time-line'
import {
  Loader,
  Timeline,
  Icon,
  Avatar
} from 'rsuite'

const Changelog = ({ maintId }) => {
  const [fetching, setFetching] = useState(false)
  const [maintHistory, setMaintHistory] = useState([])

  useEffect(() => {
    setFetching(true)
    fetch(`/api/maintenances/history?mid=${maintId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        setMaintHistory(data.historyQuery)
        // const currentHistory = maintHistory
        // data.historyQuery.forEach(history => {
        //   const user = history.user
        //   const action = history.action
        //   const field = history.field || ''
        //   const datetime = history.datetime
        //   currentHistory.push({ ts: datetime, text: `${user} - ${action} ${field}` })
        // })
        // setMaintHistory(currentHistory)
        setFetching(false)
      })
      .catch(err => console.error(err))
  }, [])

  if (maintHistory.length !== 0) {
    return (
      <Timeline align='left'>
        {maintHistory.map(item => {
          let dot
          if (/.cid/.test(item.field)) {
            dot = 'globe'
          } else if (!item.field && item.action === 'created') {
            dot = 'plus'
          } else if (item.field === 'timezone') {
            dot = 'clock-o'
          } else if (/.date\/time/.test(item.field)) {
            dot = 'calendar'
          } else if (item.field === 'cancelled') {
            dot = 'ban'
          } else if (item.field === 'emergency') {
            dot = 'hospital-o'
          } else if (item.field === 'location') {
            dot = 'map-marker'
          } else if (item.field && item.action === 'sent to') {
            dot = 'at'
          } else if (item.field === 'maintNote') {
            dot = 'comment'
          } else if (item.field === 'done') {
            dot = 'check'
          } else {
            dot = 'question'
          }
          return (
            <Timeline.Item 
              time={format(new Date(item.datetime), 'LLL dd, HH:mm')} 
              dot={<Avatar size='sm' circle><Icon icon={dot} /></Avatar>}
            >
              <p>{item.user} {item.action || ''} {item.field || ''}</p>
            </Timeline.Item>
          )
        })}
      </Timeline>
    )
  } else {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '150px' }}>
      {fetching
        ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', width: '100%' }}>
            <Loader />
          </div>
        ) : (
          <h4 style={{ fontWeight: '100 !important', marginTop: '20px', color: 'var(--font-color)' }}>No History Available</h4>
        )}
      </div>
    )
  }
}

export default Changelog
