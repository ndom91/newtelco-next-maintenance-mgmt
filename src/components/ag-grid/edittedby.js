import React, { Component } from 'react'

export default class EdittedBy extends Component {
  render () {
    if (this.props.node.data.bearbeitetvon === 'fwaleska') {
      return (
        <span className='user-pic-wrapper'>
          <img className='user-pic' style={{ border: '2px solid #007bff', borderRadius: '50%' }} src='/static/images/avatars/FWA.png' width='32px' height='32px' />
        </span>
      )
    } else if (this.props.node.data.bearbeitetvon === 'alissitsin') {
      return (
        <span>
          <img className='user-pic' style={{ border: '2px solid #007bff', borderRadius: '50%' }} src='/static/images/avatars/ALI.png' width='32px' height='32px' />
        </span>
      )
    } else if (this.props.node.data.bearbeitetvon === 'ndomino') {
      return (
        <span>
          <img className='user-pic' style={{ border: '2px solid #007bff', borderRadius: '50%' }} src='/static/images/avatars/NDO.png' width='32px' height='32px' />
        </span>
      )
    } else if (this.props.node.data.bearbeitetvon === 'sstergiou') {
      return (
        <span>
          <img className='user-pic' style={{ border: '2px solid #007bff', borderRadius: '50%' }} src='/static/images/avatars/SST.png' width='32px' height='32px' />
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
