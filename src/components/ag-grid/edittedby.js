import React, { Component } from 'react'

export default class EdittedBy extends Component {
  render () {
    let username
    if (this.props.node && this.props.node.data.bearbeitetvon) {
      username = this.props.node.data.bearbeitetvon
    } else if (this.props.username) {
      username = this.props.username
    }
    if (username !== '') {
      return (
        <span className='user-pic-wrapper'>
          <img className='user-pic' style={{ border: '2px solid #67B246', borderRadius: '50%' }} src={`/static/images/avatars/${username}.png`} width='32px' height='32px' />
        </span>
      )
    } else {
      return (
        <span>
          <img className='user-pic' src={`/static/images/avatars/avatar.svg`} width='32px' height='32px' />
        </span>
      )
    }
  }
};
