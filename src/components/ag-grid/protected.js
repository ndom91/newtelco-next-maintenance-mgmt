import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLock,
  faQuestion,
  faLockOpen
} from '@fortawesome/free-solid-svg-icons'

export default class ProtectedIcon extends Component {
  render () {
    if (this.props.node && this.props.node.data) {
      if (this.props.node.data.protected === '1' || this.props.node.data.protected === 'true') {
        return (
          <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.3em' icon={faLock} />
        )
      } else if (this.props.node.data.protected === '0' || this.props.node.data.protected === 'false') {
        return (
          <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faLockOpen} />
        )
      } else {
        return (
          <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faQuestion} />
        )
      }
    }
  }
};
