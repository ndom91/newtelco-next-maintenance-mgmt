import { isValid } from "date-fns"
import moment from "moment-timezone"

export const StartDateTime = ({ node }) => {
  let dateTime
  if (isValid(new Date(node.data.startDateTime))) {
    const intDateTime = moment.tz(node.data.startDateTime, "GMT")
    const intDateTime2 = intDateTime.tz("Etc/GMT-2")
    dateTime = intDateTime2.format("DD.MM.YYYY HH:mm")
  } else {
    dateTime = node.data.startDateTime
  }
  return <span>{dateTime}</span>
}
