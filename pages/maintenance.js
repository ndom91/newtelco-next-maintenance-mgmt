import React from 'react'
import Layout from '../src/components/layout'
import fetch from 'isomorphic-unfetch'
import RequireLogin from '../src/components/require-login'
import { NextAuth } from 'next-auth/client'
import Toggle from 'react-toggle'
import './style/maintenance.css'
import cogoToast from 'cogo-toast'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import Router from 'next/router'
import { Helmet } from 'react-helmet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Editor as TinyEditor } from '@tinymce/tinymce-react'
import { format, isValid, formatDistance, parseISO, compareAsc } from 'date-fns'
import moment from 'moment-timezone'
import { Rnd } from 'react-rnd'
import UnreadCount from '../src/components/unreadcount'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/material_blue.css'
import TimezoneSelector from '../src/components/timezone'
import { getUnique, convertDateTime } from '../src/components/maintenance/helper'
import { HotKeys } from 'react-hotkeys'
import { OutTable, ExcelRenderer } from 'react-excel-renderer'
import ProtectedIcon from '../src/components/ag-grid/protected'
import SentIcon from '../src/components/ag-grid/sent'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'

import 'react-tippy/dist/tippy.css'
import { Tooltip } from 'react-tippy'

import {
  faPlusCircle,
  faCalendarAlt,
  faArrowLeft,
  faEnvelopeOpenText,
  faLanguage,
  faFirstAid,
  faPaperPlane,
  faTimesCircle,
  faRandom,
  faSearch,
  faHistory,
  faMailBulk
} from '@fortawesome/free-solid-svg-icons'
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  ButtonToolbar,
  ButtonGroup,
  Button,
  Badge,
  FormGroup,
  FormTextarea,
  FormInput,
  Modal,
  ModalHeader,
  ModalBody
} from 'shards-react'

const animatedComponents = makeAnimated()

export default class Maintenance extends React.Component {
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest2 = `https://api.${host}/inbox/count`
    const res2 = await fetch(pageRequest2)
    const count = await res2.json()
    let display
    if (count === 'No unread emails') {
      display = 0
    } else {
      display = count.count
    }
    if (query.id === 'NEW') {
      return {
        jsonData: { profile: query },
        unread: display,
        session: await NextAuth.init({ req })
      }
    } else {
      const pageRequest = `https://${host}/api/maintenances/${query.id}`
      const res = await fetch(pageRequest)
      const json = await res.json()
      return {
        jsonData: json,
        unread: display,
        session: await NextAuth.init({ req })
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      width: 0,
      maintenance: {
        incomingAttachments: [],
        incomingBody: this.props.jsonData.profile.body,
        timezone: 'Europe/Amsterdam',
        timezoneLabel: '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
        bearbeitetvon: '',
        maileingang: '',
        updatedAt: '',
        updatedBy: '',
        name: '',
        impact: '',
        location: '',
        reason: '',
        mailId: 'NT'
      },
      dateTimeWarning: false,
      openAttachmentModal: false,
      openProtectionSwitchToggle: false,
      openUseImpactPlaceholderToggle: false,
      openReadModal: false,
      openPreviewModal: false,
      openHelpModal: false,
      translateTooltipOpen: false,
      translated: false,
      translatedBody: '',
      notesText: props.jsonData.profile.notes || '',
      mailBodyText: '',
      lieferantcids: {},
      kundencids: [],
      windowInnerHeight: 0,
      unreadCount: '',
      gridOptions: {
        defaultColDef: {
          resizable: true,
          sortable: true,
          filter: true,
          selectable: true
        },
        columnDefs: [
          {
            headerName: 'Mail',
            width: 80,
            sortable: false,
            filter: false,
            resizable: false,
            cellRenderer: 'sendMailBtn',
            cellStyle: { 'padding-right': '0px', 'padding-left': '10px' }
          }, {
            headerName: 'CID',
            field: 'kundenCID',
            width: 100,
            sort: { direction: 'asc', priority: 0 }
          }, {
            headerName: 'Customer',
            field: 'name',
            width: 170
          }, {
            headerName: 'Protection',
            field: 'protected',
            filter: false,
            cellRenderer: 'protectedIcon',
            width: 120,
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }, {
            headerName: 'Recipient',
            field: 'maintenanceRecipient',
            width: 150
          }, {
            headerName: 'Sent',
            field: 'sent',
            cellRenderer: 'sentIcon',
            width: 100,
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }
        ],
        // context: { componentParent: this },
        frameworkComponents: {
          sendMailBtn: this.sendMailBtns,
          protectedIcon: ProtectedIcon,
          sentIcon: SentIcon
        },
        paginationPageSize: 10,
        rowClass: 'row-class'
      }
    }
    this.toggleReadModal = this.toggleReadModal.bind(this)
    this.togglePreviewModal = this.togglePreviewModal.bind(this)
    this.handleNotesChange = this.handleNotesChange.bind(this)
    this.handleMailPreviewChange = this.handleMailPreviewChange.bind(this)
    this.sendMail = this.sendMail.bind(this)
    this.handleEditorChange = this.handleEditorChange.bind(this)
    this.handleCalendarCreate = this.handleCalendarCreate.bind(this)
    this.handleCIDBlur = this.handleCIDBlur.bind(this)
    this.handleDateTimeBlur = this.handleDateTimeBlur.bind(this)
    this.handleTextInputBlur = this.handleTextInputBlur.bind(this)
    this.handleImpactChange = this.handleImpactChange.bind(this)
    this.handleReasonChange = this.handleReasonChange.bind(this)
    this.handleLocationChange = this.handleLocationChange.bind(this)
    this.handleCreateOnClick = this.handleCreateOnClick.bind(this)
    this.handleNotesBlur = this.handleNotesBlur.bind(this)
    this.handleTimezoneChange = this.handleTimezoneChange.bind(this)
    this.handleTimezoneBlur = this.handleTimezoneBlur.bind(this)
    this.handleProtectionSwitch = this.handleProtectionSwitch.bind(this)
    this.useImpactPlaceholder = this.useImpactPlaceholder.bind(this)
    this.handleUpdatedByChange = this.handleUpdatedByChange.bind(this)
    this.handleUpdatedAtChange = this.handleUpdatedAtChange.bind(this)
    this.handleSupplierBlur = this.handleSupplierBlur.bind(this)
    this.handleSupplierChange = this.handleSupplierChange.bind(this)
    this.prepareDirectSend = this.prepareDirectSend.bind(this)
    this.toggleHelpModal = this.toggleHelpModal.bind(this)
    this.onGridReady = this.onGridReady.bind(this)
    this.showAttachments = this.showAttachments.bind(this)
    this.handleSendAll = this.handleSendAll.bind(this)
    // this.toggleProtectionSwitchTooltip = this.toggleProtectionSwitchTooltip.bind(this)
    // this.toggleUseImpactPlaceholderTooltip = this.toggleUseImpactPlaceholderTooltip.bind(this)
  }

  componentDidMount () {
    const convertBool = (input) => {
      if (input === '1' || input === '0') {
        if (input === '1') {
          return true
        } else if (input === '0') {
          return false
        }
      } else if (input === 'true' || input === 'false') {
        if (input === 'true') {
          return true
        } else if (input === 'false') {
          return false
        }
      } else {
        return input
      }
    }

    // preapre NEW maintenance
    if (this.props.jsonData.profile.id === 'NEW') {
      const {
        email
      } = this.props.session.user
      const username = email.substr(0, email.indexOf('@'))
      const maintenance = {
        ...this.props.jsonData.profile,
        bearbeitetvon: username,
        updatedAt: format(new Date(), 'MM.dd.yyyy HH:mm')
      }
      this.setState({
        maintenance: maintenance,
        width: window.innerWidth
      })
    } else {
      // prepare page for existing maintenance
      const {
        cancelled,
        emergency,
        done
      } = this.props.jsonData.profile

      const newMaintenance = {
        ...this.props.jsonData.profile,
        cancelled: convertBool(cancelled),
        emergency: convertBool(emergency),
        done: convertBool(done),
        timezone: 'Europe/Amsterdam',
        timezoneLabel: '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
        startDateTime: moment.tz(this.props.jsonData.profile.startDateTime, 'GMT').tz('Etc/GMT-2').format('YYYY-MM-DD HH:mm:ss'),
        endDateTime: moment.tz(this.props.jsonData.profile.endDateTime, 'GMT').tz('Etc/GMT-2').format('YYYY-MM-DD HH:mm:ss')
      }
      console.log(`Start\n${this.props.jsonData.profile.startDateTime}\n${moment.tz(this.props.jsonData.profile.startDateTime, 'GMT')}\n${newMaintenance.startDateTime}`)

      this.setState({
        maintenance: newMaintenance,
        width: window.innerWidth
      })
    }

    // prepare to get available supplier CIDs for selected supplier
    const host = window.location.host
    if (this.props.jsonData.profile.lieferant) {
      const lieferantId = this.props.jsonData.profile.lieferant

      this.fetchLieferantCIDs(lieferantId)
    } else {
      let lieferantDomain
      if (this.props.jsonData.profile.id === 'NEW') {
        lieferantDomain = this.props.jsonData.profile.name
      } else {
        lieferantDomain = this.props.jsonData.profile.mailDomain
      }
      fetch(`https://${host}/api/companies/domain?id=${lieferantDomain}`, {
        method: 'get'
      })
        .then(resp => resp.json())
        .then(data => {
          if (!data.companyResults[0]) {
            this.fetchLieferantCIDs()
            return
          }
          const companyId = data.companyResults[0].id
          const companyName = data.companyResults[0].name
          this.setState({
            maintenance: {
              ...this.state.maintenance,
              name: companyName,
              lieferant: companyId
            }
          })
          this.fetchLieferantCIDs(companyId)
        })
        .catch(err => console.error(`Error - ${err}`))
    }
    // get choices for company select
    fetch(`https://${host}/api/companies/selectmaint`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          suppliers: data.companies
        })
      })
      .catch(err => console.error(`Error - ${err}`))
    this.setState({
      windowInnerHeight: window.innerHeight
    })

    const startDateTime = this.props.jsonData.profile.startDateTime
    const endDateTime = this.props.jsonData.profile.endDateTime

    if (startDateTime && endDateTime && isValid(parseISO(startDateTime)) && isValid(parseISO(endDateTime))) {
      const impactCalculation = formatDistance(parseISO(endDateTime), parseISO(startDateTime))
      this.setState({
        impactPlaceholder: impactCalculation
      })
    }
  }

  /// /////////////////////////////////////////////////////////
  //
  //                AG-GRID TABLE
  //
  /// /////////////////////////////////////////////////////////

  handleGridReady = params => {
    this.gridApi = params.gridApi
    this.gridColumnApi = params.gridColumnApi
    // params.columnApi.autoSizeColumns()
  }

  refreshCells () {
    this.gridApi.refreshCells()
  }

  sendMailBtns = (row) => {
    return (
      <ButtonGroup>
        <Button onClick={() => this.prepareDirectSend(row.data.maintenanceRecipient, row.data.kundenCID)} style={{ padding: '0.7em' }} size='sm' outline>
          <FontAwesomeIcon width='1.325em' icon={faPaperPlane} />
        </Button>
        <Button onClick={() => this.togglePreviewModal(row.data.maintenanceRecipient, row.data.kundenCID)} style={{ padding: '0.7em' }} size='sm' outline>
          <FontAwesomeIcon width='1.325em' icon={faSearch} />
        </Button>
      </ButtonGroup>
    )
  }

  handleSendAll () {
    // console.log(this.gridApi) 
    this.gridApi.forEachNode((node, index) => {
      console.log(node, index)
      const data = node.data
      const HtmlBody = this.generateMail(data.kundenCID)
      const subject = `Planned Work Notification - NT-${this.state.maintenance.id}`
      this.sendMail(data.maintenanceRecipient, data.kundenCid, subject, HtmlBody, false)
      cogoToast.success(`Mail Sent - ${data.name}`, {
        position: 'top-right'
      })
    })
    cogoToast.success('All Mail Send Complete', {
      position: 'top-right'
    })
  }

  onGridReady (params) {
    this.gridApi = params.gridApi
    // this.gridOptions.api.setColumnDefs(yourColumnDefs);
    params.api.setRowData(this.state.kundencids)
  }

  onFirstDataRendered (params) {
    // params.columnApi.autoSizeColumns()
    // params.columnApi.sizeColumnsToFit()
  }

  /// /////////////////////////////////////////////////////////
  //
  //                ACTIONS: API CALLS
  //
  /// /////////////////////////////////////////////////////////

  // handle Google Translate API calls
  handleTranslate () {
    const {
      body
    } = this.props.jsonData.profile

    if (this.state.translated) {
      this.setState({
        translated: !this.state.translated
      })
    } else if (this.state.maintenance.incomingBody) {
      const host = window.location.host
      fetch(`https://api.${host}/translate`, {
        method: 'post',
        body: JSON.stringify({ q: body }),
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      })
        .then(resp => resp.json())
        .then(data => {
          const text = data.translatedText
          this.setState({
            translatedBody: text,
            translated: !this.state.translated
          })
        })
        .catch(err => console.error(`Error - ${err}`))
    } else {
      cogoToast.warn('No Mail Body Available', {
        position: 'top-right'
      })
    }
  }

  // fetch supplier CIDs
  fetchLieferantCIDs (lieferantId) {
    if (!lieferantId) {
      this.setState({
        lieferantcids: [{ label: 'Invalid Supplier ID', value: '1' }]
      })
      return
    }
    const host = window.location.host
    fetch(`https://${host}/api/lieferantcids?id=${lieferantId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (!data.lieferantCIDsResult) {
          this.setState({
            lieferantcids: [{ label: 'No CIDs available for this Supplier', value: '1' }]
          })
          return
        }
        const derenCIDidField = this.props.jsonData.profile.derenCIDid
        const commaRegex = new RegExp(',')
        if (commaRegex.test(derenCIDidField)) {
          // multiple CID string (comma separated)
          this.setState({
            lieferantcids: data.lieferantCIDsResult
          })
          fetch(`https://${host}/api/lieferantcids/label?id=${derenCIDidField}`, {
            method: 'get'
          })
            .then(resp => resp.json())
            .then(data => {
              data.respArray.forEach(respCid => {
                this.fetchMailCIDs(respCid.value)
              })
              this.setState({
                selectedLieferant: data.respArray
              })
            })
        } else {
          // Single CID String
          const selectedLieferantCIDid = parseInt(derenCIDidField) || null
          this.fetchMailCIDs(selectedLieferantCIDid)
          const selectedLieferantCIDvalue = this.props.jsonData.profile.derenCID || null
          if (selectedLieferantCIDid) {
            this.setState({
              lieferantcids: data.lieferantCIDsResult,
              selectedLieferant: [{
                label: selectedLieferantCIDvalue,
                value: selectedLieferantCIDid
              }]
            })
          } else {
            this.setState({
              lieferantcids: data.lieferantCIDsResult
            })
          }
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  // fetch customer CIDs based on selected Supplier CID
  fetchMailCIDs (lieferantCidId) {
    const host = window.location.host
    if (!lieferantCidId) {
      return
    }
    // @param1 - int -1 single LIeferantCID ID
    fetch(`https://${host}/api/customercids/${lieferantCidId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const {
          done
        } = this.state.maintenance
        // if (data.kundenCIDsResult.length > 1) {
        let currentSentStatus = '0'
        if (done === 1 || done === true || done === '1') {
          currentSentStatus = '1'
        }
        const kundencids = data.kundenCIDsResult
        kundencids.forEach(cid => {
          cid.sent = currentSentStatus
        })
        const newKundenCids = this.state.kundencids
        kundencids.forEach(cid => {
          newKundenCids.push(cid)
        })
        const uniqueKundenCids = getUnique(newKundenCids, 'kundenCID')
        this.setState({
          kundencids: uniqueKundenCids
        })
        if (this.gridApi) {
          this.gridApi.refreshCells()
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  /// /////////////////////////////////////////////////////////
  //                    SEND MAILS
  /// /////////////////////////////////////////////////////////

  // prepare mail from direct-send button
  prepareDirectSend (recipient, customerCID) {
    const HtmlBody = this.generateMail(customerCID)
    const subject = `Planned Work Notification - NT-${this.state.maintenance.id}`
    // this.setState({
    //   mailBodyText: HtmlBody,
    //   mailPreviewHeaderText: recipient,
    //   mailPreviewSubjectText: subject
    // })
    this.sendMail(recipient, customerCID, subject, HtmlBody, false)
  }

  // generate Mail contents
  generateMail = (customerCID) => {
    const {
      id,
      startDateTime,
      endDateTime,
      impact,
      reason,
      location,
      timezone
    } = this.state.maintenance

    if (!id || !startDateTime || !endDateTime) {
      cogoToast.warn('Missing required fields', {
        position: 'top-right'
      })
      return
    }

    const timezoneValue = timezone || 'Europe/Dublin'
    const rawStart = moment.tz(startDateTime, timezoneValue)
    const rawEnd = moment.tz(endDateTime, timezoneValue)
    // const incomingTzStart = moment.tz(rawStart, timezoneValue)
    // const incomingTzEnd = moment.tz(rawEnd, timezoneValue)
    const utcStart1 = rawStart.tz('GMT').format('YYYY-MM-DD HH:mm:ss')
    const utcEnd1 = rawEnd.tz('GMT').format('YYYY-MM-DD HH:mm:ss')
    const utcStart = this.props.jsonData.profile.startDateTime || utcStart1
    const utcEnd = this.props.jsonData.profile.endDateTime || utcEnd1

    const rescheduleText = ''
    const tzSuffixRAW = 'UTC / GMT+0:00'

    let body = `<body style="color:#666666;">${rescheduleText} Dear Colleagues,​​<p><span>We would like to inform you about planned work on the following CID(s):<br><br> <b>${customerCID}</b> <br><br>The maintenance work is with the following details:</span></p><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>NT-${id}</b></td></tr><tr><td>Start date and time:</td><td><b>${utcStart} (${tzSuffixRAW})</b></td></tr><tr><td>Finish date and time:</td><td><b>${utcEnd} (${tzSuffixRAW})</b></td></tr>`

    if (impact) {
      body = body + '<tr><td>Impact:</td><td>' + impact + '</td></tr>'
    }

    if (location) {
      body = body + '<tr><td>Location:</td><td>' + location + '</td></tr>'
    }

    if (reason) {
      body = body + '<tr><td>Reason:</td><td>' + reason + '</td></tr>'
    }

    body = body + '</table><p>We sincerely regret any inconvenience that may be caused by this and hope for further mutually advantageous cooperation.</p><p>If you have any questions feel free to contact us at maintenance@newtelco.de.</p></div>​​</body>​​<footer>​<style>.sig{font-family:Century Gothic, sans-serif;font-size:9pt;color:#636266!important;}b.i{color:#4ca702;}.gray{color:#636266 !important;}a{text-decoration:none;color:#636266 !important;}</style><div class="sig"><div>Best regards <b class="i">|</b> Mit freundlichen Grüßen</div><br><div><b>Newtelco Maintenance Team</b></div><br><div>NewTelco GmbH <b class="i">|</b> Moenchhofsstr. 24 <b class="i">|</b> 60326 Frankfurt a.M. <b class="i">|</b> DE <br>www.newtelco.com <b class="i">|</b> 24/7 NOC  49 69 75 00 27 30 ​​<b class="i">|</b> <a style="color:#" href="mailto:service@newtelco.de">service@newtelco.de</a><br><br><div><img src="https://home.newtelco.de/sig.png" height="29" width="516"></div></div>​</footer>'

    return body
  }

  // send out the created mail
  sendMail (recipient, customerCid, subj, htmlBody, isFromPreview) {
    const host = window.location.host
    const body = htmlBody || this.state.mailBodyText
    let subject = subj || this.state.mailPreviewSubjectText
    const to = recipient || this.state.mailPreviewHeaderText

    const emergency = this.state.maintenance.emergency
    if (emergency === 'true' || emergency === true || emergency === '1' || emergency === 1) {
      subject = `[EMERGENCY] ${subject}`
    }

    fetch(`https://api.${host}/mail/send`, {
      method: 'post',
      body: JSON.stringify({
        body: body,
        subject: subject,
        to: to
      }),
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
      .then(resp => resp.json())
      .then(data => {
        const status = data.response.status
        const statusText = data.response.statusText

        if (status === 200 && statusText === 'OK') {
          const activeRowIndex = this.state.kundencids.findIndex(el => el.kundenCID === customerCid)
          const kundenCidRow = this.state.kundencids[activeRowIndex]
          kundenCidRow.sent = '1'
          const updatedKundenCids = [
            ...this.state.kundencids,
            kundenCidRow
          ]
          const deduplicatedKundenCids = getUnique(updatedKundenCids, 'kundenCID')
          this.setState({
            kundencids: deduplicatedKundenCids
          })
          cogoToast.success('Mail Sent', {
            position: 'top-right'
          })
          if (isFromPreview) {
            this.setState({
              openPreviewModal: !this.state.openPreviewModal
            })
          }
          if (this.gridApi) {
            this.gridApi.refreshCells()
          }
        } else {
          cogoToast.warn('Error Sending Mail', {
            position: 'top-right'
          })
          if (isFromPreview) {
            this.setState({
              openPreviewModal: !this.state.openPreviewModal
            })
          }
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  handleCalendarCreate () {
    const host = window.location.host
    const company = this.state.maintenance.name
    const maintId = this.state.maintenance.id
    const startDateTime = this.state.maintenance.startDateTime
    const endDateTime = this.state.maintenance.endDateTime

    let derenCid = ''
    this.state.selectedLieferant.forEach(cid => {
      derenCid = derenCid + cid.label + ' '
    })
    derenCid = derenCid.trim()

    let cids = ''
    this.state.kundencids.forEach(cid => {
      cids = cids + cid.kundenCID + ' '
    })
    cids = cids.trim()

    const startMoment = moment.tz(startDateTime, this.state.maintenance.timezone)
    const startDE = startMoment.tz('Europe/Berlin').format()
    const endMoment = moment.tz(endDateTime, this.state.maintenance.timezone)
    const endDE = endMoment.tz('Europe/Berlin').format()

    fetch(`https://api.${host}/calendar/create`, {
      method: 'post',
      body: JSON.stringify({
        company: company,
        cids: cids,
        supplierCID: derenCid,
        maintId: maintId,
        startDateTime: startDE,
        endDateTime: endDE
      }),
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
      .then(resp => resp.json())
      .then(data => {
        const status = data.status
        const statusText = data.statusText

        if (status === 200 && statusText === 'OK') {
          cogoToast.success('Calendar Entry Created', {
            position: 'top-right'
          })
        } else if (statusText === 'failed') {
          cogoToast.warn(`Error creating Calendar Entry - ${data.statusText}`, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  /// /////////////////////////////////////////////////////////
  //
  //                INPUTS: ONCHANGE
  //
  /// /////////////////////////////////////////////////////////

  // mail preview modal change
  handleMailPreviewChange (content, delta, source, editor) {
    this.setState({ mailBodyText: editor.getContents() })
  }

  // react-select change cmoponent for supplier CIDs - change
  handleSelectLieferantChange = selectedOption => {
    if (selectedOption) {
      this.setState({
        kundencids: []
      })
      selectedOption.forEach(option => {
        this.fetchMailCIDs(option.value)
      })
      this.setState({
        selectedLieferant: selectedOption
      })
    }
  }

  handleEditorChange (data) {
    this.setState({
      mailBodyText: data.level.content
    })
  }

  handleNotesChange (data) {
    const newMaint = {
      ...this.state.maintenance,
      notes: data.level.content
    }

    this.setState({
      maintenance: newMaint
    })
  }

  // refreshCells (gridApi) {
  //   gridApi.refreshCells()
  // }

  handleCreatedByChange (data) {
    // dummy
  }

  saveDateTime = (maintId, element, newValue) => {
    // console.log('presaveTime: ', newValue, this.state.maintenance.timezone)
    let newISOTime = moment.tz(newValue, this.state.maintenance.timezone)
    // console.log('saveTime: ', newISOTime.toString())
    if (maintId === 'NEW') {
      cogoToast.warn('No CID assigned - Cannot Save', {
        position: 'top-right'
      })
      return
    }
    newISOTime = newISOTime.utc().format('YYYY-MM-DD HH:mm:ss')
    // console.log('preSave1: ', newISOTime)
    const host = window.location.host
    fetch(`https://${host}/api/maintenances/save/dateTime?maintId=${maintId}&element=${element}&value=${newISOTime}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: this.props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          // cogoToast.success('Save Success', {
          //   position: 'top-right'
          // })
          console.log(`DateTime Save Success\n${newISOTime}`)
        } else {
          console.warn(`DateTime Save Failed\n${element}\n${newValue}\n${newISOTime}`)
          // cogoToast.warn(`Error - ${data.err}`, {
          //   position: 'top-right'
          // })
        }
      })
      .catch(err => console.error(err))
  }

  handleStartDateChange (date) {
    // console.log(`changeStart\n${date[0]}\n${moment(date[0]).format('YYYY-MM-DD HH:mm:ss')}`)
    // console.log(date)
    // const startDate = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')
    const startDate = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')
    // console.log('sD: ', startDate)

    this.setState({
      maintenance: {
        ...this.state.maintenance,
        startDateTime: startDate
      }
    })
    this.saveDateTime(this.state.maintenance.id, 'start', startDate)
    const startDateTime = this.state.maintenance.startDateTime
    const endDateTime = this.state.maintenance.endDateTime

    if (startDateTime && endDateTime && isValid(parseISO(startDateTime)) && isValid(parseISO(endDateTime))) {
      const impactCalculation = formatDistance(parseISO(endDateTime), parseISO(startDateTime))
      this.setState({
        impactPlaceholder: impactCalculation
      })
    }
  }

  handleEndDateChange (date) {
    // console.log(date)
    // console.log(`changeEnd\n${date[0]}\n${moment(date[0]).format('YYYY-MM-DD HH:mm:ss')}`)
    const endDate = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')
    // console.log('sD: ', endDate)

    this.setState({
      maintenance: {
        ...this.state.maintenance,
        endDateTime: endDate
      }
    })
    this.saveDateTime(this.state.maintenance.id, 'end', endDate)
    const startDateTime = this.state.maintenance.startDateTime
    const endDateTime = this.state.maintenance.endDateTime

    if (startDateTime && endDateTime && isValid(parseISO(startDateTime)) && isValid(parseISO(endDateTime))) {
      const dateCompare = compareAsc(parseISO(endDateTime), parseISO(startDateTime))
      if (dateCompare !== 1) {
        cogoToast.warn('End date is before Start date', {
          position: 'top-right'
        })
        this.setState({
          dateTimeWarning: true
        })
      } else {
        if (this.state.dateTimeWarning) {
          this.setState({
            dateTimeWarning: false
          })
        }
      }
      const impactCalculation = formatDistance(parseISO(endDateTime), parseISO(startDateTime))
      this.setState({
        impactPlaceholder: impactCalculation
      })
    }
  }

  handleToggleChange (element, event) {
    const host = window.location.host
    const maintId = this.state.maintenance.id
    let newValue = !eval(`this.state.maintenance.${element}`)
    if (typeof newValue === 'string') {
      if (newValue === 'false') {
        newValue = false
      } else if (newValue === 'true') {
        newValue = true
      }
    }

    this.setState({
      maintenance: {
        ...this.state.maintenance,
        [element]: newValue
      }
    })

    if (element === 'done') {
      // save 'betroffeneCIDs'
      let impactedCIDs = ''
      this.state.kundencids.forEach(cid => {
        impactedCIDs = impactedCIDs + cid.kundenCID + ' '
      })

      impactedCIDs = impactedCIDs.trim()

      this.setState({
        maintenance: {
          ...this.state.maintenance,
          betroffeneCIDs: impactedCIDs,
          [element]: newValue
        }
      })

      fetch(`https://${host}/api/maintenances/save/impactedcids?cids=${impactedCIDs}&maintId=${this.state.maintenance.id}`, {
        method: 'get',
        headers: {
          'Access-Control-Allow-Origin': '*',
          _csrf: this.props.session.csrfToken
        }
      })
        .then(resp => resp.json())
        .then(data => {
          if (data.status === 200) {
            cogoToast.success('Impacted CIDs Saved', {
              position: 'top-right'
            })
          } else {
            cogoToast.warn('Impacted CIDs Not Saved', {
              position: 'top-right'
            })
          }
        })
        .catch(err => console.error(`Error - ${err}`))

      // update Algolia Index
      fetch(`https://api.${host}/search/update`, {
        method: 'get'
      })
    }

    if (maintId === 'NEW') {
      cogoToast.warn('No CID assigned - Cannot Save', {
        position: 'top-right'
      })
      return
    }
    fetch(`https://${host}/api/maintenances/save/toggle?maintId=${maintId}&element=${element}&value=${newValue}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: this.props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          cogoToast.success('Save Success', {
            position: 'top-right'
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(err))
  }

  handleReasonChange (event) {
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        reason: event.target.value
      }
    })
  }

  handleLocationChange (event) {
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        location: event.target.value
      }
    })
  }

  handleImpactChange (event) {
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        impact: event.target.value
      }
    })
  }

  handleTimezoneChange (selection) {
    const timezoneLabel = selection.label // 'Europe/Amsterdam'
    const timezoneValue = selection.value // '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna'

    this.setState({
      maintenance: {
        ...this.state.maintenance,
        timezone: timezoneValue,
        timezoneLabel: timezoneLabel
      }
    })
  }

  handleUpdatedByChange () {
    const value = this.state.maintenance.updatedBy
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        updatedBy: value
      }
    })
  }

  handleUpdatedAtChange () {
    const value = this.state.maintenance.updatedAt
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        updatedAt: value
      }
    })
  }

  handleSupplierChange (selectedOption) {
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        lieferant: selectedOption.value,
        name: selectedOption.label
      },
      selectedLieferant: [],
      kundencids: []
    })
    this.fetchLieferantCIDs(selectedOption.value)
  }

  /// /////////////////////////////////////////////////////////
  //
  //                INPUTS: ONBLUR
  //
  /// /////////////////////////////////////////////////////////

  handleDateTimeBlur (element) {
    // let newValue
    // const maintId = this.state.maintenance.id
    // if (element === 'start') {
    //   if (isValid(parseISO(this.state.maintenance.startDateTime))) {
    //     newValue = this.state.maintenance.startDateTime
    //   }
    // } else if (element === 'end') {
    //   if (isValid(new Date(this.state.maintenance.endDateTime))) {
    //     newValue = this.state.maintenance.endDateTime
    //   }
    // }
    // const saveDateTime = (maintId, element, newValue) => {
    //   const host = window.location.host
    //   console.log('presaveTime: ', newValue, this.state.maintenance.timezone)
    //   let newISOTime = moment.tz(newValue, this.state.maintenance.timezone)
    //   console.log('saveTime: ', newISOTime.toString())
    //   if (maintId === 'NEW') {
    //     cogoToast.warn('No CID assigned - Cannot Save', {
    //       position: 'top-right'
    //     })
    //     return
    //   }
    //   newISOTime = newISOTime.utc().format('YYYY-MM-DD HH:mm:ss')
    //   console.log('preSave1: ', newISOTime)
    //   fetch(`https://${host}/api/maintenances/save/dateTime?maintId=${maintId}&element=${element}&value=${newISOTime}`, {
    //     method: 'get',
    //     headers: {
    //       'Access-Control-Allow-Origin': '*',
    //       _csrf: this.props.session.csrfToken
    //     }
    //   })
    //     .then(resp => resp.json())
    //     .then(data => {
    //       if (data.status === 200 && data.statusText === 'OK') {
    //         cogoToast.success('Save Success', {
    //           position: 'top-right'
    //         })
    //       } else {
    //         cogoToast.warn(`Error - ${data.err}`, {
    //           position: 'top-right'
    //         })
    //       }
    //     })
    //     .catch(err => console.error(err))
    // }
    // saveDateTime(maintId, element, newValue)
    cogoToast.success('Save Success', {
      position: 'top-right'
    })
  }

  handleCIDBlur (ev) {
    const postSelection = (id) => {
      const host = window.location.host
      let idParameter
      if (Array.isArray(id)) {
        idParameter = id.join(',')
      } else {
        idParameter = id
      }
      if (idParameter === this.state.maintenance.derenCIDid) {
        return true
      }
      const maintId = this.state.maintenance.id
      if (maintId === 'NEW') {
        cogoToast.warn('No CID assigned - Cannot Save', {
          position: 'top-right'
        })
        return
      }
      fetch(`https://${host}/api/maintenances/save/lieferant?maintId=${maintId}&cid=${idParameter}`, {
        method: 'get',
        headers: {
          'Access-Control-Allow-Origin': '*',
          _csrf: this.props.session.csrfToken
        }
      })
        .then(resp => resp.json())
        .then(data => {
          if (data.status === 200 && data.statusText === 'OK') {
            cogoToast.success('Save Success', {
              position: 'top-right'
            })
          } else {
            cogoToast.warn(`Error - ${data.err}`, {
              position: 'top-right'
            })
          }
        })
        .catch(err => console.error(err))
    }
    const selectedSupplierCids = this.state.selectedLieferant
    if (Array.isArray(selectedSupplierCids)) {
      const arrayToSend = []
      selectedSupplierCids.forEach(cid => {
        const selectedId = cid.value
        arrayToSend.push(selectedId)
      })
      postSelection(arrayToSend)
    } else if (selectedSupplierCids && selectedSupplierCids.value) {
      const selectedId = selectedSupplierCids.value
      postSelection(selectedId)
    }
  }

  handleTimezoneBlur (ev) {
    const incomingTimezone = this.state.maintenance.timezone || 'Europe/Amsterdam'
    const incomingTimezoneLabel = encodeURIComponent(this.state.maintenance.timezoneLabel || '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna')
    const host = window.location.host
    fetch(`https://${host}/api/maintenances/save/timezone?maintId=${this.state.maintenance.id}&timezone=${incomingTimezone}&timezoneLabel=${incomingTimezoneLabel}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: this.props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          cogoToast.success('Save Success', {
            position: 'top-right'
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(err))
  }

  handleTextInputBlur (element) {
    const host = window.location.host
    const newValue = eval(`this.state.maintenance.${element}`)
    const originalValue = eval(`this.props.jsonData.profile.${element}`)
    const maintId = this.state.maintenance.id

    if (newValue === originalValue) {
      return
    }

    if (maintId === 'NEW') {
      cogoToast.warn('No CID assigned - Cannot Save', {
        position: 'top-right'
      })
      return
    }
    fetch(`https://${host}/api/maintenances/save/textinput?maintId=${maintId}&element=${element}&value=${newValue}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: this.props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          cogoToast.success('Save Success', {
            position: 'top-right'
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(err))
  }

  handleNotesBlur (event) {
    const host = window.location.host
    const newValue = this.state.maintenance.notes
    const originalValue = this.props.jsonData.profile.notes
    if (newValue === originalValue) {
      return
    }
    const maintId = this.state.maintenance.id
    if (maintId === 'NEW') {
      cogoToast.warn('No CID assigned - Cannot Save', {
        position: 'top-right'
      })
      return
    }
    fetch(`https://${host}/api/maintenances/save/notes?maintId=${maintId}&value=${newValue}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: this.props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          cogoToast.success('Save Success', {
            position: 'top-right'
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(err))
  }

  handleSupplierBlur () {
    const host = window.location.host
    const newValue = this.state.maintenance.lieferant
    const maintId = this.state.maintenance.id
    if (maintId === 'NEW') {
      cogoToast.warn('No CID assigned - Cannot Save', {
        position: 'top-right'
      })
      return
    }
    fetch(`https://${host}/api/maintenances/save/supplier?maintId=${maintId}&value=${newValue}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: this.props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          cogoToast.success('Save Success', {
            position: 'top-right'
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(err))
  }

  /// /////////////////////////////////////////////////////////
  //
  //                MODAL: TOGGLE
  //
  /// /////////////////////////////////////////////////////////

  // open / close Read Modal
  toggleReadModal () {
    if (!this.state.maintenance.incomingBody) {
      const host = window.location.host
      const mailId = this.state.maintenance.mailId || this.state.maintenance.receivedmail
      if (mailId === 'NT') {
        cogoToast.warn('Self created Maintenance - No mail available', {
          position: 'top-right'
        })
        return
      }
      fetch(`https://api.${host}/mail/${mailId}`, {
        method: 'get'
      })
        .then(resp => resp.json())
        .then(data => {
          let mailBody
          const htmlRegex = new RegExp(/<(?:"[^"]*"[`"]*|'[^']*'['"]*|[^'">])+>/, 'gi')
          // const htmlRegex2 = new RegExp('<([a-z]+)[^>]*(?<!/)>', 'gi')
          // const htmlRegex3 = new RegExp('<meta .*>', 'gi')

          if (htmlRegex.test(data.body)) {
            mailBody = data.body
            this.setState({
              incomingMailIsHtml: true
            })
          } else {
            mailBody = `<pre>${data.body}</pre>`
            this.setState({
              incomingMailIsHtml: false
            })
          }
          this.setState({
            maintenance: {
              ...this.state.maintenance,
              incomingBody: mailBody,
              incomingFrom: data.from,
              incomingSubject: data.subject,
              incomingDate: data.date,
              incomingAttachments: data.attachments,
              incomingDomain: this.props.jsonData.profile.mailDomain
            },
            openReadModal: !this.state.openReadModal
          })
        })
        .catch(err => console.error(`Error - ${err}`))
    } else {
      this.setState({
        openReadModal: !this.state.openReadModal
      })
    }
    if (!this.state.readIconUrl) {
      const host = window.location.host
      fetch(`https://api.${host}/favicon?d=${this.props.jsonData.profile.mailDomain}`, {
        method: 'get'
      })
        .then(resp => resp.json())
        .then(data => {
          this.setState({
            readIconUrl: data.icons
          })
        })
    }
  }

  // open / close send preview modal
  togglePreviewModal = (recipient, customerCID) => {
    if (recipient && customerCID) {
      const HtmlBody = this.generateMail(customerCID)
      HtmlBody && this.setState({
        openPreviewModal: !this.state.openPreviewModal,
        mailBodyText: HtmlBody,
        mailPreviewHeaderText: recipient || this.state.mailPreviewHeaderText,
        mailPreviewSubjectText: `Planned Work Notification - NT-${this.state.maintenance.id}`,
        mailPreviewCustomerCid: customerCID
      })
    } else {
      this.setState({
        openPreviewModal: !this.state.openPreviewModal
      })
    }
  }

  toggleHelpModal () {
    this.setState({
      openHelpModal: !this.state.openHelpModal
    })
  }

  /// /////////////////////////////////////////////////////////
  //
  //                    OTHER ACTIONS
  //
  /// /////////////////////////////////////////////////////////

  showAttachments (id) {
    function fixBase64 (binaryData) {
      var base64str = binaryData
      var binary = atob(base64str.replace(/\s/g, ''))
      var len = binary.length
      var buffer = new ArrayBuffer(len)
      var view = new Uint8Array(buffer)

      // save unicode of binary data into 8-bit Array
      for (var i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i)
      }
      return view
    }
    if (id !== null) {
      const file = this.state.maintenance.incomingAttachments[id].data
      // const fileData = decodeURIComponent(escape(window.atob(this.state.maintenance.incomingAttachments[id].data)))
      let base64 = (file).replace(/_/g, '/')
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
            cols: resp.cols,
            rows: resp.rows
          })
        }
      })
    }
    this.setState({
      openAttachmentModal: !this.state.openAttachmentModal,
      currentAttachment: id || null
    })
  }

  handleProtectionSwitch () {
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        impact: '50ms protection switch'
      }
    })
    this.handleTextInputBlur('impact')
  }

  useImpactPlaceholder () {
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        impact: this.state.impactPlaceholder
      }
    })
  }

  handleCreateOnClick (event) {
    const {
      bearbeitetvon,
      maileingang,
      lieferant,
      mailId,
      updatedAt
    } = this.state.maintenance

    let incomingFormatted
    if (mailId === 'NT') {
      incomingFormatted = format(new Date(updatedAt), 'yyyy-MM-dd HH:mm:ss')
    } else {
      incomingFormatted = format(new Date(maileingang), 'yyyy-MM-dd HH:mm:ss')
    }
    const updatedAtFormatted = format(new Date(updatedAt), 'yyyy-MM-dd HH:mm:ss')

    const host = window.location.host
    fetch(`https://${host}/api/maintenances/save/create?bearbeitetvon=${bearbeitetvon}&lieferant=${lieferant}&mailId=${mailId}&updatedAt=${updatedAtFormatted}&maileingang=${incomingFormatted}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const newId = data.newId['LAST_INSERT_ID()']
        const newMaint = {
          ...this.state.maintenance,
          id: newId
        }
        this.setState({
          maintenance: newMaint
        })
        const newLocation = `/maintenance?id=${newId}`
        Router.push(newLocation, newLocation, { shallow: true })
        if (data.status === 200 && data.statusText === 'OK') {
          cogoToast.success('Create Success', {
            position: 'top-right'
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(err))
    // mark mail as unread as well
    const incomingMailId = this.state.maintenance.mailId || this.state.maintenance.receivedmail
    if (incomingMailId !== 'NT') {
      fetch(`https://api.${host}/inbox/delete`, {
        method: 'post',
        body: JSON.stringify({ m: incomingMailId }),
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      })
        .then(resp => resp.json())
        .then(data => {
          if (data.status === 'complete') {
            cogoToast.success('Message Removed from Inbox', {
              position: 'top-right'
            })
          } else if (data.id === 500) {
            cogoToast.warn('Error removing from Inbox', {
              position: 'top-right'
            })
          }
        })
        .catch(err => console.error(`Error - ${err}`))
    }
  }

  /// /////////////////////////////////////////////////////////
  //
  //                      RENDER
  //
  /// /////////////////////////////////////////////////////////

  render () {
    const {
      maintenance,
      openReadModal,
      openPreviewModal
    } = this.state

    let maintenanceIdDisplay
    if (maintenance.id === 'NEW') {
      maintenanceIdDisplay = maintenance.id
    } else {
      maintenanceIdDisplay = `NT-${maintenance.id}`
    }

    const keyMap = {
      TOGGLE_READ: 'alt+r',
      TOGGLE_HELP: 'shift+?'
    }

    const handlers = {
      TOGGLE_READ: this.toggleReadModal,
      TOGGLE_HELP: this.toggleHelpModal
    }

    if (this.props.session.user) {
      return (
        <HotKeys keyMap={keyMap} handlers={handlers}>
          <Layout unread={this.props.unread} session={this.props.session}>
            <Helmet>
              <title>{`Newtelco Maintenance - NT-${maintenance.id}`}</title>
            </Helmet>
            {UnreadCount()}
            <Card style={{ maxWidth: '100%' }}>
              <CardHeader>
                <ButtonToolbar style={{ justifyContent: 'space-between' }}>
                  <ButtonGroup size='md'>
                    <Button onClick={() => Router.back()} outline>
                      <FontAwesomeIcon icon={faArrowLeft} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                      Back
                    </Button>
                  </ButtonGroup>
                  <span>
                    <Badge theme='secondary' style={{ fontSize: '2rem', marginRight: '20px' }} outline>
                      {maintenanceIdDisplay}
                    </Badge>
                    <h2 style={{ display: 'inline-block', marginBottom: '0px' }}>{maintenance.name}</h2>
                  </span>
                  {this.state.width > 500
                    ? (
                      <ButtonGroup className='btn-group-2' size='md'>
                        <Button onClick={this.toggleReadModal} outline>
                          <FontAwesomeIcon icon={faEnvelopeOpenText} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                        Read
                        </Button>
                        <Button onClick={this.handleCalendarCreate} outline>
                          <FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                        Calendar
                        </Button>
                        {maintenance.id === 'NEW'
                      ? (
                        <Button className='create-btn' onClick={this.handleCreateOnClick}>
                          <FontAwesomeIcon icon={faPlusCircle} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                          Create
                        </Button>
                      ) : (
                        <Button className='send-bulk' theme='primary' onClick={this.handleSendAll}>
                          <FontAwesomeIcon icon={faMailBulk} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                          Send All
                        </Button>
                      )}
                      </ButtonGroup>
                    ) : (
                      <></>
                    )}
                </ButtonToolbar>
              </CardHeader>
              <CardBody>
                <Container fluid>
                  <Row style={{ height: '20px' }} />
                  <Row>
                    <Col sm='12' lg='6'>
                      <Row>
                        <Col>
                          <Container className='maintenance-subcontainer'>
                            <Row>
                              <Col style={{ width: '30vw' }}>
                                <FormGroup>
                                  <label htmlFor='edited-by'>Created By</label>
                                  <FormInput tabIndex='-1' readOnly id='edited-by-input' name='edited-by' type='text' value={maintenance.bearbeitetvon} onChange={this.handleCreatedByChange} />
                                </FormGroup>
                                <FormGroup>
                                  <label htmlFor='updated-by'>Last Updated By</label>
                                  <FormInput readOnly id='updated-by' name='updated-by' type='text' value={maintenance.updatedBy} onChange={this.handleUpdatedByChange} />
                                </FormGroup>
                                <FormGroup>
                                  <label htmlFor='supplier'>Timezone</label>
                                  <TimezoneSelector
                                    value={{ value: this.state.maintenance.timezone, label: this.state.maintenance.timezoneLabel }}
                                    onChange={this.handleTimezoneChange}
                                    onBlur={this.handleTimezoneBlur}
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <label htmlFor='start-datetime'>Start Date/Time</label>
                                  <Flatpickr
                                    data-enable-time
                                    options={{ time_24hr: 'true', allow_input: 'true' }}
                                    className='flatpickr end-date-time'
                                    value={maintenance.startDateTime || null}
                                    onChange={date => this.handleStartDateChange(date)}
                                    onClose={() => this.handleDateTimeBlur('start')}
                                  />
                                </FormGroup>
                              </Col>
                              <Col style={{ width: '30vw' }}>
                                <FormGroup>
                                  <label htmlFor='maileingang'>Mail Arrived</label>
                                  <FormInput tabIndex='-1' readOnly id='maileingang-input' name='maileingang' type='text' value={convertDateTime(maintenance.maileingang)} />
                                </FormGroup>
                                <FormGroup>
                                  <label htmlFor='updated-at'>Updated At</label>
                                  <FormInput tabIndex='-1' readOnly id='updated-at' name='updated-at' type='text' value={convertDateTime(maintenance.updatedAt)} onChange={this.handleUpdatedAtChange} />
                                </FormGroup>
                                <FormGroup>
                                  <label htmlFor='supplier'>Supplier</label>
                                  <Select
                                    value={{ label: this.state.maintenance.name, value: this.state.maintenance.lieferant }}
                                    onChange={this.handleSupplierChange}
                                    options={this.state.suppliers}
                                    noOptionsMessage={() => 'No Suppliers'}
                                    placeholder='Please select a Supplier'
                                    onBlur={this.handleSupplierBlur}
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <label htmlFor='end-datetime'>End Date/Time</label>
                                  <Flatpickr
                                    data-enable-time
                                    options={{ time_24hr: 'true', allow_input: 'true' }}
                                    className='flatpickr end-date-time'
                                    style={this.state.dateTimeWarning ? { border: '2px solid #dc3545', boxShadow: '0 0 10px 1px #dc3545' } : null}
                                    value={maintenance.endDateTime || null}
                                    onChange={date => this.handleEndDateChange(date)}
                                    onClose={() => this.handleDateTimeBlur('end')}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <FormGroup>
                                  <label htmlFor='their-cid'>{maintenance.name} CID</label>
                                  <Select
                                    value={this.state.selectedLieferant || undefined}
                                    onChange={this.handleSelectLieferantChange}
                                    options={this.state.lieferantcids}
                                    components={animatedComponents}
                                    isMulti
                                    noOptionsMessage={() => 'No CIDs for this Supplier'}
                                    placeholder='Please select a CID'
                                    onBlur={this.handleCIDBlur}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                          </Container>
                          <Container className='maintenance-subcontainer'>
                            <Row>
                              <Col>
                                <Row>
                                  <Col>
                                    <FormGroup>
                                      <div className='impact-title-group'>
                                        <label style={{ flexGrow: '1', margin: '10px' }} htmlFor='impact'>Impact</label>
                                        <Tooltip
                                          title='Use Protection Switch Text'
                                          position='top'
                                          theme='dark'
                                          trigger='mouseenter'
                                          delay='150'
                                          arrow
                                          animation='shift'
                                        >
                                          <Button id='protectionswitchtext' style={{ padding: '0.35em', marginRight: '10px', marginTop: '10px' }} onClick={this.handleProtectionSwitch} outline theme='secondary'>
                                            <FontAwesomeIcon width='16px' icon={faRandom} />
                                          </Button>
                                        </Tooltip>
                                        <Tooltip
                                          title='Use Time Difference Text'
                                          position='top'
                                          theme='dark'
                                          trigger='mouseenter'
                                          delay='150'
                                          arrow
                                          animation='shift'
                                        >
                                          <Button id='impactplaceholdertext' style={{ padding: '0.35em', marginTop: '10px' }} onClick={this.useImpactPlaceholder} outline theme='secondary'>
                                            <FontAwesomeIcon width='16px' icon={faHistory} />
                                          </Button>
                                        </Tooltip>
                                      </div>
                                      <FormInput onBlur={() => this.handleTextInputBlur('impact')} id='impact' name='impact' type='text' onChange={this.handleImpactChange} placeholder={this.state.impactPlaceholder} value={maintenance.impact || ''} />
                                    </FormGroup>
                                  </Col>
                                  <Col>
                                    <FormGroup>
                                      <label htmlFor='location'>Location</label>
                                      <FormInput onBlur={() => this.handleTextInputBlur('location')} id='location' name='location' type='text' onChange={this.handleLocationChange} value={maintenance.location || ''} />
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <FormGroup>
                                  <label htmlFor='reason'>Reason</label>
                                  <FormTextarea id='reason' name='reason' onBlur={() => this.handleTextInputBlur('reason')} onChange={this.handleReasonChange} type='text' value={maintenance.reason || ''} />
                                </FormGroup>
                              </Col>
                            </Row>
                          </Container>
                          <Container style={{ paddingTop: '20px' }} className='maintenance-subcontainer'>
                            <Row>
                              <Col>
                                <FormGroup className='form-group-toggle'>
                                  <Badge theme='light' outline>
                                    <label>
                                      <Toggle
                                        checked={maintenance.cancelled === 'false' ? false : !!maintenance.cancelled}
                                        onChange={(event) => this.handleToggleChange('cancelled', event)}
                                      />
                                      <div style={{ marginTop: '10px' }}>Cancelled</div>
                                    </label>
                                  </Badge>
                                  <Badge theme='light' outline>
                                    <label>
                                      <Toggle
                                        icons={{
                                          checked: <FontAwesomeIcon icon={faFirstAid} width='1em' style={{ color: '#fff' }} />,
                                          unchecked: null
                                        }}
                                        checked={maintenance.emergency === 'false' ? false : !!maintenance.emergency}
                                        onChange={(event) => this.handleToggleChange('emergency', event)}
                                      />
                                      <div style={{ marginTop: '10px' }}>Emergency</div>
                                    </label>
                                  </Badge>
                                  <Badge theme='secondary' outline>
                                    <label>
                                      <Toggle
                                        checked={maintenance.done === 'false' ? false : !!maintenance.done}
                                        onChange={(event) => this.handleToggleChange('done', event)}
                                      />
                                      <div style={{ marginTop: '10px' }}>Done</div>
                                    </label>
                                  </Badge>
                                </FormGroup>
                              </Col>
                            </Row>
                          </Container>
                          <Container className='maintenance-subcontainer'>
                            <Row>
                              <Col>
                                <FormGroup>
                                  <label htmlFor='notes'>Notes</label>
                                  <TinyEditor
                                    initialValue={this.state.notesText}
                                    apiKey='ttv2x1is9joc0fi7v6f6rzi0u98w2mpehx53mnc1277omr7s'
                                    onBlur={this.handleNotesBlur}
                                    init={{
                                      height: 300,
                                      menubar: false,
                                      statusbar: false,
                                      plugins: [
                                        'advlist autolink lists link image print preview anchor',
                                        'searchreplace code',
                                        'insertdatetime table paste code help wordcount'
                                      ],
                                      toolbar:
                                        `undo redo | formatselect | bold italic backcolor | 
                                        alignleft aligncenter alignright alignjustify | 
                                        bullist numlist outdent indent | removeformat | help`
                                    }}
                                    onChange={this.handleNotesChange}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                          </Container>
                        </Col>
                      </Row>
                    </Col>
                    <Col sm='12' lg='6'>
                      <Row>
                        <Col>
                          <Container style={{ padding: '20px' }} className='maintenance-subcontainer'>
                            <Row>
                              <Col style={{ width: '100%', height: '600px' }}>
                                <div
                                  className='ag-theme-material'
                                  style={{
                                    height: '100%',
                                    width: '100%'
                                  }}
                                >
                                  <AgGridReact
                                    gridOptions={this.state.gridOptions}
                                    rowData={this.state.kundencids}
                                    onGridReady={params => this.gridApi = params.api}
                                    pagination
                                    // batchUpdateWaitMillis={50}
                                    deltaRowDataMode
                                    getRowNodeId={(data) => {
                                      return data.kundenCID
                                    }}
                                    onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                                  />
                                </div>
                              </Col>
                            </Row>
                          </Container>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Container>
              </CardBody>
              <CardFooter className='card-footer'>
                {this.state.width < 500
                  ? (
                    <ButtonGroup className='btn-group-2' size='md'>
                      <Button onClick={this.toggleReadModal} outline>
                        <FontAwesomeIcon icon={faEnvelopeOpenText} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                      Read
                      </Button>
                      <Button onClick={this.handleCalendarCreate} outline>
                        <FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                      Calendar
                      </Button>
                      <Button disabled={maintenance.id !== 'NEW'} className='create-btn' onClick={this.handleCreateOnClick}>
                        <FontAwesomeIcon icon={faPlusCircle} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                      Create
                      </Button>
                    </ButtonGroup>
                  ) : (
                    <span />
                  )}
              </CardFooter>
              {typeof window !== 'undefined'
                ? (
                  <Rnd
                    default={{
                      x: 900,
                      y: 25,
                      width: 800,
                      height: 600
                    }}
                    style={{
                      visibility: openReadModal ? 'visible' : 'hidden',
                      opacity: openReadModal ? 1 : 0,
                      background: '#fff',
                      overflow: 'hidden',
                      borderRadius: '15px',
                      height: 'auto',
                      zIndex: '101',
                      boxShadow: '0px 0px 20px 1px var(--dark)'
                    }}
                    minWidth={500}
                    minHeight={590}
                    bounds='window'
                    dragHandleClassName='modal-incoming-header-text'
                    onResize={(e, direction, ref, delta, position) => {
                      this.setState({
                        readHeight: ref.style.height,
                        readWidth: ref.style.width
                      })
                    }}
                  >
                    <div style={{ borderRadius: '15px', position: 'relative' }}>
                      <ModalHeader style={{
                        background: 'var(--secondary)',
                        borderRadius: '0px'
                      }}
                      >
                        <img className='mail-icon' src={this.state.readIconUrl} />
                        <div className='modal-incoming-header-text'>
                          <h5 className='modal-incoming-from' style={{ marginBottom: '0px' }}>
                            {this.state.maintenance.incomingFrom}
                          </h5>
                          <small className='modal-incoming-subject'>
                            {this.state.maintenance.incomingSubject}
                          </small>
                          <br />
                          <small className='modal-incoming-datetime'>
                            {this.state.maintenance.incomingDate}
                          </small>
                          {Array.isArray(this.state.maintenance.incomingAttachments) && this.state.maintenance.incomingAttachments.length !== 0
                            ? this.state.maintenance.incomingAttachments.map((attachment, index) => {
                              return (
                                <Button pill size='sm' onClick={() => this.showAttachments(attachment.id)} theme='primary' style={{ marginLeft: '10px' }} key={index}>
                                  {attachment.name}
                                </Button>
                              )
                            })
                            : (
                              null
                            )}
                        </div>
                        <ButtonGroup style={{ display: 'flex', flexDirection: 'column' }}>
                          <Button outline className='close-read-modal-btn' theme='light' style={{ borderRadius: '5px 5px 0 0', padding: '0.7em 0.9em' }} onClick={this.toggleReadModal}>
                            <FontAwesomeIcon
                              className='close-read-modal-icon' width='1.5em' style={{ color: 'var(--light)', fontSize: '12px' }}
                              icon={faTimesCircle}
                            />
                          </Button>
                          {/* <Button theme='light' style={{ borderRadius: '0', padding: '0.7em 0.9em' }} onClick={this.showAttachments}>
                            <FontAwesomeIcon width='1.2em' style={{ fontSize: '12px' }} className='translate-icon' icon={faFileExcel} />
                          </Button> */}
                          <Button theme='light' style={{ borderRadius: '0 0 5px 5px', padding: '0.7em 0.9em' }} onClick={this.handleTranslate.bind(this)}>
                            <FontAwesomeIcon width='1.8em' style={{ fontSize: '12px' }} className='translate-icon' icon={faLanguage} />
                          </Button>
                        </ButtonGroup>
                      </ModalHeader>
                      <ModalBody className='mail-body' dangerouslySetInnerHTML={{ __html: this.state.translated ? this.state.translatedBody : this.state.maintenance.incomingBody }} />
                    </div>
                  </Rnd>
                ) : (
                  <></>
                )}
              {typeof window !== 'undefined'
                ? (
                  <Rnd
                    default={{
                      x: 1000,
                      y: 125,
                      width: 500,
                      height: 200
                    }}
                    style={{
                      visibility: this.state.openAttachmentModal ? 'visible' : 'hidden',
                      opacity: this.state.openAttachmentModal ? 1 : 0,
                      background: '#fff',
                      overflow: 'hidden',
                      borderRadius: '15px',
                      height: 'auto',
                      zIndex: '101',
                      boxShadow: '0px 0px 20px 1px var(--dark)'
                    }}
                    minWidth={500}
                    minHeight={400}
                    bounds='window'
                    dragHandleClassName='modal-attachment-header-text'
                  >
                    <div style={{ borderRadius: '15px', position: 'relative' }}>
                      <ModalHeader
                        className='modal-attachment-header-text'
                        style={{
                          background: 'var(--secondary)',
                          borderRadius: '0px',
                          color: '#fff',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        Attachments
                        <Button outline className='close-attachment-modal-btn' theme='light' style={{ borderRadius: '5px', padding: '0.7em 0.9em' }} onClick={() => this.showAttachments(null)}>
                          <FontAwesomeIcon
                            className='close-attachment-modal-icon' width='1.5em' style={{ color: 'var(--light)', fontSize: '12px' }}
                            icon={faTimesCircle}
                          />
                        </Button>
                      </ModalHeader>
                      <ModalBody>
                        {this.state.rows && this.state.cols
                          ? (
                            <OutTable data={this.state.rows} columns={this.state.cols} tableClassName='ExcelTable2007' tableHeaderRowClass='heading' />
                          ) : (
                            null
                          )}
                      </ModalBody>
                      {/* {Array.isArray(this.state.incomingAttachments) && this.state.incomingAttachments.length !== 0
                        ? this.state.incomingAttachments.map((attachment, index) => {
                          return <Badge key={index} theme='primary'>{attachment.name}</Badge>
                        })
                        : (
                          null
                        )} */}
                    </div>
                  </Rnd>
                ) : (
                  <></>
                )}
              <Modal backdropClassName='modal-backdrop' animation backdrop size='lg' open={openPreviewModal} toggle={this.togglePreviewModal}>
                <ModalHeader>
                  <div className='modal-preview-text-wrapper'>
                    <div className='modal-preview-to-text'>
                      <b style={{ fontWeight: '900' }}>To:</b> {this.state.mailPreviewHeaderText}
                    </div>
                    <div className='modal-preview-to-text'>
                      <b style={{ fontWeight: '900' }}>Cc:</b> service@newtelco.de
                    </div>
                    <div className='modal-preview-Subject-text'>
                      <b style={{ fontWeight: '900' }}>Subject: </b>{this.state.maintenance.emergency ? `[EMERGENCY] ${this.state.mailPreviewSubjectText}` : `${this.state.mailPreviewSubjectText}`}
                    </div>
                  </div>
                  <Button id='send-mail-btn' style={{ padding: '0.9em 1.1em' }} onClick={() => this.sendMail(this.state.mailPreviewHeaderText, this.state.mailPreviewCustomerCid, this.state.mailPreviewSubjectText, this.state.mailBodyText, true)}>
                    <FontAwesomeIcon width='1.5em' style={{ fontSize: '12px' }} className='modal-preview-send-icon' icon={faPaperPlane} />
                  </Button>
                </ModalHeader>
                <ModalBody>
                  <TinyEditor
                    initialValue={this.state.mailBodyText}
                    apiKey='ttv2x1is9joc0fi7v6f6rzi0u98w2mpehx53mnc1277omr7s'
                    init={{
                      height: 500,
                      menubar: false,
                      statusbar: false,
                      plugins: [
                        'advlist autolink lists link image print preview anchor',
                        'searchreplace code',
                        'insertdatetime table paste code help wordcount'
                      ],
                      toolbar:
                        `undo redo | formatselect | bold italic backcolor | 
                        alignleft aligncenter alignright alignjustify | 
                        bullist numlist outdent indent | removeformat | help`
                    }}
                    onChange={this.handleEditorChange}
                  />

                </ModalBody>
              </Modal>
            </Card>
            <style jsx>{`
              :global(.ExcelTable2007) {
                border: 1px solid #ddd;
                border-collapse: collapse;
              }
              :global(.ExcelTable2007 td, th) {
                white-space: nowrap;
                border: 1px solid #ddd;
                padding: 20px;
              }
              :global(.ExcelTable2007 th) {
                background-color: #eee;
                position: sticky;
                top: -1px;
                z-index: 2;
              }
              :global(.ExcelTable2007 th:first-of-type) {
                left: 0;
                z-index: 3;
              }
              :global(.ExcelTable2007 > tbody > tr > td:first-of-type) {
                background-color: #eee;
                position: sticky;
                left: -1px;
                z-index: 1;
              }
              :global(.react-draggable) {
                transition: visibility 200ms linear, opacity 200ms linear;
              }
              :global(div[class$="-singleValue"]) {
                font-size: 0.95rem;
                color: #495057;
              }
              :global(.form-group > label) {
                margin: 10px !important;
              }
              :global(.form-group) {
                margin-bottom: 0px !important;
              }
              :global(.container) {
                padding: 15px;
              }
              .mail-icon {
                min-width: 96px;
                height: 96px;
                border: 2px solid var(--light);
                background: #fff;
                padding: 10px;
                border-radius: 5px;
                margin-right: 10px;
              }
              :global(.MuiFormControl-root) {
                width: 100%;
              }
              :global(.MuiInputBase-root) {
                color: #495057;
              }
              :global(.MuiInputBase-root:hover) {
                border-color: #8fa4b8 !important;
              }
              :global(.MuiOutlinedInput-input) {
                padding: 10.5px 14px;
                transition: box-shadow 250ms cubic-bezier(.27,.01,.38,1.06),border 250ms cubic-bezier(.27,.01,.38,1.06);
              }
              :global(.Mui-focused) {
                border: none !important;
              }
              :global(.MuiInputBase-root:focus-within) {
                color: #495057;
                background-color: #fff;
                border: 1px solid #007bff !important;
                border-radius: 0.325rem;
                box-shadow: 0 0.313rem 0.719rem rgba(0,123,255,.1), 0 0.156rem 0.125rem rgba(0,0,0,.06);
              }
              :global(.MuiIconButton-root:hover) {
                background-color: none !important;
              }
              :global(.fa-language) {
                font-size: 20px;
              }
              :global(.modal-lg) {
                max-width: 1000px !important;
              }
              :global(.tox-toolbar__group) {
                border-right: none !important;
              }
              :global(.tox-tinymce) {
                border-radius: 5px !important;
              }
              :global(.tox-toolbar) {
                background: none !important;
              }
              :global(.maintenance-subcontainer) {
                border: 1px solid var(--light);
                border-radius: 0.325rem;
                margin: 10px 0;
              }
              :global(.form-group-toggle > label) {
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              :global(.form-group-toggle) {
                display: flex;
                justify-content: space-around;
                align-items: center;
              }
              .toggle-done {
                border: 1px solid var(--secondary);
                border-radius: 0.325rem;
                padding: 20px;
              }
              :global(.rdw-option-active) {
                box-shadow: none;
                border: 2px solid var(--primary);
                border-radius: 5px;
              }
              :global(.editor-toolbar) {
                transition: all 150ms ease-in-out;
              }
              :global(.editor-dropdown) {
                position: relative;
                font-family: inherit;
                background-color: transparent;
                padding: 2px 2px 2px 0;
                font-size: 10px;
                border-radius: 0;
                border: none;
                border-bottom: 1px solid rgba(0,0,0, 0.12);
                transition: all 150ms ease-in-out;
              }
              :global(.editor-wrapper) {
                border: 1px solid var(--light);
                border-radius: 5px;
              }
              :global(.editor-wrapper) {
                padding: 5px;
              }
              :global(button.btn-primary) {
                max-height: 45px;
              }
              input {
                display: block;
              }
              label {
                margin: 15px;
              }
              :global(.modal-content) {
                max-height: calc(${this.state.windowInnerHeight}px - 50px);
              }
              :global(.mail-body) {
                font-family: Poppins, Helvetica;
                height: ${this.state.readHeight ? `calc(${this.state.readHeight} - 127px)` : '460px'};
                background: #fff;
                overflow-y: ${this.state.incomingMailIsHtml ? 'scroll' : 'hidden'};
              }
              :global(.mail-body > :first-child) {
                position: absolute;
                top: 0;
                left: 0;
                height: 100vh;
                width: 100%;
                padding: 40px;
                overflow-y: ${this.state.incomingMailIsHtml ? 'hidden' : 'scroll'};
              }
              :global(.modal-backdrop) {
                background-color: #000;
                transition: all 150ms ease-in-out;
              }
              :global(.modal-backdrop.show) {
                opacity: 0.5;
              }
              .modal-incoming-header-text {
                flex-grow: 1;
              }
              :global(.modal-title) {
                display: flex;
                justify-content: space-between;
                width: 100%;
                align-items: center;
              }
              :global(.modal-content) {
                max-height: calc(${this.state.windowInnerHeight}px - 50px);
              }
              :global(.flexible-modal) {
                position: absolute;
                z-index: 1;
                border: 1px solid #ccc;
                background: white;
              }
              :global(.flexible-modal-mask) {
                position: fixed;
                height: 100%;
                background: rgba(55, 55, 55, 0.6);
                top:0;
                left:0;
                right:0;
                bottom:0;
              }
              :global(.flexible-modal-resizer) {
                position:absolute;
                right:0;
                bottom:0;
                cursor:se-resize;
                margin:5px;
                border-bottom: solid 2px #333;
                border-right: solid 2px #333;
              }
              :global(.flexible-modal-drag-area) {
                background: #007bff;
                height: 50px;
                position:absolute;
                right:0;
                top:0;
                cursor:move;
              }
              .modal-incoming-header-text:hover {
                cursor: move;
              }
              .modal-incoming-header-text > * {
                color: #fff;
              }
              :global(.modal-attachment-header-text:hover) {
                cursor: move;
              }
              :global(.modal-attachment-header-text > h5) {
                color: #fff;
              }
              :global(.close-attachment-modal-btn:hover > .close-attachment-modal-icon) {
                color: var(--dark) !important;
              }
              :global(.close-read-modal-btn:hover > .close-read-modal-icon) {
                color: var(--dark) !important;
              }
              :global(.flatpickr) {
                height: auto;
                width: 100%;
                padding: .5rem 1rem;
                font-size: .95rem;
                line-height: 1.5;
                color: #495057;
                background-color: #fff;
                border: 1px solid #becad6;
                font-weight: 300;
                will-change: border-color,box-shadow;
                border-radius: .375rem;
                box-shadow: none;
                transition: box-shadow 250ms cubic-bezier(.27,.01,.38,1.06),border 250ms cubic-bezier(.27,.01,.38,1.06);
              }
              :global(.flatpickr-months) {
                background: #007bff !important;
              }
              :global(.flatpickr-month) {
                background: #007bff !important;
              }
              :global(.flatpickr-monthDropdown-months) {
                background: #007bff !important;
              }
              :global(.flatpickr-weekdays) {
                background: #007bff !important;
              }
              :global(.flatpickr-weekday) {
                background: #007bff !important;
              }
              :global(.flatpickr-day.selected) {
                background: #007bff !important;
                border-color: #007bff !important;
              }
              :global(.create-btn) {
                box-shadow: ${this.state.maintenance.id === 'NEW' ? '0 0 0 100vmax rgba(0,0,0,.8)' : 'none'};
                pointer-events: ${this.state.maintenance.id === 'NEW' ? 'auto' : 'none'};
                z-index: 100;
              }
              :global(*) {
                pointer-events: ${this.state.maintenance.id === 'NEW' ? 'none' : 'auto'};
              }
              :global(.create-btn:before) {
                
              }
              .impact-title-group {
                display: flex;
              }
              @media only screen and (max-width: 500px) {
                :global(div.btn-toolbar > .btn-group-md) {
                  margin-right: 20px;
                }
                :global(div.btn-toolbar) {
                  flex-wrap: no-wrap;
                }
                :global(div.btn-toolbar > span) {
                  display: flex;
                  justify-content: center;
                  flex-wrap: wrap;
                  flex-direction: column;
                  flex-grow: 1;
                }
                :global(div.btn-toolbar > span > h2) {
                  margin: 0 auto;
                  padding-right: 20px;
                }
                :global(.card-body) {
                  padding: 0px;
                }
              }
            `}
            </style>
          </Layout>
        </HotKeys>
      )
    } else {
      return <RequireLogin />
    }
  }
}
