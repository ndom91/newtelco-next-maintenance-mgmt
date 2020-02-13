import React from 'react'
import { Rnd } from 'react-rnd'
import root from 'react-shadow'
import { ExcelRenderer } from 'react-excel-renderer'
import { saveAs } from 'file-saver'
import {
  ButtonGroup,
  Button,
  ModalHeader,
  ModalBody
} from 'shards-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons'

export default class Attachment extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      attachmentHTMLContent: '',
      pdfB64: '',
      openAttachmentModal: false,
      rows: '',
      cols: '',
      filetype: '',
      currentAttachment: '',
      currentAttachmentName: ''
    }
  }

  showAttachments = (id, filename) => {
    function fixBase64 (binaryData) {
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
    function downloadFile (base64, filename, mimeType) {
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
        const excelIndex = this.props.incomingAttachments.findIndex(el => el.id === id)
        const file = this.props.incomingAttachments[excelIndex]
        const filedata = file.data
        const mime = file.mime
        const filename = file.name
        let base64 = (filedata).replace(/_/g, '/')
        base64 = base64.replace(/-/g, '+')
        const base64Fixed = fixBase64(base64)
        var fileData = new Blob([base64Fixed], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;' })

        ExcelRenderer(fileData, (err, resp) => {
          if (err) {
            console.log(err)
          } else {
            resp.cols.forEach(col => {
              col.name = resp.rows[0][col.key]
              col.key = col.key + 1
            })
            resp.cols.unshift({ key: 0, name: '' })
            resp.rows.shift()
            this.setState({
              filetype: filetype,
              cols: resp.cols,
              rows: resp.rows,
              currentAttachmentName: filename,
              currentAttachment: id || null,
              openedDownloadPopupId: id,
              attachmentPopoverBody:
              <span>
                <ButtonGroup>
                  <Button onClick={() => this.setState({ openAttachmentModal: !this.state.openAttachmentModal, openedDownloadPopupId: null })} outline size='sm'>Preview</Button>
                  <Button onClick={() => downloadFile(base64, filename, mime)} size='sm'>Download</Button>
                </ButtonGroup>
              </span>
            })
          }
        })
      } else if (filetype === 'pdf') {
        const pdfIndex = this.props.incomingAttachments.findIndex(el => el.id === id)
        const file = this.props.incomingAttachments[pdfIndex]
        const filedata = file.data
        const mime = file.mime
        const filename = file.name
        let base64 = (filedata).replace(/_/g, '/')
        base64 = base64.replace(/-/g, '+')
        const base64Fixed = fixBase64(base64)
        const fileData = new Blob([base64Fixed], { type: 'application/pdf' })
        this.setState({
          attachmentModalSize: {
            height: 800,
            width: 950
          },
          filetype: filetype,
          pdfid: id,
          pdfB64: fileData,
          currentAttachmentName: filename,
          currentAttachment: id || null,
          openedDownloadPopupId: id,
          attachmentPopoverBody:
          <span>
            <ButtonGroup>
              <Button onClick={() => this.setState({ openAttachmentModal: !this.state.openAttachmentModal, openedDownloadPopupId: null })} outline size='sm'>Preview</Button>
              <Button onClick={() => downloadFile(base64, filename, mime)} size='sm'>Download</Button>
            </ButtonGroup>
          </span>
        })
      } else if (filetype === 'html') {
        const fileIndex = this.props.incomingAttachments.findIndex(el => el.id === id)
        const file = this.props.incomingAttachments[fileIndex]
        const filedata = file.data
        const filename = file.name
        const mime = file.mime
        let base64 = (filedata).replace(/_/g, '/')
        base64 = base64.replace(/-/g, '+')
        this.setState({
          attachmentHTMLContent: window.atob(base64),
          filetype: filetype,
          currentAttachment: id || null,
          currentAttachmentName: filename,
          openedDownloadPopupId: id,
          attachmentPopoverBody:
          <span>
            <ButtonGroup>
              <Button onClick={() => this.setState({ openAttachmentModal: !this.state.openAttachmentModal, openedDownloadPopupId: null })} outline size='sm'>Preview</Button>
              <Button onClick={() => downloadFile(base64, filename, mime)} size='sm'>Download</Button>
            </ButtonGroup>
          </span>
        })
      } else {
        const fileIndex = this.props.incomingAttachments.findIndex(el => el.id === id)
        const file = this.props.incomingAttachments[fileIndex]
        const mime = file.mime
        const rawData = file.data
        let base64 = (rawData).replace(/_/g, '/')
        base64 = base64.replace(/-/g, '+')
        this.setState({
          attachmentPopoverBody:
          <span>
            <ButtonGroup>
              <Button outline disabled size='sm'>
                <Tooltip
                  title='Preview not available for this filetype'
                  position='bottom'
                  trigger='mouseenter'
                  delay='250'
                  distance='25'
                  interactiveBorder='15'
                  arrow
                  size='small'
                  theme='transparent'
                >
                  Preview
                </Tooltip>
              </Button>
              <Button onClick={() => downloadFile(base64, filename, mime)} size='sm'>Download</Button>
            </ButtonGroup>
          </span>,
          openedDownloadPopupId: id
        })
      }
    } else {
      this.setState({
        openAttachmentModal: !this.state.openAttachmentModal,
        currentAttachment: id || null
      })
    }
  }

  render () {
    const {
      attachmentHTMLContent,
      openAttachmentModal,
      rows,
      cols,
      filetype,
      pdfB64,
      currentAttachment,
      currentAttachmentName
    } = this.state

    let HALF_WIDTH = 500
    if (typeof window !== 'undefined') {
      HALF_WIDTH = this.state.width !== 0 ? this.state.width / 2 : 500
    }

    return (
      typeof window !== 'undefined' && (
        <Rnd
          default={{
            x: HALF_WIDTH,
            y: 125,
            width: 800,
            height: 'auto'
          }}
          style={{
            visibility: openAttachmentModal ? 'visible' : 'hidden',
            opacity: openAttachmentModal ? 1 : 0,
            backgroundColor: 'var(--primary-bg)',
            overflow: 'hidden',
            borderRadius: '15px',
            zIndex: '101',
            boxShadow: '0px 0px 20px 1px var(--dark)'
          }}
          bounds='window'
          dragHandleClassName='modal-attachment-header-text'
        >
          <div style={{ borderRadius: '15px', position: 'relative' }}>
            <ModalHeader
              className='modal-attachment-header-text'
              style={{
                background: 'var(--fourth-bg)',
                borderRadius: '0px',
                color: 'var(--white)',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              {currentAttachmentName}
              <Button outline className='close-attachment-modal-btn' theme='light' style={{ borderRadius: '5px', padding: '0.7em 0.9em' }} onClick={() => this.showAttachments(null)}>
                <FontAwesomeIcon
                  className='close-attachment-modal-icon' width='1.5em' style={{ color: 'var(--light)', fontSize: '12px' }}
                  icon={faTimesCircle}
                />
              </Button>
            </ModalHeader>
            <ModalBody style={filetype === 'pdf' ? { overflow: 'scroll', padding: '0', height: '450px' } : null}>
              {filetype === 'excel'
                ? (
                  <div className='attachment-body pdf'>
                    <OutTable data={rows} columns={cols} tableClassName='ExcelTable2007' tableHeaderRowClass='heading' />
                  </div>
                ) : (
                  null
                )}
              {filetype === 'pdf'
                ? (
                  <div className='attachment-body excel'>
                    <PDF file={pdfB64} scale={1.75} />
                  </div>
                ) : (
                  null
                )}
              {filetype === 'html'
                ? (
                  <root.div className='attachment-body html'>
                    <div style={this.props.night ? { color: '#6c757d' } : {}} dangerouslySetInnerHTML={{ __html: attachmentHTMLContent }} />
                  </root.div>
                ) : (
                  null
                )}
            </ModalBody>
          </div>
        </Rnd>
      )
    )
  }
}
