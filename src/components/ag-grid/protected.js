import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLock,
  faQuestion
} from '@fortawesome/free-solid-svg-icons'
import {
  faCircle
} from '@fortawesome/free-regular-svg-icons'

export default class ProtectedIcon extends Component {
  render () {
    if (this.props.node.data.protected === '1') {
      return (
        <FontAwesomeIcon style={{ fontSize: '18px' }} width='1.5em' icon={faLock} />
      )
    } else if (this.props.node.data.protected === '0') {
      return (
        <FontAwesomeIcon style={{ fontSize: '18px' }} width='1.5em' icon={faCircle} />
      )
    } else {
      return (
        <FontAwesomeIcon style={{ fontSize: '18px' }} width='1.5em' icon={faQuestion} />
      )
    }
  }
};
