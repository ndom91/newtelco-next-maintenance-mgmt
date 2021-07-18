import React from 'react'
import { ButtonGroup, IconButton, Icon } from 'rsuite'

export const sendMailBtns = (props) => {
  return (
    <ButtonGroup>
      <IconButton
        onClick={() =>
          props.context.prepareDirectSend(
            props.data.maintenanceRecipient,
            props.data.kundenCID,
            props.data.frozen,
            props.data.name
          )
        }
        size="sm"
        appearance="ghost"
        icon={<Icon icon="send" />}
      />
      <IconButton
        onClick={() =>
          props.context.togglePreviewModal(
            props.data.maintenanceRecipient,
            props.data.kundenCID,
            props.data.protected
          )
        }
        size="sm"
        appearance="ghost"
        icon={<Icon icon="search" />}
      />
    </ButtonGroup>
  )
}
