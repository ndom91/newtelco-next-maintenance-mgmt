import React, { Component } from 'react'
import { format, isValid } from 'date-fns'

export default class MailArrived extends Component {
  render () {
    let dateTime
    if (isValid(new Date(this.props.node.data.endDateTime))) {
      dateTime = format(new Date(this.props.node.data.maileingang), 'dd.MM.yyyy HH:mm')
    } else {
      dateTime = this.props.node.data.maileingang
    }
    return (
      <span>
        {dateTime}
      </span>
    )
  }
};
