import { Notification } from "rsuite"

const Notify = (funcName, title, description = "") => {
  Notification[funcName]({
    title: title,
    description: description,
  })
}

export default Notify
