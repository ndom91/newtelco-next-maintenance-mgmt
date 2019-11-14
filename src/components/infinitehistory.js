import React from 'react'
import fetch from 'isomorphic-unfetch'
import MaintCard from './historycard'
import InfiniteScroll from 'react-infinite-scroll-component'

class InfiniteHistory extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hasMore: true,
      items: [],
      count: 15
    }
  }

  componentDidMount () {
    this.fetchData()
  }

  fetchData = (data) => {
    if (this.state.items.length >= this.props.length) {
      this.setState({ hasMore: false })
      return
    }
    const host = window.location.host
    const pageRequest = `https://${host}/api/maintenances/infinite?count=${this.state.count}`
    fetch(pageRequest)
      .then(res => res.json())
      .then(data => {
        console.log(data)
        this.setState({
          items: data.maintenances,
          count: this.state.count + 15
        })
      })
      .catch(err => console.error(err))
  }

  render () {
    const {
      hasMore,
      items
    } = this.state

    return (
      <InfiniteScroll
        dataLength={this.state.items.length}
        next={this.fetchData}
        hasMore={hasMore}
        scrollThreshold='90%'
        scrollableTarget='scrolltarget'
        loader={<h4 style={{ color: 'var(--font-color)' }}>Loading...</h4>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>No More Maintenances Available</b>
          </p>
        }
      >
        {items.map(maint => {
          return <MaintCard maint={maint} key={maint.id} />
        })}
      </InfiniteScroll>
    )
  }
}

export default InfiniteHistory
