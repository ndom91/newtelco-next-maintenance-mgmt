import { format, isValid } from "date-fns"

export const UpdatedAt = ({ node }) => {
  let dateTime
  if (isValid(new Date(node.data.updatedAt))) {
    dateTime = format(new Date(node.data.updatedAt), "dd.MM.yyyy HH:mm")
  } else {
    dateTime = node.data.updatedAt
  }
  return <span>{dateTime}</span>
}
