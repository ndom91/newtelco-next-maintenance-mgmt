import React from "react"
import { Modal, FlexboxGrid, ButtonGroup, ButtonToolbar, Button } from "rsuite"

const ConfirmModal = ({
  header,
  content,
  show,
  onHide,
  cancelAction,
  confirmAction,
  height,
  buttonWidth,
  ...props
}) => {
  return (
    <Modal backdrop show={show} size="sm" onHide={onHide} {...props}>
      <Modal.Header
        style={{
          fontWeight: "100",
          fontSize: "1.5rem",
          fontFamily: "var(--font-body)",
        }}
      >
        {header}
      </Modal.Header>
      <Modal.Body
        style={{
          paddingBottom: "0px",
        }}
      >
        <FlexboxGrid
          justify="space-around"
          align="middle"
          style={{ flexDirection: "column", height: height || "150px" }}
        >
          <FlexboxGrid.Item
            style={{ fontFamily: "var(--font-body)", fontSize: "1.1rem" }}
          >
            {content}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item>
            <ButtonGroup block style={{ width: buttonWidth || "30em" }}>
              <Button
                appearance="default"
                onClick={cancelAction}
                style={{ width: "50%" }}
              >
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={confirmAction}
                style={{ width: "50%" }}
              >
                Confirm
              </Button>
            </ButtonGroup>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Modal.Body>
    </Modal>
  )
}

export default ConfirmModal
