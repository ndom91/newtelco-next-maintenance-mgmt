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
          console.log(history, history.user)
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
    return (
      <Timeline items={this.state.maintHistory} />
    )
  }
}

export default Changelog
