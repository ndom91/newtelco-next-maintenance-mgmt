import React from 'react'
import { ButtonGroup, IconButton } from 'rsuite'
import { Icon } from '@rsuite/icons'

const sendMailBtns = props => {
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
        size='sm'
        appearance='ghost'
        icon={<Icon as='send' />}
      />
      <IconButton
        onClick={() =>
          props.context.togglePreviewModal(
            props.data.maintenanceRecipient,
            props.data.kundenCID,
            props.data.protected
          )
        }
        size='sm'
        appearance='ghost'
        icon={<Icon as='search' />}
      />
    </ButtonGroup>
  )
}

export default sendMailBtns
