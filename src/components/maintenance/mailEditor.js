import React, { useState, useEffect } from 'react'
import { Editor as TinyEditor } from '@tinymce/tinymce-react'
import {
  Modal,
  Loader,
  Avatar,
  FlexboxGrid,
  Input,
  InputGroup,
  Whisper,
  IconButton,
  Icon,
  Tooltip,
  Placeholder,
  Panel,
} from 'rsuite'

const MailEditor = ({
  open,
  onHide,
  recipients,
  subject,
  body,
  customerCid,
  sendMail,
  onEditorChange,
}) => {
  const [faviconLoading, setFaviconLoading] = useState(true)
  const [editorLoading, setEditorLoading] = useState(true)

  return (
    <Modal
      className="modal-preview-send"
      backdrop
      size="lg"
      show={open}
      onHide={onHide}
    >
      <Modal.Header>
        <FlexboxGrid justify="start" align="middle" style={{ width: '100%' }}>
          <FlexboxGrid.Item
            colspan={3}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            {faviconLoading && <Loader />}
            <Avatar
              size="lg"
              src="/v1/api/faviconUrl?d=newtelco.de"
              style={{
                backgroundColor: 'transparent',
                display: faviconLoading ? 'none' : 'block',
              }}
              onLoad={() => setFaviconLoading(false)}
            />
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={19}>
            <div className="modal-preview-text-wrapper">
              <InputGroup
                className="modal-textbox"
                style={{ marginBottom: '2px' }}
              >
                <InputGroup.Addon style={{ height: '31px' }} type="prepend">
                  To
                </InputGroup.Addon>
                <Input readOnly value={recipients} />
              </InputGroup>
              <InputGroup
                className="modal-textbox"
                style={{ marginBottom: '2px' }}
              >
                <InputGroup.Addon style={{ height: '31px' }} type="prepend">
                  CC
                </InputGroup.Addon>
                <Input type="text" readOnly value="service@newtelco.de" />
              </InputGroup>
              <InputGroup className="modal-textbox">
                <InputGroup.Addon style={{ height: '31px' }} type="prepend">
                  Subject
                </InputGroup.Addon>
                <Input type="text" readOnly value={subject} />
              </InputGroup>
            </div>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={1} style={{ marginLeft: '30px' }}>
            <Whisper speaker={<Tooltip>Send Mail</Tooltip>} placement="bottom">
              <IconButton
                onClick={() =>
                  sendMail(recipients, customerCid, subject, body, true)
                }
                appearance="default"
                style={{ color: 'var(--grey3)' }}
                size="lg"
                icon={<Icon icon="send" />}
              />
            </Whisper>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: 'unset', paddingBottom: '0px' }}>
        {editorLoading && (
          <div style={{ width: '100%', height: '100%' }}>
            <Panel bordered>
              <Placeholder.Paragraph active rows={13} />
            </Panel>
          </div>
        )}
        <TinyEditor
          style={{ display: editorLoading ? 'none' : 'block' }}
          initialValue={body}
          apiKey={process.env.NEXT_PUBLIC_TINY_APIKEY}
          onInit={() => setEditorLoading(false)}
          init={{
            height: 500,
            menubar: true,
            statusbar: false,
            plugins: [
              'advlist autolink lists link image print preview anchor',
              'searchreplace code',
              'insertdatetime table paste code help wordcount',
            ],
            menu: {
              file: { title: 'File', items: 'preview | print ' },
              edit: {
                title: 'Edit',
                items: 'undo redo | cut copy paste | selectall | searchreplace',
              },
              view: {
                title: 'View',
                items:
                  'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen',
              },
              insert: {
                title: 'Insert',
                items:
                  'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime',
              },
              format: {
                title: 'Format',
                items:
                  'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align | forecolor backcolor | removeformat',
              },
              tools: {
                title: 'Tools',
                items: 'spellchecker spellcheckerlanguage | code wordcount',
              },
              table: {
                title: 'Table',
                items: 'inserttable | cell row column | tableprops deletetable',
              },
              help: { title: 'Help', items: 'help' },
            },
            toolbar: `undo redo | formatselect | bold italic backcolor | 
                    alignleft aligncenter alignright alignjustify | 
                    bullist numlist outdent indent | removeformat`,
            content_style:
              'html { color: #828282 } body::-webkit-scrollbar-track { border-radius: 10px; background-color: rgba(0,0,0,0); } body::-webkit-scrollbar { width: 8px; height: 8px; background-color: transparent; } body::-webkit-scrollbar-thumb { border-radius: 10px; background-color: rgba(0,0,0,0.4); } ',
          }}
          onChange={onEditorChange}
        />
      </Modal.Body>
    </Modal>
  )
}

export default MailEditor
