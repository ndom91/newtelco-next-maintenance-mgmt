import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faCircle,
  faQuestion
} from '@fortawesome/free-solid-svg-icons'

export default class ProtectedIcon extends Component {
  render () {
    if (this.props.node.data.protected === '1') {
      return (
        <FontAwesomeIcon width='1.5em' icon={faCheckCircle} />
      )
    } else if (this.props.node.data.protected === '0') {
      return (
        <FontAwesomeIcon width='1.5em' icon={faCircle} />
      )
    } else {
      return (
        <FontAwesomeIcon width='1.5em' icon={faQuestion} />
      )
    }
  }
};
