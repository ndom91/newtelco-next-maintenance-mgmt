import { ButtonGroup, IconButton, Icon } from "rsuite"

export const sendMailBtns = ({ data, context }) => {
  const {
    maintenanceRecipient,
    kundenCID,
    frozen,
    name,
    protected: prot,
  } = data
  const { prepareDirectSend, togglePreviewModal } = context
  return (
    <ButtonGroup>
      <IconButton
        onClick={() =>
          prepareDirectSend(maintenanceRecipient, kundenCID, frozen, name)
        }
        size="sm"
        appearance="ghost"
        icon={<Icon icon="send" />}
      />
      <IconButton
        onClick={() =>
          togglePreviewModal(maintenanceRecipient, kundenCID, prot)
        }
        size="sm"
        appearance="ghost"
        icon={<Icon icon="search" />}
      />
    </ButtonGroup>
  )
}
