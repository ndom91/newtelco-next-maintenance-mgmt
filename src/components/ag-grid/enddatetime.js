import { isValid } from "date-fns"
import moment from "moment-timezone"

export const EndDateTime = ({ node }) => {
  let dateTime
  if (isValid(new Date(node.data.endDateTime))) {
    const intDateTime = moment.tz(node.data.endDateTime, "GMT")
    const intDateTime2 = intDateTime.tz("Etc/GMT-2")
    dateTime = intDateTime2.format("DD.MM.YYYY HH:mm")
  } else {
    dateTime = node.data.endDateTime
  }
  return <span>{dateTime}</span>
}
