import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faQuestion
} from '@fortawesome/free-solid-svg-icons'
import {
  faCircle
} from '@fortawesome/free-regular-svg-icons'

export default class SentIcon extends Component {
  render () {
    if (this.props.node.data.sent === 1) {
      return (
        <FontAwesomeIcon width='1.5em' icon={faCheck} />
      )
    } else if (this.props.node.data.sent === 0) {
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
