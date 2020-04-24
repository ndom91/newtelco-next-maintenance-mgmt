import React from 'react'
import Layout from '../components/layout'
import fetch from 'isomorphic-unfetch'
import Footer from '../components/cardFooter'
import Attachment from '../components/attachment'
import RequireLogin from '../components/require-login'
import { NextAuth } from 'next-auth/client'
import Toggle from 'react-toggle'
import './style/maintenance.css'
import cogoToast from 'cogo-toast'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import makeAnimated from 'react-select/animated'
import Router from 'next/router'
import { Helmet } from 'react-helmet'
import { Editor as TinyEditor } from '@tinymce/tinymce-react'
import { format, isValid, formatDistance, parseISO, compareAsc } from 'date-fns'
import moment from 'moment-timezone'
import { Rnd } from 'react-rnd'
import { CSSTransition } from 'react-transition-group'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/material_blue.css'
import TimezoneSelector from '../components/timezone'
import { getUnique, convertDateTime } from '../components/maintenance/helper'
import { HotKeys } from 'react-hotkeys'
import { OutTable, ExcelRenderer } from 'react-excel-renderer'
import ProtectedIcon from '../components/ag-grid/protected'
import SentIcon from '../components/ag-grid/sent'
import StartDateTime from '../components/ag-grid/startdatetime'
import EndDateTime from '../components/ag-grid/enddatetime'
import { AgGridReact } from 'ag-grid-react'
import PDF from 'react-pdf-js-infinite'
import root from 'react-shadow'
import dynamic from 'next/dynamic'
import Popover from 'react-popover'
import { saveAs } from 'file-saver'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'

import 'react-tippy/dist/tippy.css'
import { Tooltip } from 'react-tippy'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlusCircle,
  faArrowLeft,
  faEnvelopeOpenText,
  faLanguage,
  faFirstAid,
  faPaperPlane,
  faTimesCircle,
  faRandom,
  faSearch,
  faHistory,
  faMailBulk,
  faCheck,
  faCalendarCheck,
  faLandmark,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons'
import {
  faCalendarAlt,
  faClock
} from '@fortawesome/free-regular-svg-icons'
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
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Modal,
  ModalHeader,
  ModalBody,
  Progress
} from 'shards-react'

const animatedComponents = makeAnimated()

const Changelog = dynamic(
  () => import('../components/timeline'),
  { ssr: false }
)

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
        night: query.night,
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
    let night
    if (typeof window !== 'undefined') {
      night = window.localStorage.getItem('theme')
    }
    this.state = {
      width: 0,
      night: night === 'dark',
      maintenance: {
        incomingAttachments: [],
        incomingBody: this.props.jsonData.profile.body,
        timezone: 'Europe/Amsterdam',
        timezoneLabel: '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
        bearbeitetvon: '',
        maileingang: '',
        updatedAt: '',
        updatedBy: this.props.jsonData.profile.updatedBy,
        name: '',
        impact: '',
        location: '',
        reason: '',
        mailId: 'NT',
        calendarId: this.props.jsonData.profile.calendarId,
        maintNote: ''
      },
      attachmentModalSize: {
        width: 673,
        height: 400
      },
      frozenState: {
        recipient: '',
        cid: ''
      },
      attachmentHTMLContent: '',
      currentAttachmentName: '',
      dateTimeWarning: false,
      openAttachmentModal: false,
      openProtectionSwitchToggle: false,
      openUseImpactPlaceholderToggle: false,
      openReadModal: false,
      openPreviewModal: false,
      openHelpModal: false,
      openRescheduleModal: false,
      openConfirmDeleteModal: false,
      openConfirmFreezeModal: false,
      openMaintenanceChangelog: false,
      openDownloadPopup: false,
      attachmentPopoverBody: null,
      reschedule: {
        startDateTime: null,
        endDateTime: null,
        impact: '',
        reason: ''
      },
      rescheduleData: [],
      rescheduleToDelete: {
        id: null,
        rcounter: null
      },
      translateTooltipOpen: false,
      translated: false,
      translatedBody: '',
      notesText: props.jsonData.profile.notes || '',
      mailBodyText: '',
      mailPreviewHeaderText: '',
      mailPreviewSubjectTextPreview: '',
      lieferantcids: {},
      kundencids: [],
      windowInnerHeight: 0,
      unreadCount: '',
      rescheduleGridOptions: {
        defaultColDef: {
          resizable: true,
          sortable: true,
          filter: true,
          editable: true,
          selectable: true
        },
        columnDefs: [
          {
            headerName: 'ID',
            field: 'rcounter',
            width: 80,
            editable: false,
            hide: true,
            sort: { direction: 'asc', priority: 0 }
          }, {
            headerName: 'Sent',
            field: 'sent',
            cellRenderer: 'sentBtn',
            width: 80,
            sortable: false,
            filter: false,
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }, {
            headerName: 'Start',
            field: 'startDateTime',
            width: 170,
            cellRenderer: 'startdateTime'
          }, {
            headerName: 'End',
            field: 'endDateTime',
            width: 170,
            cellRenderer: 'enddateTime'
          }, {
            headerName: 'Impact',
            field: 'impact',
            width: 140,
            tooltipField: 'impact'
          }, {
            headerName: 'Reason',
            field: 'reason',
            width: 160,
            tooltipField: 'reason'
          }
        ],
        rowSelection: 'single',
        paginationPageSize: 10,
        frameworkComponents: {
          startdateTime: StartDateTime,
          enddateTime: EndDateTime,
          sentBtn: this.sentBtn
        }
      },
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
        frameworkComponents: {
          sendMailBtn: this.sendMailBtns,
          protectedIcon: ProtectedIcon,
          sentIcon: SentIcon
        },
        paginationPageSize: 10,
        rowClass: 'row-class',
        rowClassRules: {
          'row-frozen': function (params) {
            const frozen = params.data.frozen
            if (frozen === 1 || frozen === true) {
              return true
            }
            return false
          }
        }
      }
    }
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
    this.handleMaintNoteChange = this.handleMaintNoteChange.bind(this)
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
    this.toggleRescheduleModal = this.toggleRescheduleModal.bind(this)
    this.handleRescheduleGridReady = this.handleRescheduleGridReady.bind(this)
    this.handleRescheduleEndDateTimeChange = this.handleRescheduleEndDateTimeChange.bind(this)
    this.handleRescheduleImpactChange = this.handleRescheduleImpactChange.bind(this)
    this.handleRescheduleStartDateTimeChange = this.handleRescheduleStartDateTimeChange.bind(this)
    this.handleRescheduleSave = this.handleRescheduleSave.bind(this)
    this.handleRescheduleCellEdit = this.handleRescheduleCellEdit.bind(this)
    this.toggleRescheduleSentBtn = this.toggleRescheduleSentBtn.bind(this)
    this.handleRescheduleTimezoneChange = this.handleRescheduleTimezoneChange.bind(this)
    this.toggleConfirmDeleteRescheduleModal = this.toggleConfirmDeleteRescheduleModal.bind(this)
    this.handleDeleteReschedule = this.handleDeleteReschedule.bind(this)
    this.handleToggleChange = this.handleToggleChange.bind(this)
    this.handleRescheduleReasonChange = this.handleRescheduleReasonChange.bind(this)
    this.mailSubjectText = this.mailSubjectText.bind(this)
    this.moveCalendarEntry = this.moveCalendarEntry.bind(this)
    this.toggleHistoryView = this.toggleHistoryView.bind(this)
    this.toggleDownloadPopover = this.toggleDownloadPopover.bind(this)
    this.toggleConfirmFreezeModal = this.toggleConfirmFreezeModal.bind(this)
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

    const night = window.localStorage.getItem('theme')
    this.setState({
      night: night === 'dark'
    })

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
        width: window.outerWidth
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
        timezoneLabel: '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
        startDateTime: moment.tz(this.props.jsonData.profile.startDateTime, 'GMT').tz('Etc/GMT-1').format('YYYY-MM-DD HH:mm:ss'),
        endDateTime: moment.tz(this.props.jsonData.profile.endDateTime, 'GMT').tz('Etc/GMT-1').format('YYYY-MM-DD HH:mm:ss')
      }

      this.setState({
        maintenance: newMaintenance,
        width: window.outerWidth
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

    if (this.props.jsonData.profile.id !== 'NEW') {
      fetch(`https://${host}/api/reschedule?id=${this.props.jsonData.profile.id}`, {
        method: 'get'
      })
        .then(resp => resp.json())
        .then(data => {
          this.setState({
            rescheduleData: data.reschedules
          })
        })
        .catch(err => console.error(`Error Loading Reschedules - ${err}`))
    }
  }

  handleRescheduleGridReady = (params) => {
    this.rescheduleGridApi = params.api
    params.api.setRowData(this.state.rescheduleData)
  }

  /// /////////////////////////////////////////////////////////
  //
  //                AG-GRID TABLE
  //
  /// /////////////////////////////////////////////////////////

  handleGridReady = params => {
    this.gridApi = params.gridApi
    this.gridColumnApi = params.gridColumnApi
  }

  refreshCells () {
    this.gridApi.refreshCells()
  }

  sentBtn = (row) => {
    return (
      <ButtonGroup>
        <Button onClick={() => this.toggleRescheduleSentBtn(row.data.rcounter)} style={{ padding: '0.75em' }} size='sm' outline>
          <Tooltip
            title='Toggle Sent Status'
            position='top'
            trigger='mouseenter'
            delay='250'
            distance='25'
            interactiveBorder='15'
            arrow
            size='small'
            theme='transparent'
          >
            <FontAwesomeIcon width='1.325em' icon={row.data.sent === 1 ? faCheck : faTimesCircle} />
          </Tooltip>
        </Button>
        <Button onClick={() => this.moveCalendarEntry(row.data.startDateTime, row.data.endDateTime, row.data.rcounter)} style={{ padding: '0.7em' }} size='sm' outline>
          <Tooltip
            title='Move Calendar Entry'
            position='top'
            trigger='mouseenter'
            delay='250'
            distance='25'
            interactiveBorder='15'
            arrow
            size='small'
            theme='transparent'
          >
            <FontAwesomeIcon width='1.325em' icon={faCalendarCheck} />
          </Tooltip>
        </Button>
      </ButtonGroup>
    )
  }

  sendMailBtns = (row) => {
    return (
      <ButtonGroup>
        <Button onClick={() => this.prepareDirectSend(row.data.maintenanceRecipient, row.data.kundenCID, row.data.frozen, row.data.name)} style={{ padding: '0.7em' }} size='sm' outline>
          <FontAwesomeIcon width='1.325em' icon={faPaperPlane} />
        </Button>
        <Button onClick={() => this.togglePreviewModal(row.data.maintenanceRecipient, row.data.kundenCID, row.data.protected)} style={{ padding: '0.7em' }} size='sm' outline>
          <FontAwesomeIcon width='1.325em' icon={faSearch} />
        </Button>
      </ButtonGroup>
    )
  }

  onGridReady = (params) => {
    this.gridApi = params.gridApi
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
    fetch(`https://${host}/api/customercids/${lieferantCidId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const {
          done
        } = this.state.maintenance
        let currentSentStatus = '0'
        if (done === 1 || done === true || done === '1') {
          currentSentStatus = '1'
        }
        const kundencids = data.kundenCIDsResult
        kundencids.forEach(cid => {
          cid.sent = currentSentStatus
          cid.frozen = false
        })
        const newKundenCids = this.state.kundencids
        kundencids.forEach(cid => {
          newKundenCids.push(cid)
        })
        const uniqueKundenCids = getUnique(newKundenCids, 'kundenCID')
        this.setState({
          kundencids: uniqueKundenCids
        })
        uniqueKundenCids.forEach(cid => {
          this.checkFreezeStatus(cid)
        })
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  async checkFreezeStatus (cid) {
    const host = window.location.host
    const startDate = this.state.maintenance.startDateTime
    const endDate = this.state.maintenance.endDateTime

    await fetch(`https://${host}/api/maintenances/freeze?companyid=${cid.kunde}&startDate=${startDate}&endDate=${endDate}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.freezeQuery.length !== 0) {
          const freezeEntry = data.freezeQuery[0]
          const uniqueKundenCids = this.state.kundencids
          const uniqueCids = uniqueKundenCids
          const frozenCids = uniqueCids.findIndex(el => el.kunde === freezeEntry.companyId)
          cogoToast.error(`${uniqueKundenCids[frozenCids].name} has an active network freeze at that time`, {
            position: 'top-right',
            hideAfter: 5,
            onClick: () => Router.push('/settings?tab=freeze')
          })
          uniqueKundenCids[frozenCids].frozen = true
          this.setState({
            kundencids: uniqueKundenCids
          })
          if (this.gridApi) {
            this.gridApi.refreshCells()
          }
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  /// /////////////////////////////////////////////////////////
  //                    SEND MAILS
  /// /////////////////////////////////////////////////////////

  // prepare mail from direct-send button
  prepareDirectSend = (recipient, customerCID, frozen, companyName) => {
    if (frozen) {
      this.setState({
        frozenCompany: companyName || '',
        frozenState: {
          recipient: recipient,
          cid: customerCID
        }
      })
      this.toggleConfirmFreezeModal()
      return
    }
    const HtmlBody = this.generateMail(customerCID)
    const subject = `Planned Work Notification - NT-${this.state.maintenance.id}`
    this.sendMail(recipient, customerCID, subject, HtmlBody, false)
  }

  // generate Mail contents
  generateMail = (customerCID, protection) => {
    const {
      id,
      startDateTime,
      endDateTime,
      impact,
      reason,
      location,
      timezone,
      maintNote
    } = this.state.maintenance

    const {
      impactPlaceholder
    } = this.state

    if (!id || !startDateTime || !endDateTime) {
      cogoToast.warn('Missing required fields', {
        position: 'top-right'
      })
      return
    }

    const timezoneValue = timezone || 'Europe/Dublin'
    const rawStart = moment.tz(startDateTime, timezoneValue)
    const rawEnd = moment.tz(endDateTime, timezoneValue)
    const utcStart1 = rawStart.tz('GMT').format('YYYY-MM-DD HH:mm:ss')
    const utcEnd1 = rawEnd.tz('GMT').format('YYYY-MM-DD HH:mm:ss')
    const utcStart = this.props.jsonData.profile.startDateTime || utcStart1
    const utcEnd = this.props.jsonData.profile.endDateTime || utcEnd1

    let maintenanceIntro = 'We would like to inform you about planned work on the following CID(s):'
    const rescheduleText = ''
    const tzSuffixRAW = 'UTC / GMT+0:00'

    const cancelled = this.state.maintenance.cancelled
    if (cancelled === 'true' || cancelled === true || cancelled === '1' || cancelled === 1) {
      maintenanceIntro = `We would like to inform you that these planned works (<b>NT-${id}</b>) have been <b>cancelled</b> with the following CID(s):`
    }

    if (this.state.rescheduleData.length !== 0) {
      const latest = this.state.rescheduleData.length - 1
      const newStart = moment(this.state.rescheduleData[latest].startDateTime).format('YYYY-MM-DD HH:mm:ss')
      const newEnd = moment(this.state.rescheduleData[latest].endDateTime).format('YYYY-MM-DD HH:mm:ss')
      const newImpact = this.state.rescheduleData[latest].impact
      const newReason = this.state.rescheduleData[latest].reason.toLowerCase()
      const rcounter = this.state.rescheduleData[latest].rcounter
      if (cancelled === 'true' || cancelled === true || cancelled === '1' || cancelled === 1 && this.state.rescheduleData[latest]) {
        maintenanceIntro = `We would like to inform you that these rescheduled planned works (<b>NT-${id}-${rcounter}</b>) have been <b>cancelled</b>.<br><br>We are sorry for any inconveniences this may have caused.<br><footer>​<style>.sig{font-family:Century Gothic, sans-serif;font-size:9pt;color:#636266!important;}b.i{color:#4ca702;}.gray{color:#636266 !important;}a{text-decoration:none;color:#636266 !important;}</style><div class="sig"><div>Best regards <b class="i">|</b> Mit freundlichen Grüßen</div><br><div><b>Newtelco Maintenance Team</b></div><br><div>NewTelco GmbH <b class="i">|</b> Moenchhofsstr. 24 <b class="i">|</b> 60326 Frankfurt a.M. <b class="i">|</b> DE <br>www.newtelco.com <b class="i">|</b> 24/7 NOC  49 69 75 00 27 30 ​​<b class="i">|</b> <a style="color:#" href="mailto:service@newtelco.de">service@newtelco.de</a><br><br><div><img alt="sig" src="https://home.newtelco.de/sig.png" height="29" width="516"></div></div>​</footer><hr />`
      }
      maintenanceIntro += `We regret to inform you that the planned works have been <b>rescheduled</b> on the following CID(s):\n\n<br><br><b>${customerCID}</b><br><br>The maintenance has been rescheduled due to ${newReason}.<br><br>The new details are as follows:<br><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>NT-${id}-${rcounter}</b></td></tr><tr><td>New Start date and time:</td><td><b>${newStart} (${tzSuffixRAW})</b></td></tr><tr><td>New Finish date and time:</td><td><b>${newEnd} (${tzSuffixRAW})</b></td></tr><tr><td>New Impact:</td><td><b>${newImpact}</b></td></tr></table><br>Thank you very much for your patience and cooperation.<br>`

      if (this.state.rescheduleData.length > 1) {
        maintenanceIntro += '<br><hr><br><b>Previous Reschedules:</b><br>'
        const oldReschedules = this.state.rescheduleData
        oldReschedules.pop()
        let index = oldReschedules.length
        const reversedReschedules = {
          next: function () {
            index--
            return {
              done: index < 0,
              value: oldReschedules[index]
            }
          }
        }
        reversedReschedules[Symbol.iterator] = function () {
          return this
        }
        for (const i of reversedReschedules) {
          const newStart = moment(i.startDateTime).format('YYYY-MM-DD HH:mm:ss')
          const newEnd = moment(i.endDateTime).format('YYYY-MM-DD HH:mm:ss')
          const newImpact = i.impact
          const newReason = i.reason && i.reason.toLowerCase()
          const rcounter = i.rcounter
          maintenanceIntro += `<br>This maintenance had been rescheduled due to ${newReason}.<br><br>The previous details were as follows:<br><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>NT-${id}-${rcounter}</b></td></tr><tr><td>Previous Start date and time:</td><td><b>${newStart} (${tzSuffixRAW})</b></td></tr><tr><td>Previous Finish date and time:</td><td><b>${newEnd} (${tzSuffixRAW})</b></td></tr><tr><td>Previous Impact:</td><td><b>${newImpact}</b></td></tr></table>`
        }
      }
      maintenanceIntro += '<br><hr><i><b>Original Planned Works:</b></i><br><br>Dear Colleagues,<br><br>We would like to inform you about planned work on the following CID(s):\n'
    }

    let body = `<body style="color:#666666;">${rescheduleText} Dear Colleagues,​​<p><span>${maintenanceIntro}<br><br> <b>${customerCID}</b> <br><br>The maintenance work is with the following details:</span></p><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>NT-${id}</b></td></tr><tr><td>Start date and time:</td><td><b>${utcStart} (${tzSuffixRAW})</b></td></tr><tr><td>Finish date and time:</td><td><b>${utcEnd} (${tzSuffixRAW})</b></td></tr>`
    if (impact || protection || impactPlaceholder) {
      console.log(impact, protection, impactPlaceholder)
      if (protection === 1 || protection === '1' || protection === true || protection === 'true') {
        body = body + '<tr><td>Impact:</td><td>50ms Protection Switch</td></tr>'
      } else if (protection === 0 || protection === '0' || protection === false || protection === 'false') {
        const impactText = impact || impactPlaceholder
        body = body + '<tr><td>Impact:</td><td>' + impactText + '</td></tr>'
      } else {
        const impactText = impact || impactPlaceholder
        body = body + '<tr><td>Impact:</td><td>' + impactText + '</td></tr>'
      }
    }

    if (location) {
      body = body + '<tr><td>Location:</td><td>' + location + '</td></tr>'
    }

    if (reason) {
      if (reason.includes('%20')) {
        body = body + '<tr><td>Reason:</td><td>' + decodeURIComponent(reason) + '</td></tr>'
      } else {
        body = body + '<tr><td>Reason:</td><td>' + reason + '</td></tr>'
      }
    }

    let maintNoteBody = ''
    if (maintNote) {
      if (maintNote.includes('%20')) {
        maintNoteBody = '<p>' + decodeURIComponent(maintNote) + '</p>'
      } else {
        maintNoteBody = '<p>' + maintNote + '</p>'
      }
    }

    body = body + `</table>${maintNoteBody}<p>We sincerely regret any inconvenience that may be caused by this and hope for further mutually advantageous cooperation.</p><p>If you have any questions feel free to contact us at maintenance@newtelco.de.</p></div>​​</body>​​<footer>​<style>.sig{font-family:Century Gothic, sans-serif;font-size:9pt;color:#636266!important;}b.i{color:#4ca702;}.gray{color:#636266 !important;}a{text-decoration:none;color:#636266 !important;}</style><div class="sig"><div>Best regards <b class="i">|</b> Mit freundlichen Grüßen</div><br><div><b>Newtelco Maintenance Team</b></div><br><div>NewTelco GmbH <b class="i">|</b> Moenchhofsstr. 24 <b class="i">|</b> 60326 Frankfurt a.M. <b class="i">|</b> DE <br>www.newtelco.com <b class="i">|</b> 24/7 NOC  49 69 75 00 27 30 ​​<b class="i">|</b> <a style="color:#" href="mailto:service@newtelco.de">service@newtelco.de</a><br><br><div><img alt="sig" src="https://home.newtelco.de/sig.png" height="29" width="516"></div></div>​</footer>`

    return body
  }

  // send out the created mail
  sendMail = (recipient, customerCid, subj, htmlBody, isFromPreview, isFromSendAll) => {
    const activeRowIndex = this.state.kundencids.findIndex(el => el.kundenCID === customerCid)
    const kundenCidRow = this.state.kundencids[activeRowIndex]
    // if (kundenCidRow.sent != 0) { // eslint-disable
    //   return
    // }
    if (kundenCidRow.frozen) {
      this.setState({
        frozenCompany: kundenCidRow.name || '',
        frozenState: {
          recipient: recipient,
          cid: customerCid
        }
      })
      this.toggleConfirmFreezeModal()
      // cogoToast.error(`${kundenCidRow.name} has an active network freeze - no maintenance allowed!`, {
      //   position: 'top-right'
      // })
      return
    }
    const host = window.location.host
    const body = htmlBody || this.state.mailBodyText
    let subject = subj || this.state.mailPreviewSubjectText
    const to = recipient || this.state.mailPreviewHeaderText

    const emergency = this.state.maintenance.emergency
    if (emergency === 'true' || emergency === true || emergency === '1' || emergency === 1) {
      subject = `[EMERGENCY] ${subject}`
    }
    const cancelled = this.state.maintenance.cancelled
    if (cancelled === 'true' || cancelled === true || cancelled === '1' || cancelled === 1) {
      subject = `[CANCELLED] ${subject}`
    }
    if (this.state.rescheduleData.length !== 0) {
      subject = `[RESCHEDULED] ${subject}-${this.state.rescheduleData[this.state.rescheduleData.length - 1].rcounter}`
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
          if (this.state.maintenance.cancelled === true && this.state.maintenance.done === true) {
            kundenCidRow.sent = '2'
          } else {
            kundenCidRow.sent = '1'
          }
          const updatedKundenCids = [
            ...this.state.kundencids,
            kundenCidRow
          ]
          const deduplicatedKundenCids = getUnique(updatedKundenCids, 'kundenCID')
          this.setState({
            kundencids: deduplicatedKundenCids
          })
          if (!isFromSendAll) {
            cogoToast.success('Mail Sent', {
              position: 'top-right'
            })
          }
          if (isFromPreview) {
            this.setState({
              openPreviewModal: !this.state.openPreviewModal
            })
          }
          if (this.gridApi) {
            this.gridApi.refreshCells()
          }
          const maintId = this.state.maintenance.id
          const user = this.props.session.user.email
          const action = 'sent to'
          const field = kundenCidRow.name
          fetch(`https://${host}/api/history?mid=${maintId}&user=${user}&field=${field}&action=${action}`, {
            method: 'get'
          })
            .then(resp => resp.json())
            .then(data => {
            })
            .catch(err => console.error(`Error updating Audit Log - ${err}`))
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

  handleSendAll = () => {
    const rowCount = this.gridApi.getDisplayedRowCount() - 1
    this.gridApi.forEachNode((node, index) => {
      setTimeout(() => {
        const data = node.data
        const HtmlBody = this.generateMail(data.kundenCID, data.protected)
        const subject = `Planned Work Notification - NT-${this.state.maintenance.id}`
        this.sendMail(data.maintenanceRecipient, data.kundenCID, subject, HtmlBody, false, true)
        cogoToast.success(`Mail Sent - ${data.name}`, {
          position: 'top-right'
        })
        if (index === rowCount) {
          cogoToast.success('All Mail Send Complete', {
            position: 'top-right'
          })
        }
      }, 500 * (index + 1))
    })
  }

  sentProgress = () => {
    if (this.state.kundencids.length !== 0) {
      const total = this.state.kundencids.length
      let progressSent = 0
      this.state.kundencids.forEach(cid => {
        if (cid.sent === '1' || cid.sent === '2') {
          progressSent = progressSent + 1
        }
      })
      const result = (progressSent / total) * 100
      return result
    }
  }

  moveCalendarEntry = (startDateTime, endDateTime, rcounter) => {
    const calId = this.state.maintenance.calendarId
    const company = this.state.maintenance.name
    const maintId = this.state.maintenance.id

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

    const host = window.location.host
    if (calId) {
      fetch(`https://api.${host}/calendar/reschedule`, {
        method: 'post',
        body: JSON.stringify({
          company: company,
          cids: cids,
          supplierCID: derenCid,
          maintId: maintId,
          calId: calId,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
          rcounter: rcounter
        }),
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      })
        .then(resp => resp.json())
        .then(data => {
          if (data.status === 200 && data.statusText === 'OK') {
            cogoToast.success('Calendar Entry Rescheduled', {
              position: 'top-right'
            })
          }
        })
        .catch(err => console.error(err))
    } else {
      cogoToast.error('Error - No Calendar Entry ID Saved', {
        position: 'top-right'
      })
    }
  }

  handleCalendarCreate = () => {
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
          // const htmlLink = data.event.data.htmlLink
          // const eventUrl = new URL(htmlLink)
          // const calId = eventUrl.searchParams.get('eid')
          const calId = data.event.data.id

          this.setState({
            maintenance: {
              ...this.state.maintenance,
              calendarId: calId
            }
          })

          fetch(`https://${host}/api/maintenances/save/calendar?mid=${this.state.maintenance.id}&cid=${calId}&updatedby=${this.props.session.user.email}`, {
            method: 'get'
          })
            .then(resp => resp.json())
            .then(data => {
              // console.log(data)
            })
            .catch(err => console.error(err))
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
  handleMailPreviewChange = (content, delta, source, editor) => {
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

  handleEditorChange = (data) => {
    this.setState({
      mailBodyText: data.level.content
    })
  }

  handleNotesChange = (data) => {
    const newMaint = {
      ...this.state.maintenance,
      notes: data.level.content
    }

    this.setState({
      maintenance: newMaint
    })
  }

  handleCreatedByChange (data) {
    // dummy
  }

  saveDateTime = (maintId, element, newValue) => {
    let newISOTime = moment.tz(newValue, this.state.maintenance.timezone)
    if (maintId === 'NEW') {
      cogoToast.warn('No CID assigned - Cannot Save', {
        position: 'top-right'
      })
      return
    }
    newISOTime = newISOTime.utc().format('YYYY-MM-DD HH:mm:ss')
    const activeUserEmail = this.props.session.user.email
    const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
    const host = window.location.host
    fetch(`https://${host}/api/maintenances/save/dateTime?maintId=${maintId}&element=${element}&value=${newISOTime}&updatedby=${activeUser}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: this.props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          console.log(`DateTime Save Success\n${newISOTime}`)
        } else {
          console.warn(`DateTime Save Failed\n${element}\n${newValue}\n${newISOTime}`)
        }
      })
      .catch(err => console.error(err))
  }

  handleStartDateChange (date) {
    console.log(date)
    const startDate = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')

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
    console.log(date)
    const endDate = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')

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

  handleToggleChange = (element, event) => {
    const host = window.location.host
    const maintId = this.state.maintenance.id
    const activeUserEmail = this.props.session.user.email
    const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
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

      if (this.state.maintenance.receivedmail) {
        const mailId = this.state.maintenance.receivedmail
        if (!mailId.startsWith('NT-')) {
          fetch(`https://api.${host}/inbox/markcomplete`, {
            method: 'post',
            body: JSON.stringify({ m: mailId }),
            mode: 'cors',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            }
          })
            .then(resp => resp.json())
            .then(data => {
              if (data.id === 500) {
                cogoToast.warn('Error moving to Completed Label', {
                  position: 'top-right'
                })
              }
            })
            .catch(err => console.error(`Error - ${err}`))
        }
      }

      fetch(`https://${host}/api/maintenances/save/impactedcids?cids=${impactedCIDs}&maintId=${this.state.maintenance.id}&updatedby=${activeUser}`, {
        method: 'get',
        headers: {
          'Access-Control-Allow-Origin': '*',
          _csrf: this.props.session.csrfToken
        }
      })
        .then(resp => resp.json())
        .then(data => {
          if (!data.status === 200) {
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
    fetch(`https://${host}/api/maintenances/save/toggle?maintId=${maintId}&element=${element}&value=${newValue}&updatedby=${activeUser}`, {
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

  handleReasonChange = (event) => {
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        reason: encodeURIComponent(event.target.value)
      }
    })
  }

  handleMaintNoteChange = (event) => {
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        maintNote: encodeURIComponent(event.target.value)
      }
    })
  }

  handleLocationChange = (event) => {
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        location: event.target.value
      }
    })
  }

  handleImpactChange = (event) => {
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        impact: event.target.value
      }
    })
  }

  handleTimezoneChange = (selection) => {
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

  handleUpdatedByChange = () => {
    const value = this.state.maintenance.updatedBy
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        updatedBy: value
      }
    })
  }

  handleUpdatedAtChange = () => {
    const value = this.state.maintenance.updatedAt
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        updatedAt: value
      }
    })
  }

  handleSupplierChange = (selectedOption) => {
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

  handleDateTimeBlur = (element) => {
    cogoToast.success('Save Success', {
      position: 'top-right'
    })
  }

  handleCIDBlur = (ev) => {
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
      const activeUserEmail = this.props.session.user.email
      const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
      fetch(`https://${host}/api/maintenances/save/lieferant?maintId=${maintId}&cid=${idParameter}&updatedby=${activeUser}`, {
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
            this.setState({
              maintenance: {
                ...this.state.maintenance,
                updatedBy: activeUser
              }
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

  handleTimezoneBlur = (ev) => {
    const incomingTimezone = this.state.maintenance.timezone || 'Europe/Amsterdam'
    const incomingTimezoneLabel = encodeURIComponent(this.state.maintenance.timezoneLabel || '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna')
    const activeUserEmail = this.props.session.user.email
    const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
    const host = window.location.host
    fetch(`https://${host}/api/maintenances/save/timezone?maintId=${this.state.maintenance.id}&timezone=${incomingTimezone}&timezoneLabel=${incomingTimezoneLabel}&updatedby=${activeUser}`, {
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
          this.setState({
            maintenance: {
              ...this.state.maintenance,
              updatedBy: activeUser
            }
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(err))
  }

  handleTextInputBlur = (element) => {
    const host = window.location.host
    const newValue = eval(`this.state.maintenance.${element}`)
    const originalValue = eval(`this.props.jsonData.profile.${element}`)
    const maintId = this.state.maintenance.id
    const activeUserEmail = this.props.session.user.email
    const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))

    if (newValue === originalValue) {
      return
    }

    if (maintId === 'NEW') {
      cogoToast.warn('No CID assigned - Cannot Save', {
        position: 'top-right'
      })
      return
    }
    fetch(`https://${host}/api/maintenances/save/textinput?maintId=${maintId}&element=${element}&value=${newValue}&updatedby=${activeUser}`, {
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
          this.setState({
            maintenance: {
              ...this.state.maintenance,
              updatedBy: activeUser
            }
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(err))
  }

  handleNotesBlur = (event) => {
    const host = window.location.host
    const newValue = this.state.maintenance.notes
    const originalValue = this.props.jsonData.profile.notes
    const activeUserEmail = this.props.session.user.email
    const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
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
    fetch(`https://${host}/api/maintenances/save/notes?maintId=${maintId}&value=${newValue}&updatedby=${activeUser}`, {
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
          this.setState({
            maintenance: {
              ...this.state.maintenance,
              updatedBy: activeUser
            }
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(err))
  }

  handleSupplierBlur = () => {
    const host = window.location.host
    const newValue = this.state.maintenance.lieferant
    const maintId = this.state.maintenance.id
    const activeUserEmail = this.props.session.user.email
    const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
    if (maintId === 'NEW') {
      cogoToast.warn('No CID assigned - Cannot Save', {
        position: 'top-right'
      })
      return
    }
    fetch(`https://${host}/api/maintenances/save/supplier?maintId=${maintId}&value=${newValue}&updatedby=${activeUser}`, {
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
          this.setState({
            maintenance: {
              ...this.state.maintenance,
              updatedBy: activeUser
            }
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
  toggleReadModal = () => {
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
  togglePreviewModal = (recipient, customerCID, protection) => {
    if (recipient && customerCID) {
      const HtmlBody = this.generateMail(customerCID, protection)
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
    this.mailSubjectText()
  }

  toggleHelpModal = () => {
    this.setState({
      openHelpModal: !this.state.openHelpModal
    })
  }

  toggleRescheduleModal = () => {
    this.setState({
      openRescheduleModal: !this.state.openRescheduleModal
    })
  }

  toggleHistoryView = () => {
    this.setState({
      openMaintenanceChangelog: !this.state.openMaintenanceChangelog
    })
  }

  toggleConfirmFreezeModal = () => {
    this.setState({
      openConfirmFreezeModal: !this.state.openConfirmFreezeModal
    })
  }

  /// /////////////////////////////////////////////////////////
  //
  //                    RESCHEDULE
  //
  /// /////////////////////////////////////////////////////////

  handleRescheduleTimezoneChange = (selection) => {
    const timezoneLabel = selection.label // 'Europe/Amsterdam'
    const timezoneValue = selection.value // '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna'

    this.setState({
      reschedule: {
        ...this.state.reschedule,
        timezone: timezoneValue,
        timezoneLabel: timezoneLabel
      }
    })
  }

  handleRescheduleStartDateTimeChange = (date) => {
    const startDate = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')

    this.setState({
      reschedule: {
        ...this.state.reschedule,
        startDateTime: startDate
      }
    })
  }

  handleRescheduleEndDateTimeChange = (date) => {
    const endDate = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')

    this.setState({
      reschedule: {
        ...this.state.reschedule,
        endDateTime: endDate
      }
    })
  }

  handleRescheduleImpactChange = (event) => {
    this.setState({
      reschedule: {
        ...this.state.reschedule,
        impact: event.target.value
      }
    })
  }

  handleRescheduleReasonChange = (reasonSelection) => {
    this.setState({
      reschedule: {
        ...this.state.reschedule,
        reason: reasonSelection
      }
    })
  }

  handleRescheduleSave = () => {
    const newImpact = this.state.reschedule.impact
    const newReason = this.state.reschedule.reason.label
    const timezone = this.state.reschedule.timezone
    const newStartDateTime = moment.tz(this.state.reschedule.startDateTime, timezone).utc().format('YYYY-MM-DD HH:mm:ss')
    const newEndDateTime = moment.tz(this.state.reschedule.endDateTime, timezone).utc().format('YYYY-MM-DD HH:mm:ss')

    const host = window.location.host
    fetch(`https://${host}/api/reschedule/save?mid=${this.state.maintenance.id}&impact=${encodeURIComponent(newImpact)}&sdt=${encodeURIComponent(newStartDateTime)}&edt=${encodeURIComponent(newEndDateTime)}&rcounter=${this.state.rescheduleData.length + 1}&user=${encodeURIComponent(this.props.session.user.email)}&reason=${encodeURIComponent(newReason)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.insertRescheduleQuery.affectedRows === 1) {
          this.setState({
            openRescheduleModal: !this.state.openRescheduleModal
          })
          cogoToast.success('Reschedule Save Complete', {
            position: 'top-right'
          })
          const newRescheduleData = this.state.rescheduleData
          newRescheduleData.push({ rcounter: this.state.rescheduleData.length + 1, startDateTime: moment(newStartDateTime).format(), endDateTime: moment(newEndDateTime).format(), impact: newImpact, reason: newReason, sent: 0 })
          this.setState({
            rescheduleData: newRescheduleData,
            reschedule: {
              impact: '',
              reason: '',
              startDateTime: null,
              endDateTime: null
            }
          })
          this.rescheduleGridApi.setRowData(newRescheduleData)
        }
      })
      .catch(err => console.error(`Error Saving Reschedule - ${err}`))
    fetch(`https://${host}/api/reschedule/increment?id=${this.state.maintenance.id}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        // console.log(data.rescheduleInc)
      })
      .catch(err => console.error(`Error Incrementing Reschedule - ${err}`))
  }

  handleRescheduleCellEdit = (params) => {
    const rcounter = params.data.rcounter
    const newStartDateTime = moment(params.data.startDateTime).format('YYYY.MM.DD HH:mm:ss')
    const newEndDateTime = moment(params.data.endDateTime).format('YYYY.MM.DD HH:mm:ss')
    const newImpact = params.data.impact

    const host = window.location.host
    fetch(`https://${host}/api/reschedule/edit?mid=${this.state.maintenance.id}&impact=${encodeURIComponent(newImpact)}&sdt=${encodeURIComponent(newStartDateTime)}&edt=${encodeURIComponent(newEndDateTime)}&rcounter=${rcounter}&user=${encodeURIComponent(this.props.session.user.email)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.editRescheduleQuery.affectedRows === 1) {
          cogoToast.success('Reschedule Edit - Success', {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(`Reschedule Edit Error - ${err}`))
  }

  toggleRescheduleSentBtn = (rcounter) => {
    const newRescheduleData = this.state.rescheduleData
    const reschedIndex = newRescheduleData.findIndex(el => el.rcounter === rcounter)
    const currentSentStatus = newRescheduleData[reschedIndex].sent
    let newSentStatus
    if (currentSentStatus === 1) {
      newRescheduleData[reschedIndex].sent = 0
      newSentStatus = 0
    } else if (currentSentStatus === 0) {
      newRescheduleData[reschedIndex].sent = 1
      newSentStatus = 1
    }
    this.setState({
      rescheduleData: newRescheduleData
    })
    const host = window.location.host
    fetch(`https://${host}/api/reschedule/sent?mid=${this.state.maintenance.id}&rcounter=${rcounter}&sent=${newSentStatus}&user=${encodeURIComponent(this.props.session.user.email)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.editRescheduleQuery.affectedRows === 1) {
          cogoToast.success('Reschedule Sent Change - Success', {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(`Reschedule Sent Change Error - ${err}`))
    this.rescheduleGridApi.refreshCells()
  }

  toggleConfirmDeleteRescheduleModal = () => {
    if (this.rescheduleGridApi) {
      const row = this.rescheduleGridApi.getSelectedRows()
      const rescheduleId = `NT-${this.state.maintenance.id}-${row[0].rcounter}`
      this.setState({
        rescheduleToDelete: {
          id: rescheduleId,
          rcounter: row[0].rcounter
        },
        openConfirmDeleteModal: !this.state.openConfirmDeleteModal
      })
    }
  }

  toggleDownloadPopover = () => {
    this.setState({
      openedDownloadPopupId: null
    })
  }

  handleDeleteReschedule = () => {
    const host = window.location.host
    fetch(`https://${host}/api/reschedule/delete?mid=${this.state.maintenance.id}&rcounter=${this.state.rescheduleToDelete.rcounter}&user=${encodeURIComponent(this.props.session.user.email)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.deleteRescheduleQuery.affectedRows === 1) {
          cogoToast.success('Reschedule Delete Success', {
            position: 'top-right'
          })
          const newRescheduleData = this.state.rescheduleData.filter(resched => resched.rcounter !== this.state.rescheduleToDelete.rcounter)
          this.rescheduleGridApi.setRowData(newRescheduleData)
          this.setState({
            openConfirmDeleteModal: !this.state.openConfirmDeleteModal,
            rescheduleData: newRescheduleData
          })
        } else {
          cogoToast.warn('Reschedule Delete Error', {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(`Reschedule Delete Error - ${err}`))
  }

  /// /////////////////////////////////////////////////////////
  //
  //                    OTHER ACTIONS
  //
  /// /////////////////////////////////////////////////////////

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
        const excelIndex = this.state.maintenance.incomingAttachments.findIndex(el => el.id === id)
        const file = this.state.maintenance.incomingAttachments[excelIndex]
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
        const pdfIndex = this.state.maintenance.incomingAttachments.findIndex(el => el.id === id)
        const file = this.state.maintenance.incomingAttachments[pdfIndex]
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
        const fileIndex = this.state.maintenance.incomingAttachments.findIndex(el => el.id === id)
        const file = this.state.maintenance.incomingAttachments[fileIndex]
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
        const fileIndex = this.state.maintenance.incomingAttachments.findIndex(el => el.id === id)
        const file = this.state.maintenance.incomingAttachments[fileIndex]
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

  handleProtectionSwitch = () => {
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        impact: '50ms protection switch'
      }
    })
    this.handleTextInputBlur('impact')
  }

  useImpactPlaceholder = () => {
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        impact: this.state.impactPlaceholder
      }
    })
  }

  handleCreateOnClick = (event) => {
    const {
      bearbeitetvon,
      maileingang,
      lieferant,
      mailId,
      updatedAt,
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

  handleSearchSelect (selection) {
    console.log('selection', selection)
    const cleanId = selection.id.replace(/[0-9]+/g, '')
    const newLocation = `/maintenance?id=${cleanId}`
    Router.push(newLocation)
  }

  mailSubjectText = () => {
    let text = this.state.rescheduleData.length !== 0 ? ' [RESCHEDULED]' : ''
    text += this.state.maintenance.emergency ? ' [EMERGENCY]' : ''
    text += this.state.maintenance.cancelled ? ' [CANCELLED]' : ''
    text += ' Planned Work Notification - NT-' + this.state.maintenance.id
    if (this.state.rescheduleData.length !== 0) {
      text += this.state.rescheduleData.length !== 0 && '-' + this.state.rescheduleData[this.state.rescheduleData.length - 1].rcounter
    }
    this.setState({
      mailPreviewSubjectTextPreview: text
    })
  }

  /// /////////////////////////////////////////////////////////
  //
  //                      RENDER
  //
  /// /////////////////////////////////////////////////////////

  render () {
    const {
      maintenance,
      dateTimeWarning,
      suppliers,
      lieferantcids,
      openReadModal,
      selectedLieferant,
      impactPlaceholder,
      openPreviewModal,
      notesText,
      incomingAttachments,
      night
    } = this.state

    let maintenanceIdDisplay
    if (maintenance.id === 'NEW') {
      maintenanceIdDisplay = maintenance.id
    } else {
      maintenanceIdDisplay = `NT-${maintenance.id}`
    }

    const keyMap = {
      TOGGLE_READ: 'alt+r',
      TOGGLE_HELP: 'shift+?',
      DELETE_RESCHEDULE: 'alt+l'
    }

    const handlers = {
      TOGGLE_READ: this.toggleReadModal,
      TOGGLE_HELP: this.toggleHelpModal,
      DELETE_RESCHEDULE: this.toggleConfirmDeleteRescheduleModal
    }

    let HALF_WIDTH = 500
    if (typeof window !== 'undefined') {
      HALF_WIDTH = this.state.width !== 0 ? this.state.width / 2 : 500
    }

    if (this.props.session.user) {
      return (
        <HotKeys keyMap={keyMap} handlers={handlers}>
          <Layout night={this.state.night.toString()} handleSearchSelection={this.handleSearchSelect} unread={this.props.unread} session={this.props.session}>
            <Helmet>
              <title>{`Newtelco Maintenance - NT-${maintenance.id}`}</title>
            </Helmet>
            <Card className='top-card-wrapper' style={{ maxWidth: '100%' }}>
              <CardHeader>
                <ButtonToolbar style={{ justifyContent: 'space-between' }}>
                  <ButtonGroup size='md'>
                    <Button onClick={() => Router.back()}>
                      <FontAwesomeIcon icon={faArrowLeft} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                        Back
                    </Button>
                    <Button onClick={this.toggleReadModal} outline>
                      <Tooltip
                        title='Open Incoming Mail'
                        position='bottom'
                        trigger='mouseenter'
                        delay='250'
                        distance='25'
                        interactiveBorder='15'
                        arrow
                        size='small'
                        theme='transparent'
                      >
                        <FontAwesomeIcon icon={faEnvelopeOpenText} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                        Read
                      </Tooltip>
                    </Button>
                  </ButtonGroup>
                  <span className='maint-header-text-wrapper'>
                    <Badge theme='secondary' style={{ fontSize: '2rem', marginRight: '20px', maxWidth: '140px' }} outline>
                      {maintenanceIdDisplay}
                    </Badge>
                    <h2 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'inline-block', marginBottom: '0px' }}>{maintenance.name}</h2>
                  </span>
                  {this.state.width > 500
                    ? (
                      <ButtonGroup className='btn-group-2' size='md'>
                        <Button outline onClick={this.toggleRescheduleModal}>
                          <Tooltip
                            title='Create New Reschedule'
                            position='bottom'
                            trigger='mouseenter'
                            delay='250'
                            distance='25'
                            interactiveBorder='15'
                            arrow
                            size='small'
                            theme='transparent'
                          >
                            <FontAwesomeIcon icon={faClock} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                            Reschedule
                          </Tooltip>
                        </Button>
                        <Button onClick={this.handleCalendarCreate} outline>
                          <Tooltip
                            title='Create Calendar Entry'
                            position='bottom'
                            trigger='mouseenter'
                            delay='250'
                            distance='25'
                            interactiveBorder='15'
                            arrow
                            size='small'
                            theme='transparent'
                          >
                            <FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                            Calendar
                          </Tooltip>
                        </Button>
                        {maintenance.id === 'NEW'
                          ? (
                            <Button className='create-btn' onClick={this.handleCreateOnClick}>
                              <Tooltip
                                title='Create New Maintenance'
                                position='bottom'
                                trigger='mouseenter'
                                delay='250'
                                distance='25'
                                interactiveBorder='15'
                                arrow
                                size='small'
                                theme='transparent'
                              >
                                <FontAwesomeIcon icon={faPlusCircle} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                                Create
                              </Tooltip>
                            </Button>
                          ) : (
                            <Button className='send-bulk' theme='primary' onClick={this.handleSendAll}>
                              <Tooltip
                                title='Send All Notifications'
                                position='bottom'
                                trigger='mouseenter'
                                delay='250'
                                distance='25'
                                interactiveBorder='15'
                                arrow
                                size='small'
                                theme='transparent'
                              >
                                <FontAwesomeIcon icon={faMailBulk} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                                Send All
                              </Tooltip>
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
                                  <label htmlFor='supplier'>Timezone</label>
                                  <TimezoneSelector
                                    className='maint-select'
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
                                  <label htmlFor='supplier'>Supplier</label>
                                  <Select
                                    className='maint-select'
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
                                    className='maint-select'
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
                                <Row className='impact-row'>
                                  <Col>
                                    <FormGroup>
                                      <div className='impact-title-group'>
                                        <label style={{ flexGrow: '1', margin: '10px' }} htmlFor='impact'>Impact</label>
                                        <Tooltip
                                          title='Use Protection Switch Text'
                                          position='top'
                                          theme='transparent'
                                          size='small'
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
                                          theme='transparent'
                                          size='small'
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
                                  <FormTextarea id='reason' name='reason' onBlur={() => this.handleTextInputBlur('reason')} onChange={this.handleReasonChange} type='text' value={maintenance.reason && decodeURIComponent(maintenance.reason)} />
                                </FormGroup>
                                <FormGroup>
                                  <span
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'flex-start',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <label htmlFor='maintNote'>Note</label>
                                    <Tooltip
                                      title='This note will be included in the mail'
                                      position='top'
                                      trigger='mouseenter'
                                      delay='250'
                                      interactiveBorder='15'
                                      arrow
                                      size='small'
                                      theme='transparent'
                                    >
                                      <FontAwesomeIcon width='16px' icon={faQuestionCircle} />
                                    </Tooltip>
                                  </span>
                                  <FormTextarea id='maintNote' name='maintNote' onBlur={() => this.handleTextInputBlur('maintNote')} onChange={this.handleMaintNoteChange} type='text' value={maintenance.maintNote && decodeURIComponent(maintenance.maintNote)} />
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
                                      <div>Cancelled</div>
                                      <Toggle
                                        checked={maintenance.cancelled === 'false' ? false : !!maintenance.cancelled}
                                        onChange={(event) => this.handleToggleChange('cancelled', event)}
                                      />
                                    </label>
                                  </Badge>
                                  <Badge theme='light' outline>
                                    <label>
                                      <div>Emergency</div>
                                      <Toggle
                                        icons={{
                                          checked: <FontAwesomeIcon icon={faFirstAid} width='1em' style={{ color: 'var(--white)' }} />,
                                          unchecked: null
                                        }}
                                        checked={maintenance.emergency === 'false' ? false : !!maintenance.emergency}
                                        onChange={(event) => this.handleToggleChange('emergency', event)}
                                      />
                                    </label>
                                  </Badge>
                                  <Badge theme='secondary' outline>
                                    <label>
                                      <div>Done</div>
                                      <Toggle
                                        checked={maintenance.done === 'false' ? false : !!maintenance.done}
                                        onChange={(event) => this.handleToggleChange('done', event)}
                                      />
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
                                          bullist numlist outdent indent | removeformat | help`,
                                      content_style: 'html { color: #828282 }'
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
                    <Col sm='12' lg='6' className='flip-container'>
                      {this.state.openMaintenanceChangelog
                        ? (
                          <CSSTransition
                            timeout={500}
                            classNames='flip-transition'
                            in={this.state.openMaintenanceChangelog}
                          >
                            <Row>
                              <Col>
                                <Container style={{ padding: '20px' }} className='maintenance-subcontainer'>
                                  <Row>
                                    <Col>
                                      <span style={{ color: 'var(--font-color)', fontWeight: '300 !important', fontSize: '1.5rem' }}>Maintenance History</span>
                                    </Col>
                                    <Col style={{ flexGrow: '0' }}>
                                      <Button style={{ float: 'right' }} onClick={this.toggleHistoryView} outline>
                                        <Tooltip
                                          title='View Customer CIDs'
                                          position='top'
                                          trigger='mouseenter'
                                          delay='250'
                                          distance='20'
                                          interactiveBorder='15'
                                          arrow
                                          size='small'
                                          theme='transparent'
                                        >
                                          <FontAwesomeIcon icon={faLandmark} width='1em' style={{ color: 'secondary' }} />
                                        </Tooltip>
                                      </Button>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col className='changelog-wrapper'>
                                      <Changelog maintid={this.state.maintenance.id} />
                                    </Col>
                                  </Row>
                                </Container>
                              </Col>
                            </Row>
                          </CSSTransition>
                        ) : (
                          <CSSTransition
                            timeout={500}
                            classNames='flip-transition'
                            in={this.state.openMaintenanceChangelog}
                          >
                            <Row>
                              <Col>
                                <Container style={{ padding: '20px' }} className='maintenance-subcontainer'>
                                  <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Col>
                                      <span style={{ color: 'var(--font-color)', fontWeight: '300 !important', fontSize: '1.5rem' }}>Customer CIDs</span>
                                    </Col>
                                    <Col style={{ flexGrow: '0' }}>
                                      <Button style={{ float: 'right' }} onClick={this.toggleHistoryView} outline>
                                        <Tooltip
                                          title='View Maintenance Changelog'
                                          position='top'
                                          trigger='mouseenter'
                                          delay='250'
                                          distance='20'
                                          interactiveBorder='15'
                                          arrow
                                          size='small'
                                          theme='transparent'
                                        >
                                          <FontAwesomeIcon icon={faLandmark} width='1em' style={{ color: 'secondary' }} />
                                        </Tooltip>
                                      </Button>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col>
                                      {this.state.kundencids.length !== 0
                                        ? (
                                          <Progress theme='primary' value={this.sentProgress()} />
                                        ) : (
                                          null
                                        )}
                                    </Col>
                                  </Row>
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
                                {this.state.rescheduleData.length !== 0
                                  ? (
                                    <Container style={{ padding: '20px' }} className='maintenance-subcontainer'>
                                      <Row>
                                        <Col>
                                          <span style={{ color: 'var(--font-color)', fontWeight: '300 !important', fontSize: '1.5rem' }}>Reschedule</span>
                                        </Col>
                                      </Row>
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
                                              gridOptions={this.state.rescheduleGridOptions}
                                              rowData={this.state.rescheduleData}
                                              onGridReady={this.handleRescheduleGridReady}
                                              pagination
                                              onCellEditingStopped={this.handleRescheduleCellEdit}
                                              animateRows
                                              deltaRowDataMode
                                              getRowNodeId={(data) => {
                                                return data.rcounter
                                              }}
                                              stopEditingWhenGridLosesFocus
                                            />
                                          </div>
                                        </Col>
                                      </Row>
                                    </Container>
                                  ) : (
                                    null
                                  )}
                              </Col>
                            </Row>
                          </CSSTransition>
                        )}
                    </Col>
                  </Row>
                </Container>
              </CardBody>
              {this.state.width < 500
                ? (
                  <CardFooter className='card-footer'>
                    <ButtonGroup className='btn-group-2' size='md'>
                      <Button outline onClick={this.toggleRescheduleModal}>
                        <FontAwesomeIcon icon={faClock} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                        Reschedule
                      </Button>
                      <Button onClick={this.handleCalendarCreate} outline>
                        <FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                          Calendar
                      </Button>
                      {maintenance.id === 'NEW'
                        ? (
                          <Button disabled={maintenance.id !== 'NEW'} className='create-btn' onClick={this.handleCreateOnClick}>
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
                  </CardFooter>
                ) : (
                  <Footer />
                )}
              {typeof window !== 'undefined'
                ? (
                  <Rnd
                    default={{
                      x: window.outerWidth / 2,
                      y: 25,
                      width: (window.outerWidth / 2) * 0.8,
                      height: 610
                    }}
                    style={{
                      visibility: openReadModal ? 'visible' : 'hidden',
                      opacity: openReadModal ? 1 : 0,
                      background: 'var(--white)',
                      overflow: 'hidden',
                      borderRadius: '15px',
                      height: 'auto',
                      zIndex: '101',
                      boxShadow: '0px 0px 20px 1px var(--third-bg)'
                    }}
                    minWidth={700}
                    minHeight={590}
                    bounds='window'
                    dragHandleClassName='modal-read-header'
                    onResize={(e, direction, ref, delta, position) => {
                      this.setState({
                        readHeight: ref.style.height,
                        readWidth: ref.style.width
                      })
                    }}
                  >
                    <div style={{ borderRadius: '15px', position: 'relative' }}>
                      <ModalHeader
                        style={{
                          backgroundColor: 'var(--fourth-bg)',
                          borderRadius: '0px'
                        }}
                        className='modal-read-header'
                      >
                        <img className='mail-icon' alt='Logo' src={this.state.readIconUrl} />
                        <div className='modal-incoming-header-text'>
                          <InputGroup size='sm' className='mb-2'>
                            <InputGroupAddon style={{ height: '31px' }} size='sm' type='prepend'>
                              <InputGroupText size='sm'>From:</InputGroupText>
                            </InputGroupAddon>
                            <FormInput size='sm' disabled placeholder={this.state.maintenance.incomingFrom} />
                          </InputGroup>
                          <InputGroup size='sm' className='mb-2'>
                            <InputGroupAddon style={{ height: '31px' }} size='sm' type='prepend'>
                              <InputGroupText size='sm'>Subject:</InputGroupText>
                            </InputGroupAddon>
                            <FormInput size='sm' disabled placeholder={this.state.maintenance.incomingSubject} />
                          </InputGroup>
                          <InputGroup size='sm' className='mb-2'>
                            <InputGroupAddon style={{ height: '31px' }} type='prepend'>
                              <InputGroupText size='sm'>Date/Time:</InputGroupText>
                            </InputGroupAddon>
                            <FormInput size='sm' disabled placeholder={this.state.maintenance.incomingDate} />
                          </InputGroup>
                        </div>
                        <ButtonGroup style={{ display: 'flex', flexDirection: 'column' }}>
                          <Button outline className='close-read-modal-btn' theme='light' style={{ borderRadius: '5px 5px 0 0', padding: '0.7em 0.9em' }} onClick={this.toggleReadModal}>
                            <FontAwesomeIcon
                              className='close-read-modal-icon' width='1.5em' style={{ color: 'var(--light)', fontSize: '12px' }}
                              icon={faTimesCircle}
                            />
                          </Button>
                          <Button theme='light' style={{ borderRadius: '0 0 5px 5px', padding: '0.7em 0.9em' }} onClick={this.handleTranslate.bind(this)}>
                            <FontAwesomeIcon width='1.8em' style={{ fontSize: '12px' }} className='translate-icon' icon={faLanguage} />
                          </Button>
                        </ButtonGroup>
                        <div style={{ flexGrow: Array.isArray(this.state.maintenance.incomingAttachments) ? '1' : '0', width: '100%', marginTop: '5px' }}>
                          {Array.isArray(this.state.maintenance.incomingAttachments) && this.state.maintenance.incomingAttachments.length !== 0
                            ? this.state.maintenance.incomingAttachments.map((attachment, index) => {
                              return (
                                <Popover
                                  isOpen={this.state.openedDownloadPopupId === attachment.id}
                                  onOuterAction={() => this.toggleDownloadPopover(false)}
                                  body={this.state.attachmentPopoverBody}
                                  key={index}
                                  tipSize={12}
                                  preferPlace='below'
                                >
                                  <Button pill size='sm' onClick={() => this.showAttachments(attachment.id, attachment.name)} theme='primary' style={{ marginLeft: '10px' }}>
                                    {attachment.name}
                                  </Button>
                                </Popover>
                              )
                            })
                            : (
                              null
                            )}
                        </div>
                      </ModalHeader>
                      <ModalBody className='mail-body' dangerouslySetInnerHTML={{ __html: this.state.translated ? this.state.translatedBody : this.state.maintenance.incomingBody }} />
                    </div>
                  </Rnd>
                ) : (
                  null
                )}
              <Attachment night={night} incomingAttachments={incomingAttachments} />
              {typeof window !== 'undefined'
                ? (
                  <Rnd
                    default={{
                      x: HALF_WIDTH,
                      y: 125,
                      width: 800,
                      height: 'auto'
                    }}
                    style={{
                      visibility: this.state.openAttachmentModal ? 'visible' : 'hidden',
                      opacity: this.state.openAttachmentModal ? 1 : 0,
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
                        {this.state.currentAttachmentName}
                        <Button outline className='close-attachment-modal-btn' theme='light' style={{ borderRadius: '5px', padding: '0.7em 0.9em' }} onClick={() => this.showAttachments(null)}>
                          <FontAwesomeIcon
                            className='close-attachment-modal-icon' width='1.5em' style={{ color: 'var(--light)', fontSize: '12px' }}
                            icon={faTimesCircle}
                          />
                        </Button>
                      </ModalHeader>
                      <ModalBody style={this.state.filetype === 'pdf' ? { overflow: 'scroll', padding: '0', height: '450px' } : null}>
                        {this.state.filetype === 'excel'
                          // this.state.rows && this.state.cols
                          ? (
                            <div className='attachment-body pdf'>
                              <OutTable data={this.state.rows} columns={this.state.cols} tableClassName='ExcelTable2007' tableHeaderRowClass='heading' />
                            </div>
                          ) : (
                            null
                          )}
                        {this.state.filetype === 'pdf'
                          ? (
                            <div className='attachment-body excel'>
                              <PDF file={this.state.pdfB64} scale={1.75} />
                            </div>
                          ) : (
                            null
                          )}
                        {this.state.filetype === 'html'
                          ? (
                            <root.div className='attachment-body html'>
                              <div style={this.state.night ? { color: '#6c757d' } : {}} dangerouslySetInnerHTML={{ __html: this.state.attachmentHTMLContent }} />
                            </root.div>
                          ) : (
                            null
                          )}
                      </ModalBody>
                    </div>
                  </Rnd>
                ) : (
                  null
                )}
              <Modal className='modal-preview-send' backdropClassName='modal-backdrop modal-preview-send-backdrop' animation backdrop size='lg' open={openPreviewModal} toggle={this.togglePreviewModal}>
                <ModalHeader>
                  <div className='modal-preview-text-wrapper'>
                    <InputGroup size='sm' className='mb-2'>
                      <InputGroupAddon style={{ height: '31px' }} size='sm' type='prepend'>
                        <InputGroupText size='sm'>To:</InputGroupText>
                      </InputGroupAddon>
                      <FormInput size='sm' disabled placeholder={this.state.mailPreviewHeaderText.toLowerCase()} />
                    </InputGroup>
                    <InputGroup size='sm' className='mb-2'>
                      <InputGroupAddon style={{ height: '31px' }} size='sm' type='prepend'>
                        <InputGroupText size='sm'>Cc:</InputGroupText>
                      </InputGroupAddon>
                      <FormInput size='sm' disabled placeholder='service@newtelco.de' />
                    </InputGroup>
                    <InputGroup size='sm' className='mb-2'>
                      <InputGroupAddon style={{ height: '31px' }} type='prepend'>
                        <InputGroupText size='sm'>Subject:</InputGroupText>
                      </InputGroupAddon>
                      <FormInput size='sm' disabled placeholder={this.state.mailPreviewSubjectTextPreview} />
                    </InputGroup>
                  </div>
                  <ButtonGroup style={{ flexDirection: 'column' }}>
                    <Button theme={this.state.night ? 'dark' : 'light'} style={{ borderRadius: '5px 5px 0 0' }} onClick={this.togglePreviewModal}>
                      <FontAwesomeIcon width='1.5em' style={{ fontSize: '12px' }} className='modal-preview-send-icon' icon={faTimesCircle} />
                    </Button>
                    <Button theme={this.state.night ? 'dark' : 'light'} outline id='send-mail-btn' style={{ borderRadius: '0 0 5px 5px', padding: '0.9em 1.1em' }} onClick={() => this.sendMail(this.state.mailPreviewHeaderText, this.state.mailPreviewCustomerCid, this.state.mailPreviewSubjectText, this.state.mailBodyText, true)}>
                      <FontAwesomeIcon width='1.5em' style={{ fontSize: '12px' }} className='modal-preview-send-icon modal-preview-paperplane-icon' icon={faPaperPlane} />
                    </Button>
                  </ButtonGroup>
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
                          bullist numlist outdent indent | removeformat | help`,
                      content_style: 'html { color: #828282 }'
                    }}
                    onChange={this.handleEditorChange}
                  />

                </ModalBody>
              </Modal>
              {typeof window !== 'undefined'
                ? (
                  <Rnd
                    default={{
                      x: HALF_WIDTH - (HALF_WIDTH / 1.5),
                      y: 25,
                      width: 600,
                      height: 565
                    }}
                    style={{
                      visibility: this.state.openRescheduleModal ? 'visible' : 'hidden',
                      opacity: this.state.openRescheduleModal ? 1 : 0,
                      backgroundColor: 'var(--primary-bg)',
                      overflow: 'hidden',
                      borderRadius: '15px',
                      height: 'auto',
                      zIndex: '101',
                      boxShadow: '0px 0px 20px 1px var(--dark)'
                    }}
                    bounds='window'
                    dragHandleClassName='reschedule-header'
                  >
                    <ModalHeader className='reschedule reschedule-header'>
                      <span style={{ flexGrow: '1' }}>
                        Reschedule Maintenance
                      </span>
                      <Badge pill outline theme='dark'>
                        {this.state.rescheduleData.length + 1}
                      </Badge>
                      <Button outline className='close-attachment-modal-btn' theme='light' style={{ borderRadius: '5px', marginLeft: '15px', padding: '0.7em 0.9em' }} onClick={this.toggleRescheduleModal}>
                        <FontAwesomeIcon
                          className='close-attachment-modal-icon' width='1.5em' style={{ color: 'var(--light)', fontSize: '12px' }}
                          icon={faTimesCircle}
                        />
                      </Button>
                    </ModalHeader>
                    <ModalBody className='modal-body reschedule'>
                      <Container style={{ paddingTop: '0px !important' }} className='container-border'>
                        <Col>
                          <Row style={{ display: 'flex', flexWrap: 'nowrap' }}>
                            <FormGroup style={{ margin: '0 15px', width: '100%' }}>
                              <label htmlFor='supplier'>Timezone</label>
                              <TimezoneSelector
                                className='maint-select'
                                value={{ value: this.state.reschedule.timezone, label: this.state.reschedule.timezoneLabel }}
                                onChange={this.handleRescheduleTimezoneChange}
                              />
                            </FormGroup>
                          </Row>
                          <Row style={{ display: 'flex', flexWrap: 'nowrap' }}>
                            <FormGroup style={{ margin: '0 15px' }}>
                              <label>
                                Start Date/Time
                              </label>
                              <Flatpickr
                                data-enable-time
                                options={{ time_24hr: 'true', allow_input: 'true' }}
                                className='flatpickr end-date-time'
                                value={this.state.reschedule.startDateTime || null}
                                onChange={date => this.handleRescheduleStartDateTimeChange(date)}
                              />
                            </FormGroup>
                            <FormGroup style={{ margin: '0 15px' }}>
                              <label>
                                End Date/Time
                              </label>
                              <Flatpickr
                                data-enable-time
                                options={{ time_24hr: 'true', allow_input: 'true' }}
                                className='flatpickr end-date-time'
                                value={this.state.reschedule.endDateTime || null}
                                onChange={date => this.handleRescheduleEndDateTimeChange(date)}
                              />
                            </FormGroup>
                          </Row>
                          <Row>
                            <FormGroup style={{ margin: '0px 15px', width: '100%', marginBottom: '10px !important' }}>
                              <label htmlFor='resched-impact'>
                                New Impact
                              </label>
                              <FormInput id='resched-impact' name='resched-impact' type='text' value={this.state.reschedule.impact} onChange={this.handleRescheduleImpactChange} />
                            </FormGroup>
                          </Row>
                          <Row>
                            <FormGroup style={{ margin: '0px 15px', width: '100%', marginBottom: '10px !important' }}>
                              <label htmlFor='resched-reason'>
                                Reason for Reschedule
                              </label>
                              <CreatableSelect
                                isClearable
                                menuPlacement='top'
                                className='maint-select'
                                value={this.state.reschedule.reason}
                                onChange={this.handleRescheduleReasonChange}
                                options={[
                                  {
                                    value: 'change_circuits',
                                    label: 'change in affected circuits'
                                  },
                                  {
                                    value: 'change_time',
                                    label: 'change in planned date/time'
                                  },
                                  {
                                    value: 'change_impact',
                                    label: 'change in impact duration'
                                  },
                                  {
                                    value: 'change_technical',
                                    label: 'change due to technical reasons'
                                  }
                                ]}
                                placeholder='Please select a reason for reschedule'
                              />
                            </FormGroup>
                          </Row>
                        </Col>
                      </Container>
                      <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Col>
                          <Button onClick={this.handleRescheduleSave} style={{ width: '100%', marginTop: '15px' }} theme='primary'>
                            Save
                          </Button>
                        </Col>
                      </Row>
                    </ModalBody>
                  </Rnd>
                ) : (
                  null
                )}
              {this.state.openConfirmDeleteModal && (
                <Modal className='delete-modal' animation backdrop backdropClassName='modal-backdrop' open={this.state.openConfirmDeleteModal} size='md' toggle={this.toggleConfirmDeleteRescheduleModal}>
                  <ModalHeader className='modal-delete-header'>
                    Confirm Delete Reschedule
                  </ModalHeader>
                  <ModalBody>
                    <Container className='container-border'>
                      <Row>
                        <Col>
                          Are you sure you want to delete reschedule: <b style={{ fontWeight: '900' }}> {this.state.rescheduleToDelete.id}</b>
                        </Col>
                      </Row>
                    </Container>
                    <Row style={{ marginTop: '20px' }}>
                      <Col>
                        <ButtonGroup style={{ width: '100%' }}>
                          <Button style={{ color: 'var(font-color)' }} onClick={this.toggleConfirmDeleteRescheduleModal} outline theme='secondary'>
                            Cancel
                          </Button>
                          <Button onClick={this.handleDeleteReschedule} theme='danger'>
                            Confirm
                          </Button>
                        </ButtonGroup>
                      </Col>
                    </Row>
                  </ModalBody>
                </Modal>
              )}
              {this.state.openConfirmFreezeModal && (
                <Modal className='confirm-freeze-modal' animation backdrop backdropClassName='modal-backdrop' open={this.state.openConfirmFreezeModal} size='md' toggle={this.toggleConfirmFreezeModal}>
                  <ModalHeader className='modal-delete-header'>
                    Confirm Freeze Send
                  </ModalHeader>
                  <ModalBody>
                    <Container className='container-border'>
                      <Row>
                        <Col>
                          There is a network freeze for <b>{this.state.frozenCompany || ''}</b>. Are you sure you want to send this mail?
                        </Col>
                      </Row>
                    </Container>
                    <Row style={{ marginTop: '20px' }}>
                      <Col>
                        <ButtonGroup style={{ width: '100%' }}>
                          <Button style={{ color: 'var(font-color)' }} onClick={this.toggleConfirmFreezeModal} outline theme='secondary'>
                            Cancel
                          </Button>
                          <Button onClick={() => this.prepareDirectSend(this.state.frozenState.recipient, this.state.frozenState.cid, false)} theme='danger'>
                            Confirm
                          </Button>
                        </ButtonGroup>
                      </Col>
                    </Row>
                  </ModalBody>
                </Modal>
              )}
            </Card>
            <style jsx>{`
                :global(.flip-transition-enter) {
                  opacity: 0;
                  transform: rotateY( 180deg );
                }
                :global(.flip-transition-enter-active) {
                  opacity: 1;
                  transform: translateX(0);
                  transform: rotateY( 360deg );
                  transition: opacity 0.9s, transform 0.9s;
                }
                :global(.flip-transition-exit) {
                  opacity: 0;
                  transform: rotateY( 180deg );
                }
                :global(.flip-transition-exit-active) {
                  opacity: 1;
                  transform: translateX(0);
                  transform: rotateY( 360deg );
                  transition: opacity 0.9s, transform 0.9s;
                }
                :global(.time-line-ctnr) {
                  margin-top: 15px;
                }
                :global(.time-line-ctnr .time-line > li > .fa) {
                  border-color: #67B246 !important;
                }
                :global(.time-line-ctnr .time-line:before) {
                  background: #67B246 !important;
                }
                :global(.time-line-ctnr .time-line > li > .time-line-item .time-line-header) {
                  background-color: var(--primary-bg) !important;
                  color: var(--font-color) !important;
                  border-bottom: none !important;
                }
                :global(.time-line-ctnr .time-line > li > .time-line-item) {
                  box-shadow: none !important;
                }
                :global(.time-label span) {
                  background-color: #67B246 !important;
                }
                :global(.delete-modal.modal-body) {
                  background-color: var(--primary-bg);
                  color: var(--font-color);
                }
                :global(.modal-delete-header) {
                  background: var(--secondary-bg);
                  color: var(--font-color);
                  display: flex;
                  justify-content: flex-start;
                  align-content: center;
                }
                :global(.modal-body.reschedule) {
                  background-color: var(--primary-bg);
                }
                :global(.modal-preview-send-backdrop) {
                  opacity: 0.8 !important;
                }
                :global(.reschedule-modal) {
                  max-width: 600px;
                }
                :global(.modal-header.reschedule *) {
                  color: var(--font-color);
                }
                :global(.modal-header.reschedule) {
                  background: var(--secondary-bg);
                  color: var(--font-color);
                  display: flex;
                  justify-content: flex-start;
                  align-content: center;
                }
                :global(.reschedule-header:hover) {
                  cursor: move;
                }
                :global(.container-border) {
                  border: 1px solid var(--border-color);
                  border-radius: 0.325rem;
                  margin: 10px 0;
                  padding: 1.5rem;
                }
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
                :global(.reschedule-btn) {
                  font-size: .85rem;
                  font-weight: 500;
                  padding: .50rem;
                  border-width: 2px;
                  width: 105px;
                  min-height: 88px;
                  max-height: unset;
                }
                :global(.reschedule-btn:hover, .reschedule-btn:active, .reschedule-btn:focus) {
                  background-color: var(--primary-bg);
                  color: #67B246;
                  box-shadow: 0 0 5px 1px #67B246;
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
                  min-width: 110px;
                  height: 110px;
                  border: 2px solid var(--light);
                  background: var(--white);
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
                :global(#impact::placeholder) {
                  color: var(--border-color);
                }
                :global(.MuiInputBase-root:hover) {
                  border-color: #8fa4b8 !important;
                }
                :global(.MuiOutlinedInput-input) {
                  padding: 10.5px 14px;
                  transition: box-shadow 250ms cubic-bezier(.27,.01,.38,1.06),border 250ms cubic-bezier(.27,.01,.38,1.06);
                }
                :global(.card-header h2) {
                  color: var(--font-color);
                  font-weight: 100 !important;
                }
                :global(.modal-attachment-header-text > .modal-title) {
                  font-weight: 100 !important;
                  font-family: Poppins, Roboto !important;
                }
                :global(.modal-incoming-header-text .input-group-prepend .input-group-text) {
                  background-color: #272727;
                }
                :global(.modal-incoming-header-text input.form-control) {
                  background-color: #373737;
                }
                :global(.modal-incoming-header-text input.form-control:hover) {
                  cursor: move;
                }
                :global(.modal-incoming-header-text) {
                  flex-grow: 1;
                  margin-right: 20px;
                  margin-top: 7px;
                }
                :global(.modal-read-header > .modal-title) {
                  flex-wrap: wrap;
                }
                :global(.modal-read-header:hover) {
                  cursor: move;
                }
                :global(.modal-preview-text-wrapper) {
                  width: 89%;
                }
                :global(.modal-preview-text-wrapper input:hover) {
                  cursor: default !important;
                }
                :global(.modal-preview-text-wrapper input::placeholder) {
                  color: var(--font-color);
                }
                :global(.modal-preview-send .modal-header) {
                  background-color: var(--secondary-bg);
                }
                :global(.modal-preview-send .modal-body) {
                  background-color: var(--primary-bg);
                }
                :global(.modal-preview-send .input-group-prepend .input-group-text) {
                  background-color: var(--primary-bg);
                }
                :global(.modal-preview-send .input-group input.form-control) {
                  cursor: default;
                }
                :global(.modal-preview-paperplane-icon) {
                  color: var(--font-color);
                }
                :global(.modal-preview-paperplane-icon:hover) {
                  color: #f8f9fa;
                }
                :global(.maint-select [class$='-menu']) {
                  z-index: 2000;
                }
                :global(.maint-select [class$='-placeholder']) {
                  color: var(--border-color) !important;
                }
                :global(.maint-select *) {
                  background-color: var(--input);
                  color: var(--font-color) !important;
                }
                :global(.maint-select div[class$="-multiValue"]) {
                  background-color: var(--input);
                  color: var(--font-color);
                  border: 1px solid var(--border-color);
                  border-radius: 5px;
                }
                :global(.maint-select div[class$="-singleValue"]) {
                  background-color: var(--input);
                  color: var(--font-color);
                }
                :global(.Mui-focused) {
                  border: none !important;
                }
                :global(.tox .tox-tbtn svg) {
                  fill: var(--font-color) !important;
                }
                :global(.tox .tox-tbtn) {
                  color: var(--font-color) !important;
                }
                :global(.tox-menubar .tox-mbtn) {
                  background: var(--secondary-bg) !important;
                  color: var(--inv-font-color) !important;
                }
                :global(.tox .tox-tbtn:hover:not(.tox-tbtn--disabled)) {
                  background: var(--secondary-bg) !important;
                  color: var(--inv-font-color) !important;
                }
                :global(.tox .tox-edit-area__iframe *) {
                  color: var(--font-color) !important;
                }
                :global(#tinymce) {
                  color: var(--font-color) !important;
                }
                :global(.tox .tox-edit-area__iframe) {
                  background-color: var(--primary-bg) !important;
                }
                :global(.progress) {
                  background-color: var(--inv-font-color);
                }
                :global(.MuiInputBase-root:focus-within) {
                  color: #495057;
                  background-color: var(--input);
                  border: 1px solid #67B246 !important;
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
                :global(.tox-edit-area__iframe *) {
                  color: #fff;
                }
                :global(.maintenance-subcontainer) {
                  border: 1px solid var(--border-color);
                  border-radius: 0.325rem;
                  margin: 10px 0;
                }
                :global(.form-group-toggle label) {
                  display: flex;
                  justify-content: space-evenly;
                  align-items: center;
                  height: 30px;
                }
                :global(.form-group-toggle > .badge) {
                  flex-grow: 1;
                  margin-left: 5px;
                  margin-right: 5px;
                }
                :global(.form-group-toggle) {
                  display: flex;
                  justify-content: space-around;
                  align-items: center;
                }
                :global(.ag-cell.ag-cell-inline-editing) {
                  padding: 10px !important;
                  height: inherit !important;
                }
                .toggle-done {
                  border: 1px solid var(--secondary);
                  border-radius: 0.325rem;
                  padding: 20px;
                }
                :global(.btn-toolbar .badge-outline-secondary) {
                  box-shadow: unset;
                }
                :global(.form-group-toggle > .badge-outline-secondary) {
                  border: ${this.state.night ? '1px solid #fff' : ''};
                }
                :global(.badge-outline-secondary > label) {
                  color: var(--font-color);
                }
                :global(.badge-outline-light > label) {
                  color: var(--font-color);
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
                :global(.modal-attachment-header-text ~ .modal-body) {
                  padding: 0px !important;
                  margin: 2px !important;
                }
                :global(.attachment-body) {
                  height: auto;
                  padding: 30px;
                  font-family: Poppins, Helvetica;
                  background: var(--primary-bg);
                  color: var(--font-color);
                  overflow: ${this.state.incomingMailIsHtml ? 'scroll' : 'scroll'};
                }
                :global(.attachment-body.html) {
                  max-height: 500px;
                  overflow: scroll;
                }
                :global(.attachment-body.html *) {
                  color: #6c757d;
                }
                :global(.mail-body) {
                  font-family: Poppins, Helvetica;
                  height: ${this.state.readHeight ? `calc(${this.state.readHeight} - 127px)` : '460px'};
                  background: var(--primary-bg);
                  color: var(--font-color);
                  overflow-y: ${this.state.incomingMailIsHtml ? 'scroll' : 'scroll'};
                }
                :global(.mail-body > pre:first-child) {
                  color: var(--font-color);
                }
                :global(.mail-body > div:first-child) {
                  position: ${this.state.incomingMailIsHtml ? 'relative' : 'absolute'};
                  top: 0;
                  left: 0;
                  height: ${this.state.incomingMailIsHtml ? '100vh' : '100%'};
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
                  background: #67B246;
                  height: 50px;
                  position:absolute;
                  right:0;
                  top:0;
                  cursor:move;
                }
                .modal-incoming-header-text > * {
                  color: var(--white);
                }
                :global(.modal-attachment-header-text ~ .modal-body) {
                  background-color: var(--primary-bg);

                }
                :global(.modal-attachment-header-text:hover) {
                  cursor: move;
                }
                :global(.modal-attachment-header-text > h5) {
                  color: var(--white);
                }
                :global(.close-attachment-modal-btn:hover > .close-attachment-modal-icon) {
                  color: var(--dark) !important;
                }
                :global(.close-read-modal-btn:hover > .close-read-modal-icon) {
                  color: var(--dark) !important;
                }
                :global(.form-group label) {
                  color: var(--font-color);
                }
                :global(.form-control, .form-control) {
                  color: var(--font-color);
                  background-color: var(--input);
                }
                :global(.form-control:disabled, .form-control[readonly]) {
                  color: var(--font-color);
                  background-color: var(--disabled-input);
                }
                :global(.card-header .btn) {
                  height: 47px !important;
                }
                :global(.btn-outline-secondary) {
                  color: var(--font-color);
                }
                :global(.flatpickr) {
                  height: auto;
                  width: 100%;
                  padding: .5rem 1rem;
                  font-size: .95rem;
                  line-height: 1.5;
                  color: var(--font-color);
                  background-color: var(--input);
                  border: 1px solid #becad6;
                  font-weight: 300;
                  will-change: border-color,box-shadow;
                  border-radius: .375rem;
                  box-shadow: none;
                  transition: box-shadow 250ms cubic-bezier(.27,.01,.38,1.06),border 250ms cubic-bezier(.27,.01,.38,1.06);
                }
                :global(.flatpickr-months) {
                  background: #67B246 !important;
                }
                :global(.flatpickr-month) {
                  background: #67B246 !important;
                }
                :global(.flatpickr-monthDropdown-months) {
                  background: #67B246 !important;
                }
                :global(.flatpickr-weekdays) {
                  background: #67B246 !important;
                }
                :global(.flatpickr-weekday) {
                  background: #67B246 !important;
                }
                :global(.flatpickr-day.selected) {
                  background: #67B246 !important;
                  border-color: #67B246 !important;
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
                :global(.row-frozen) {
                  border: 1px solid #dc3545;
                  box-shadow: 0 0 5px 1px #dc3545;
                  background-color: #dc35451f;
                  width: 100%;
                }
                :global(.changelog-wrapper) {
                  max-height: 1020px;
                  margin-top: 10px;
                  overflow-y: scroll;
                }
                :global(.maintenance-subcontainer .badge label) {
                  flex-direction: column;
                  justify-content: space-between;
                  height: 50px;
                  margin: 10px !important;
                }
                :global(.Popover-body) {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  padding: 10px;
                  width: 200px;
                  transform: translateY(-6px);
                }
                :global(.Popover-tip) {
                  transform: translateX(95px) translateY(-7px) !important;
                  fill: var(--primary-bg);
                }
                :global(.Popover) {
                  z-index: 2000;
                  background-color: var(--primary-bg);
                  border: 1px solid var(--border-color);
                  color: var(--font-color);
                  border-radius: 15px;
                  box-shadow: 0 0 15px 1px var(--third-bg);
                }
                :global(.form-group-toggle.form-group > .badge) {
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  min-height: 80px;
                }
                @media only screen and (max-width: 500px) {
                  :global(html) {
                    max-width: ${this.state.width}px;
                  }
                  :global(.col) {
                    padding: 0 5px;
                  }
                  :global(.card-footer) {
                    padding: 0.75rem;
                  }
                  :global(.card-footer .btn) {
                    padding: 0.5rem 0.25rem !important;
                    height: 50px !important;
                  }
                  :global(.impact-row) {
                    padding: 10px;
                  }
                  :global(.navbar) {
                    position: fixed;
                    z-index: 1000;
                    width: 100%;
                  }
                  :global(.changelog-wrapper) {
                    max-height: 600px;
                    overflow-y: scroll;
                  }
                  :global(.top-card-wrapper) {
                    margin-top: 60px;
                  }
                  :global(.maintenance-subcontainer .badge label) {
                    font-size: 1.2em;
                    flex-direction: column;
                    margin: 0px;
                    height: 50px;
                  }
                  :global(.maint-header-text-wrapper) {
                    flex-direction: row !important;
                    flex-wrap: nowrap;
                  }
                  :global(div.btn-toolbar > .btn-group-md) {
                    width: 100%;
                    margin-bottom: 10px;
                  }
                  :global(.btn-group-2) {
                    width: 100%;
                  }
                  :global(.btn-toolbar .btn div) {
                    max-height: 80px !important;
                    display: flex !important;
                    flex-direction: row;
                    justify-content: space-around;
                    align-items: center;
                    width: 100%;
                  }
                  :global(.btn-toolbar .btn) {
                    max-height: 80px !important;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    align-items: center;
                  }
                  :global(.btn-toolbar .btn svg) {
                    margin-right: 0px !important;
                  }
                  :global(.card-footer .btn svg) {
                    margin-right: 0px !important;
                  }
                  :global(.card-footer .btn) {
                    max-height: 53px !important;
                    height: 53px;
                    padding: .25rem 0.9rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    align-items: center;
                  }
                  :global(div.btn-toolbar) {
                  }
                  :global(div.btn-toolbar > span) {
                    display: flex;
                    justify-content: space-around;
                    flex-wrap: wrap;
                    flex-direction: column;
                    flex-grow: 1;
                    margin-top: 2%;
                  }
                  :global(div.btn-toolbar > span > .badge.badge-outline-secondary) {
                    font-size: 1.8rem !important;
                    margin-right: 0 !important;
                  }
                  :global(div.btn-toolbar > span > h2) {
                    margin: 5px;
                    padding-right: 20px;
                    font-size: 1.5em;
                    max-width: 170px;
                  }
                  :global(.card-header h2) {
                    margin-top: 5px;
                  }
                  :global(.card-header) {
                    height: 120px;
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
