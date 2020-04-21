import React, { Component } from 'react'

export default class EdittedBy extends Component {
  render () {
    let username
    if (this.props.node && this.props.node.data.bearbeitetvon) {
      username = this.props.node.data.bearbeitetvon
    } else if (this.props.username) {
      username = this.props.username
    }
    if (username === 'fwaleska') {
      return (
        <span className='user-pic-wrapper'>
          <img className='user-pic' style={{ border: '2px solid #67B246', borderRadius: '50%' }} src='/static/images/avatars/FWA.png' width='32px' height='32px' />
        </span>
      )
    } else if (username === 'alissitsin') {
      return (
        <span>
          <img className='user-pic' style={{ border: '2px solid #67B246', borderRadius: '50%' }} src='/static/images/avatars/ALI.png' width='32px' height='32px' />
        </span>
      )
    } else if (username === 'ndomino') {
      return (
        <span>
          <img className='user-pic' style={{ border: '2px solid #67B246', borderRadius: '50%' }} src='/static/images/avatars/NDO.png' width='32px' height='32px' />
        </span>
      )
    } else if (username === 'nchachua') {
      return (
        <span>
          <img className='user-pic' style={{ border: '2px solid #67B246', borderRadius: '50%' }} src='/static/images/avatars/NCH.png' width='32px' height='32px' />
        </span>
      )
    } else if (username === 'kmoeller') {
      return (
        <span>
          <img className='user-pic' style={{ border: '2px solid #67B246', borderRadius: '50%' }} src='/static/images/avatars/KMO.png' width='32px' height='32px' />
        </span>
      )
    } else if (username === 'sstergiou') {
      return (
        <span>
          <img className='user-pic' style={{ border: '2px solid #67B246', borderRadius: '50%' }} src='/static/images/avatars/SST.png' width='32px' height='32px' />
        </span>
      )
    } else {
      const r = Math.floor(Math.random() * 6) + 1
      return (
        <span>
          <img className='user-pic' src={`/static/images/avatars/avatar${r}.svg`} width='32px' height='32px' />
        </span>
      )
    }
  }
};
