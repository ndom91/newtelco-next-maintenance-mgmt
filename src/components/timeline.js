import React from 'react'
import fetch from 'isomorphic-unfetch'
import Timeline from 'react-time-line'

class Changelog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      maintHistory: [],
      fetching: true
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
          maintHistory: currentHistory,
          fetching: false
        })
      })
      .catch(err => console.error(err))
  }

  render () {
    const {
      fetching,
      maintHistory
    } = this.state

    if (maintHistory.length !== 0) {
      return (
        <>
          <Timeline items={maintHistory} />
        </>
      )
    } else {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '150px' }}>
          {fetching
            ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexDirection: 'column' }}>
                <div className='pulsate' />
                <div>Loading</div>
              </div>
            ) : (
              <h4 style={{ fontWeight: '100 !important', marginTop: '20px', color: 'var(--font-color)' }}>No History Available</h4>
            )}
          <style jsx>{`
            .pulsate {
              animation: pulsate 1s ease-out;
              animation-iteration-count: infinite; 
              opacity: 0.0;

              border: 3px solid #999;
              border-radius: 30px;
              height: 18px;
              width: 18px;
              position: relative;
              display: inline-block;
              margin-top: 20px;
              text-align: center;
            }
            @keyframes pulsate {
              0% {-webkit-transform: scale(0.1, 0.1); opacity: 0.0;}
              50% {opacity: 1.0;}
              100% {-webkit-transform: scale(1.2, 1.2); opacity: 0.0;}
            }
          `}
          </style>
        </div>
      )
    }
  }
}

export default Changelog
