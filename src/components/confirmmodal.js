import React from 'react'
import {
  Modal,
  FlexboxGrid,
  ButtonGroup,
  ButtonToolbar,
  Button
} from 'rsuite'

const ConfirmModal = ({ header, content, show, onHide, cancelAction, confirmAction }) => {
  return (
    <Modal backdrop show={show} size='sm' onHide={onHide}>
      <Modal.Header>
        {header}
      </Modal.Header>
      <Modal.Body>
        <FlexboxGrid justify='space-around' align='middle' style={{ flexDirection: 'column', height: '150px' }}>
          <FlexboxGrid.Item style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem' }}>
            {content}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item>
            <ButtonGroup block style={{ width: '30em' }}>
              <Button appearance='default' onClick={cancelAction} style={{ width: '50%' }}>
                Cancel
              </Button>
              <Button appearance='primary' onClick={confirmAction} style={{ width: '50%' }}>
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
