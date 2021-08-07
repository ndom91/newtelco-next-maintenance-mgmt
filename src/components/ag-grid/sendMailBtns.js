import { ButtonGroup, IconButton, Icon } from "rsuite"

export const sendMailBtns = ({ data }) => {
  const {
    maintenanceRecipient,
    kundenCID,
    frozen,
    name,
    protected: prot,
  } = data
  return (
    <ButtonGroup>
      <IconButton
        onClick={() =>
          props.context.prepareDirectSend(
            maintenanceRecipient,
            kundenCID,
            frozen,
            name
          )
        }
        size="sm"
        appearance="ghost"
        icon={<Icon icon="send" />}
      />
      <IconButton
        onClick={() =>
          props.context.togglePreviewModal(
            maintenanceRecipient,
            kundenCID,
            prot
          )
        }
        size="sm"
        appearance="ghost"
        icon={<Icon icon="search" />}
      />
    </ButtonGroup>
  )
}
