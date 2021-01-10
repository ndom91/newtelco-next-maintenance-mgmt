import React from 'react'
import { IconButton, Dropdown } from 'rsuite'
import { Icon } from '@rsuite/icons'

const sentBtn = props => {
  return (
    <Dropdown
      renderTitle={() => {
        return (
          <IconButton appearance='subtle' icon={<Icon as='ellipsis-v' />} />
        )
      }}
      placement='leftStart'
    >
      <Dropdown.Item
        onClick={() =>
          props.context.toggleRescheduleSentBtn(props.data.rcounter)
        }
      >
        Toggle Sent
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() =>
          props.context.moveCalendarEntry(
            props.data.startDateTime,
            props.data.endDateTime,
            props.data.rcounter
          )
        }
      >
        Move Calendar
      </Dropdown.Item>
      <Dropdown.Item onClick={props.context.toggleRescheduleDelete}>
        Delete
      </Dropdown.Item>
    </Dropdown>
  )
}

export default sentBtn
