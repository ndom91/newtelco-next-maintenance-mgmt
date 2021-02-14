import React, { useState, useRef } from 'react'
import { Rnd } from 'react-rnd'
import ShadowDom from '../../components/shadowdom'
import { OutTable, ExcelRenderer } from 'react-excel-renderer'
import PDF from 'react-pdf-js-infinite'
import Notify from '@/newtelco-utils/notification'
import { saveAs } from 'file-saver'
import {
  Icon,
  Modal,
  FlexboxGrid,
  InputGroup,
  Input,
  IconButton,
  Avatar,
  Whisper,
  Popover,
  Dropdown,
  Loader,
  Tag,
  Tooltip,
} from 'rsuite'

const ReadModal = ({
  maintenance,
  toggleReadModal,
  incomingAttachments,
  jsonData,
}) => {
  const [hoverFrom, setHoverFrom] = useState(false)
  const [hoverSubj, setHoverSubj] = useState(false)
  const triggerRef = useRef()
  const [attachmentHTMLContent, setAttachmentHTMLContent] = useState('')
  const [pdfB64, setPdfB64] = useState('')
  const [openAttachmentModal, setOpenAttachmentModal] = useState(false)
  const [rows, setRows] = useState('')
  const [cols, setCols] = useState('')
  const [filetype, setFiletype] = useState('')
  const [currentAttachmentName, setCurrentAttachmentName] = useState('')
  const [attachmentPopoverBody, setAttachmentPopoverBody] = useState('')
  const [faviconLoading, setFaviconLoading] = useState(true)
  const copySubjectToClipboard = () => {
    navigator.clipboard.writeText(
      maintenance.incomingSubject || maintenance.subject
    )
    Notify('info', 'Subject Copied To Clipboard!')
  }
  const copyFromToClipboard = () => {
    navigator.clipboard.writeText(maintenance.incomingFrom || maintenance.from)
    Notify('info', 'Sender Copied To Clipboard!')
  }

  const fileTypeIcon = filename => {
    const fileExt = filename.match(/\.[0-9a-z]+$/i)
    switch (fileExt[0]) {
      case '.xlsx':
        return 'file-excel-o'
      case '.xls':
        return 'file-excel-o'
      case '.pdf':
        return 'file-pdf-o'
      case '.html':
        return 'html5'
      default:
        return 'file-o'
    }
  }

  const showAttachments = (id, filename) => {
    function fixBase64(binaryData) {
      var base64str = binaryData
      var binary = atob(base64str.replace(/\s/g, ''))
      var len = binary.length
      var buffer = new ArrayBuffer(len)
      var view = new Uint8Array(buffer)

      for (var i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i)
      }
      return view
    }
    function downloadFile(base64, filename, mimeType) {
      const base64Fixed = fixBase64(base64)
      const fileData = new Blob([base64Fixed], { type: mimeType })
      saveAs(fileData, filename)
    }
    if (id !== null) {
      let filetype = ''
      const fileExt = filename.match(/\.[0-9a-z]+$/i)
      switch (fileExt[0]) {
        case '.xlsx':
          filetype = 'excel'
          break
        case '.xls':
          filetype = 'excel'
          break
        case '.pdf':
          filetype = 'pdf'
          break
        case '.html':
          filetype = 'html'
          break
      }
      if (filetype === 'excel') {
        const excelIndex = incomingAttachments.findIndex(el => el.id === id)
        const file = incomingAttachments[excelIndex]
        const filedata = file.data
        const mime = file.mime
        const filename = file.name
        let base64 = filedata.replace(/_/g, '/')
        base64 = base64.replace(/-/g, '+')
        const base64Fixed = fixBase64(base64)
        var fileData = new Blob([base64Fixed], {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;',
        })

        ExcelRenderer(fileData, (err, resp) => {
          if (err) {
            console.error(err)
          } else {
            resp.cols.forEach(col => {
              col.name = resp.rows[0][col.key]
              col.key = col.key + 1
            })
            resp.cols.unshift({ key: 0, name: '' })
            resp.rows.shift()
            setFiletype(filetype)
            setCols(resp.cols)
            setRows(resp.rows)
            setCurrentAttachmentName(filename)
            setAttachmentPopoverBody(
              <Dropdown.Menu onSelect={() => triggerRef.current.hide()}>
                <Dropdown.Item
                  onClick={() => setOpenAttachmentModal(!openAttachmentModal)}
                  eventKey={1}
                >
                  Preview
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => downloadFile(base64, filename, mime)}
                  eventKey={2}
                >
                  Download
                </Dropdown.Item>
              </Dropdown.Menu>
            )
          }
        })
      } else if (filetype === 'pdf') {
        const pdfIndex = incomingAttachments.findIndex(el => el.id === id)
        const file = incomingAttachments[pdfIndex]
        const filedata = file.data
        const mime = file.mime
        const filename = file.name
        let base64 = filedata.replace(/_/g, '/')
        base64 = base64.replace(/-/g, '+')
        const base64Fixed = fixBase64(base64)
        const fileData = new Blob([base64Fixed], { type: 'application/pdf' })
        setFiletype(filetype)
        setPdfB64(fileData)
        setCurrentAttachmentName(filename)
        setAttachmentPopoverBody(
          <Dropdown.Menu onSelect={() => triggerRef.current.hide()}>
            <Dropdown.Item
              onClick={() => setOpenAttachmentModal(!openAttachmentModal)}
              eventKey={1}
            >
              Preview
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => downloadFile(base64, filename, mime)}
              eventKey={2}
            >
              Download
            </Dropdown.Item>
          </Dropdown.Menu>
        )
      } else if (filetype === 'html') {
        const fileIndex = incomingAttachments.findIndex(el => el.id === id)
        const file = incomingAttachments[fileIndex]
        const filedata = file.data
        const filename = file.name
        const mime = file.mime
        let base64 = filedata.replace(/_/g, '/')
        base64 = base64.replace(/-/g, '+')
        setFiletype(filetype)
        setAttachmentHTMLContent(window.atob(base64))
        setCurrentAttachmentName(filename)
        setAttachmentPopoverBody(
          <Dropdown.Menu onSelect={() => triggerRef.current.hide()}>
            <Dropdown.Item
              onClick={() => setOpenAttachmentModal(!openAttachmentModal)}
              eventKey={1}
            >
              Preview
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => downloadFile(base64, filename, mime)}
              eventKey={2}
            >
              Download
            </Dropdown.Item>
          </Dropdown.Menu>
        )
      } else {
        const fileIndex = incomingAttachments.findIndex(el => el.id === id)
        const file = incomingAttachments[fileIndex]
        const mime = file.mime
        const rawData = file.data
        let base64 = rawData.replace(/_/g, '/')
        base64 = base64.replace(/-/g, '+')
        setAttachmentPopoverBody(
          <Dropdown.Menu onSelect={() => triggerRef.current.hide()}>
            <Dropdown.Item disabled eventKey={1}>
              Preview
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => downloadFile(base64, filename, mime)}
              eventKey={2}
            >
              Download
            </Dropdown.Item>
          </Dropdown.Menu>
        )
      }
    } else {
      setOpenAttachmentModal(!openAttachmentModal)
    }
  }

  return (
    <>
      <Rnd
        default={{
          x: window.outerWidth / 2 - 100,
          y: 100,
          width: window.outerWidth / 2,
          height: 600,
        }}
        style={{
          background: 'var(--white)',
          overflow: 'hidden',
          borderRadius: '5px',
          zIndex: '101',
          boxShadow: '0px 0px 15px -3px var(--grey3)',
        }}
        bounds='window'
        dragHandleClassName='mail-read-header'
      >
        <div
          style={{
            borderRadius: '15px',
            position: 'relative',
            height: 'calc(100% - 112px)',
          }}
        >
          <Modal.Header className='mail-read-header' onHide={toggleReadModal}>
            <FlexboxGrid
              justify='start'
              align='middle'
              style={{ width: '100%' }}
            >
              <FlexboxGrid.Item
                colspan={3}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                {faviconLoading && (
                  <div
                    style={{
                      width: '100%',
                      height: '60px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Loader />
                  </div>
                )}
                <Avatar
                  size='lg'
                  src={`/v1/api/faviconUrl?d=${jsonData.profile.mailDomain}`}
                  style={
                    faviconLoading
                      ? { visibility: 'hidden', backgroundColor: 'transparent' }
                      : { backgroundColor: 'transparent' }
                  }
                  onLoad={() => setFaviconLoading(false)}
                />
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={19}>
                <div className='modal-preview-text-wrapper'>
                  <InputGroup
                    className='modal-textbox'
                    style={{ marginBottom: '5px' }}
                    onMouseEnter={() => setHoverFrom(true)}
                    onMouseLeave={() => setHoverFrom(false)}
                  >
                    <InputGroup.Addon style={{ height: '31px' }} type='prepend'>
                      From
                    </InputGroup.Addon>
                    <Input
                      readOnly
                      value={maintenance.incomingFrom || maintenance.from}
                    />
                    <InputGroup.Button
                      style={{ width: '50px', backgroundColor: 'transparent' }}
                    >
                      <Whisper
                        placement='bottom'
                        delay={5000}
                        speaker={<Tooltip>Copy Sender</Tooltip>}
                      >
                        <Tag
                          style={{
                            visibility: hoverFrom ? 'visible' : 'hidden',
                            opacity: hoverFrom ? '1' : '0',
                            zIndex: hoverFrom ? '999' : '0',
                            marginRight: '5px',
                          }}
                          onClick={copyFromToClipboard}
                          className='copy-btn'
                        >
                          <svg
                            height='16'
                            width='16'
                            fill='none'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3' />
                          </svg>
                        </Tag>
                      </Whisper>
                    </InputGroup.Button>
                  </InputGroup>
                  <InputGroup
                    className='modal-textbox'
                    onMouseEnter={() => setHoverSubj(true)}
                    onMouseLeave={() => setHoverSubj(false)}
                  >
                    <InputGroup.Addon style={{ height: '31px' }} type='prepend'>
                      Subject
                    </InputGroup.Addon>
                    <Input
                      type='text'
                      readOnly
                      value={maintenance.incomingSubject || maintenance.subject}
                    />
                    <InputGroup.Button
                      style={{ width: '50px', backgroundColor: 'transparent' }}
                    >
                      <Whisper
                        placement='bottom'
                        delay={5000}
                        speaker={<Tooltip>Copy Subject</Tooltip>}
                      >
                        <Tag
                          style={{
                            visibility: hoverSubj ? 'visible' : 'hidden',
                            opacity: hoverSubj ? '1' : '0',
                            zIndex: hoverSubj ? '999' : '0',
                            marginRight: '5px',
                          }}
                          onClick={copySubjectToClipboard}
                          className='copy-btn'
                        >
                          <svg
                            height='16'
                            width='16'
                            fill='none'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3' />
                          </svg>
                        </Tag>
                      </Whisper>
                    </InputGroup.Button>
                  </InputGroup>
                </div>
              </FlexboxGrid.Item>
            </FlexboxGrid>
            <div
              style={{
                flexGrow: Array.isArray(maintenance.incomingAttachments)
                  ? '1'
                  : '0',
                width: '100%',
                marginTop: '5px',
              }}
            >
              {Array.isArray(maintenance.incomingAttachments) &&
                maintenance.incomingAttachments.length !== 0 &&
                maintenance.incomingAttachments.map((attachment, index) => {
                  return (
                    <Whisper
                      key={attachment.id}
                      placement='bottomStart'
                      trigger='click'
                      triggerRef={triggerRef}
                      speaker={
                        <Popover
                          full
                          onSelect={() => triggerRef.current.hide()}
                        >
                          {attachmentPopoverBody}
                        </Popover>
                      }
                    >
                      <IconButton
                        size='sm'
                        icon={<Icon icon={fileTypeIcon(attachment.name)} />}
                        onClick={() =>
                          showAttachments(attachment.id, attachment.name)
                        }
                        style={{ marginLeft: '10px' }}
                      >
                        {attachment.name}
                      </IconButton>
                    </Whisper>
                  )
                })}
            </div>
          </Modal.Header>
          <Modal.Body
            className='read-mail-body'
            style={{
              height: `calc(100% - ${
                Array.isArray(maintenance.incomingAttachments) &&
                maintenance.incomingAttachments.length !== 0
                  ? '50px'
                  : '20px'
              })`,
            }}
          >
            <ShadowDom>
              <div
                dangerouslySetInnerHTML={{ __html: maintenance.incomingBody }}
              />
            </ShadowDom>
          </Modal.Body>
        </div>
      </Rnd>
      {openAttachmentModal && (
        <Rnd
          default={{
            x: window.outerWidth / 2,
            y: 225,
            width: window.outerWidth / 3,
            height: 'auto',
          }}
          style={{
            backgroundColor: 'var(--background)',
            overflow: 'hidden',
            borderRadius: '5px',
            zIndex: '101',
            boxShadow: '0px 0px 10px 1px var(--grey3)',
          }}
          bounds='window'
          dragHandleClassName='modal-attachment-header-text'
        >
          <div style={{ borderRadius: '15px', position: 'relative' }}>
            <Modal.Header
              className='modal-attachment-header-text'
              onHide={() => setOpenAttachmentModal(!openAttachmentModal)}
              style={{
                borderRadius: '0px',
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: 'var(--grey1)',
              }}
            >
              <FlexboxGrid
                justify='start'
                align='middle'
                style={{ width: '100%', height: '60px', padding: '15px 20px' }}
              >
                <FlexboxGrid.Item
                  colspan={2}
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  <Icon size='lg' icon={fileTypeIcon(currentAttachmentName)} />
                </FlexboxGrid.Item>
                <FlexboxGrid.Item
                  colspan={8}
                  style={{
                    display: 'flex',
                    justifyContent: 'start',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1.2rem',
                    marginLeft: '5px',
                  }}
                >
                  {currentAttachmentName}
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </Modal.Header>
            <Modal.Body
              style={
                filetype === 'pdf'
                  ? { overflow: 'scroll', height: '450px' }
                  : { padding: '20px', marginTop: '0px' }
              }
            >
              {filetype === 'excel' ? (
                <div className='attachment-body pdf'>
                  <OutTable
                    data={rows}
                    columns={cols}
                    tableClassName='ExcelTable2007'
                    tableHeaderRowClass='heading'
                  />
                </div>
              ) : null}
              {filetype === 'pdf' ? (
                <div className='attachment-body excel'>
                  <PDF file={pdfB64} scale={1.75} />
                </div>
              ) : null}
              {filetype === 'html' ? (
                <ShadowDom>
                  <div className='attachment-body html'>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: attachmentHTMLContent,
                      }}
                    />
                  </div>
                </ShadowDom>
              ) : null}
            </Modal.Body>
          </div>
        </Rnd>
      )}
    </>
  )
}

export default ReadModal
