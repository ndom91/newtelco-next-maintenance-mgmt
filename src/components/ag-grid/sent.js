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
    const {
      sent
    } = this.props.node.data

    if (sent === '1' || sent === 'true') {
      return (
        <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faCheck} />
      )
    } else if (sent === '0' || sent === 'false') {
      return (
        <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faCircle} />
      )
    } else {
      return (
        <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faQuestion} />
      )
    }
  }
};
