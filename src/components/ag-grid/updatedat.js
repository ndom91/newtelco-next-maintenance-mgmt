import React, { Component } from 'react'
import { format, isValid } from 'date-fns'

export default class UpdatedAt extends Component {
  render () {
    let dateTime
    if (isValid(new Date(this.props.node.data.endDateTime))) {
      dateTime = format(new Date(this.props.node.data.updatedAt), 'dd.MM.yyyy HH:mm')
    } else {
      dateTime = this.props.node.data.updatedAt
    }
    return (
      <span>
        {dateTime}
      </span>
    )
  }
};
