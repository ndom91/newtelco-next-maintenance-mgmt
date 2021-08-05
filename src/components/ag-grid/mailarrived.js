import React from "react"
import { format, isValid } from "date-fns"

export const MailArrived = ({ node }) => {
  let dateTime
  if (isValid(new Date(node.data.maileingang))) {
    dateTime = format(new Date(node.data.maileingang), "dd.MM.yyyy HH:mm")
  } else {
    dateTime = node.data.maileingang
  }
  return <span>{dateTime}</span>
}
