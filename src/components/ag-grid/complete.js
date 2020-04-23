import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTimes,
  faQuestion,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons'

export default class CompleteIcon extends Component {
  render() {
    if (this.props.node.data.done) {
      if (!!this.props.node.data.done) {
        return (
          <span style={{ display: 'flex', justifyContent: 'center', height: '50px', alignItems: 'center' }}>
            <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faCheckCircle} />
          </span>
        )
      } else {
        return (
          <span style={{ display: 'flex', justifyContent: 'center', height: '50px', alignItems: 'center' }}>
            <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faQuestion} />
          </span>
        )
      }
    } else {
      return (
        <span style={{ display: 'flex', justifyContent: 'center', height: '50px', alignItems: 'center' }}>
          <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faTimes} />
        </span>
      )
    }
  }
};
