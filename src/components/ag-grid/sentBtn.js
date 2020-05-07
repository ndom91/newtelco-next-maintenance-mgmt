import React from 'react'
import {
  Icon,
  ButtonGroup,
  IconButton
} from 'rsuite'

const sentBtn = props => {
  return (
    <ButtonGroup>
      <IconButton 
        onClick={() => props.context.toggleRescheduleSentBtn(props.data.rcounter)} 
        size='sm' 
        appearance='ghost' 
        icon={props.data.sent === 1 ? <Icon icon='check-circle' /> : <Icon icon='times-circle' />} 
      />
      <IconButton 
        onClick={() => props.context.moveCalendarEntry(props.data.startDateTime, props.data.endDateTime, props.data.rcounter)} 
        size='sm' 
        appearance='ghost'
        icon={<Icon icon='calendar' />}
      />
    </ButtonGroup>
  )
}

export default sentBtn
