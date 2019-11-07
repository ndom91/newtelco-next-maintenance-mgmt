import React from 'react'
import fetch from 'isomorphic-unfetch'
import Timeline from 'react-time-line'

class Changelog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      maintHistory: []
    }
  }

  componentDidMount () {
    const host = window.location.host
    const maintId = this.props.maintid
    fetch(`https://${host}/api/maintenances/history?mid=${maintId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const currentHistory = this.state.maintHistory
        data.historyQuery.forEach(history => {
          const user = history.user
          const action = history.action
          const field = history.field || ''
          const datetime = history.datetime
          currentHistory.push({ ts: datetime, text: `${user} - ${action} ${field}` })
        })
        this.setState({
          maintHistory: currentHistory
        })
      })
      .catch(err => console.error(err))
    // fetch changelog for maintId
  }

  render () {
    if (this.state.maintHistory.length !== 0) {
      return (
        <Timeline items={this.state.maintHistory} />
      )
    } else {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '150px' }}>
          <h4 style={{ fontWeight: '100 !important', marginTop: '20px', color: 'var(--font-color)' }}>No History Available</h4>
        </div>
      )
    }
  }
}

export default Changelog
