
import React, { Component } from 'react'
import { isValid } from 'date-fns'
import moment from 'moment-timezone'

export default class EndDateTime extends Component {
  render () {
    let dateTime
    if (isValid(new Date(this.props.node.data.endDateTime))) {
      const intDateTime = moment.tz(this.props.node.data.endDateTime, 'GMT')
      const intDateTime2 = intDateTime.tz('Etc/GMT-2')
      dateTime = intDateTime2.format('DD.MM.YYYY HH:mm')
    } else {
      dateTime = this.props.node.data.endDateTime
    }
    return (
      <span>
        {dateTime}
      </span>
    )
  }
};
