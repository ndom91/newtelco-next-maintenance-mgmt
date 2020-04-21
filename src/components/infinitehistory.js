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

  fetchData = () => {
    if (this.state.items.length >= this.props.length) {
      this.setState({ hasMore: false })
      return
    }
    const host = window.location.host
    const pageRequest = `https://${host}/api/maintenances/infinite?count=${this.state.count}`
    fetch(pageRequest)
      .then(res => res.json())
      .then(data => {
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
      <div id='scrollablediv'>
        <InfiniteScroll
          dataLength={this.state.items.length}
          next={this.fetchData}
          hasMore={hasMore}
          // scrollThreshold='900px'
          // scrollableTarget='scrolltarget'
          // scrollableTarget='scrollablediv'
          loader={<h4 style={{ textAlign: 'center', color: 'var(--font-color)' }}>Loading...</h4>}
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>No More Maintenances Available</b>
            </p>
          }
        >
          <div className='infinite-scroll-item-wrapper'>
            {items.map(maint => {
              return <MaintCard maint={maint} key={maint.id} />
            })}
          </div>
        </InfiniteScroll>
        <style jsx>{`
          :global(.infinite-scroll-item-wrapper) {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
          }
        `}
        </style>
      </div>
    )
  }
}

export default InfiniteHistory
