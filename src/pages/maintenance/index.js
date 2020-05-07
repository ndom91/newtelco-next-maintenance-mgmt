import React, { useState, useEffect, useRef } from 'react'
import Layout from '../../components/layout'
import fetch from 'isomorphic-unfetch'
import Footer from '../../components/cardFooter'
import Attachment from '../../components/attachment'
import RequireLogin from '../../components/require-login'
import { NextAuth } from 'next-auth/client'
import Toggle from 'react-toggle'
import './maintenance.css'
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
import TimezoneSelector from '../../components/timezone'
import { getUnique, convertDateTime } from '../../components/maintenance/helper'
import { HotKeys } from 'react-hotkeys'
import { OutTable, ExcelRenderer } from 'react-excel-renderer'
import ProtectedIcon from '../../components/ag-grid/protected'
import SentIcon from '../../components/ag-grid/sent'
import StartDateTime from '../../components/ag-grid/startdatetime'
import EndDateTime from '../../components/ag-grid/enddatetime'
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

import Notify from '../../lib/notification'

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
  () => import('../../components/timeline'),
  { ssr: false }
)

const sentBtn = (row, actionA, actionB) => {
  return (
    <ButtonGroup>
      <Button onClick={() => actionA(row.data.rcounter)} style={{ padding: '0.75em' }} size='sm' outline>
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
      <Button onClick={() => actionB(row.data.startDateTime, row.data.endDateTime, row.data.rcounter)} style={{ padding: '0.7em' }} size='sm' outline>
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

const sendMailBtns = (row, actionA, actionB) => {
  return (
    <ButtonGroup>
      <Button onClick={() => actionA(row.data.maintenanceRecipient, row.data.kundenCID, row.data.frozen, row.data.name)} style={{ padding: '0.7em' }} size='sm' outline>
        <FontAwesomeIcon width='1.325em' icon={faPaperPlane} />
      </Button>
      <Button onClick={() => actionB(row.data.maintenanceRecipient, row.data.kundenCID, row.data.protected)} style={{ padding: '0.7em' }} size='sm' outline>
        <FontAwesomeIcon width='1.325em' icon={faSearch} />
      </Button>
    </ButtonGroup>
  )
}

const HALF_WIDTH = 600

// export default class Maintenance extends React.Component {
const Maintenance = props => {
  // constructor (props) {
  //   super(props)
  //   let night
  //   if (typeof window !== 'undefined') {
  //     night = window.localStorage.getItem('theme')
  //   }
  const [width, setWidth] = useState(0)
  const [maintenance, setMaintenance] = useState({
    incomingAttachments: [],
    incomingBody: props.jsonData.profile.body,
    timezone: 'Europe/Amsterdam',
    timezoneLabel: '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
    bearbeitetvon: '',
    maileingang: '',
    updatedAt: '',
    updatedBy: props.jsonData.profile.updatedBy,
    name: '',
    impact: '',
    location: '',
    reason: '',
    mailId: 'NT',
    calendarId: props.jsonData.profile.calendarId,
    maintNote: ''
  })
  // const [attachmentModalSize, setAttachmentModalSize] = useState({
  //   width: 673,
  //   height: 400
  // })
  const [frozenState, setFrozenState] = useState({
    recipient: '',
    cid: ''
  })
  const [frozenCompany, setFrozenCompany] = useState('')
  const [attachmentHTMLContent, setAttachmentHtmlContent] = useState('')
  const [currentAttachmentName, setCurrentAttachmentName] = useState('')
  const [currentAttachment, setCurrentAttachment] = useState('')
  const [attachmentDetails, setAttachmentDetails] = useState({})
  const [dateTimeWarning, setDateTimeWarning] = useState(false)
  const [openAttachmentModal, setOpenAttachmentModal] = useState(false)
  const [openProtectionSwitchToggle, setOpenProtectionSwitchToggle] = useState(false)
  const [openUseImpactPlaceholderToggle, setOpenUseImpactPlaceholderToggle] = useState(false)
  const [openReadModal, setOpenReadModal] = useState(false)
  const [openPreviewModal, setOpenPreviewModal] = useState(false)
  const [openHelpModal, setOpenHelpModal] = useState(false)
  const [openRescheduleModal, setOpenRescheduleModal] = useState(false)
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false)
  const [openConfirmFreezeModal, setOpenConfirmFreezeModal] = useState(false)
  const [openMaintenanceChangelog, setOpenMaintenanceChangelog] = useState(false)
  const [openDownloadPopup, setOpenDownloadPopup] = useState(false)
  const [openedDownloadPopupId, setOpenedDownloadPopupId] = useState('')
  const [attachmentPopoverBody, setAttachmentPopoverBody] = useState('')
  const [reschedule, setReschedule] = useState({
    startDateTime: null,
    endDateTime: null,
    impact: '',
    reason: ''
  })
  const [rescheduleData, setRescheduleData] = useState([])
  const [rescheduleToDelete, setRescheduleToDelete] = useState({
    id: null,
    rcounter: null
  })
  const [notesText, setNotesText] = useState(props.jsonData.profile.notes || '')
  const [mailBodyText, setMailBodyText] = useState('')
  const [mailPreviewHeaderText, setMailPreviewHeaderText] = useState('')
  const [mailPreviewSubjectText, setMailPreviewSubjectText] = useState('')
  const [mailPreviewCustomerCID, setMailPreviewCustomerCid] = useState('')
  const [mailPreviewSubjectTextPreview, setMailPreviewSubjectTextPreview] = useState('')
  const [lieferantcids, setLieferantcids] = useState({})
  const [kundencids, setKundencids] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [impactPlaceholder, setImpactPlaceholder] = useState([])
  const [selectedLieferant, setSelectedLieferant] = useState([])
  const [incomingMailIsHtml, setIncomingMailIsHtml] = useState(false)
  const [readIconUrl, setReadIconUrl] = useState('')

  const gridApi = useRef()
  const gridColumnApi = useRef()
  const reschedGridApi = useRef()
  const reschedGridColumnApi = useRef()

  const rescheduleGridOptions = {
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
      sentBtn: sentBtn(toggleRescheduleSentBtn, moveCalendarEntry)
    }
  }
  const gridOptions = {
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
      sendMailBtn: sendMailBtns(prepareDirectSend, togglePreviewModal),
      protectedIcon: ProtectedIcon,
      sentIcon: SentIcon
    },
    paginationPageSize: 10,
    rowClass: 'row-class',
    rowClassRules: {
      'row-frozen': function (params) {
        // const frozen = params.data.frozen
        if (params.data.frozen) {
          return true
        }
        return false
      }
    }
  }

  const convertBool = (input) => {
    if (input == '1' || input == '0') {
      if (input == '1') {
        return true
      } else if (input == '0') {
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

  useEffect(() => {
    let lieferantDomain
    setWidth(window.outerWidth)
    if (props.jsonData.profile.id === 'NEW') {
      // prepare NEW maintenance
      const username = props.session.user.email.substr(0, email.indexOf('@'))
      const maintenance = {
        ...props.jsonData.profile,
        bearbeitetvon: username,
        updatedAt: format(new Date(), 'MM.dd.yyyy HH:mm')
      }
      setMaintenance(maintenance)
      lieferantDomain = props.jsonData.profile.name
    } else {
      // prepare page for existing maintenance
      fetch(`/api/reschedule?id=${props.jsonData.profile.id}`, {
        method: 'get'
      })
        .then(resp => resp.json())
        .then(data => {
          setState({
            rescheduleData: data.reschedules
          })
        })
        .catch(err => console.error(`Error Loading Reschedules - ${err}`))

      const {
        cancelled,
        emergency,
        done
      } = props.jsonData.profile

      const newMaintenance = {
        ...props.jsonData.profile,
        cancelled: convertBool(cancelled),
        emergency: convertBool(emergency),
        done: convertBool(done),
        timezone: 'Europe/Amsterdam',
        timezoneLabel: '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
        startDateTime: moment.tz(props.jsonData.profile.startDateTime, 'GMT').tz('Etc/GMT-1').format('YYYY-MM-DD HH:mm:ss'),
        endDateTime: moment.tz(props.jsonData.profile.endDateTime, 'GMT').tz('Etc/GMT-1').format('YYYY-MM-DD HH:mm:ss')
      }

      setMaintenance(newMaintenance)
      lieferantDomain = props.jsonData.profile.mailDomain
    }

    // prepare to get available supplier CIDs for selected supplier
    if (props.jsonData.profile.lieferant) {
      fetchLieferantCIDs(props.jsonData.profile.lieferant)
    } else {
      fetch(`/api/companies/domain?id=${lieferantDomain}`, {
        method: 'get'
      })
        .then(resp => resp.json())
        .then(data => {
          if (!data.companyResults[0]) {
            fetchLieferantCIDs()
            return
          }
          const companyId = data.companyResults[0].id
          const companyName = data.companyResults[0].name
          setMaintenance({
            ...maintenance,
            name: companyName,
            lieferant: companyId
          })
          fetchLieferantCIDs(companyId)
        })
        .catch(err => console.error(`Error - ${err}`))
    }

    // get choices for company select
    fetch('/api/companies/selectmaint', {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        setSuppliers(data.companies)
      })
      .catch(err => console.error(`Error - ${err}`))

    // prepopulate impact placeholder
    const startDateTime = props.jsonData.profile.startDateTime
    const endDateTime = props.jsonData.profile.endDateTime

    if (startDateTime && endDateTime && isValid(parseISO(startDateTime)) && isValid(parseISO(endDateTime))) {
      const impactCalculation = formatDistance(parseISO(endDateTime), parseISO(startDateTime))
      setImpactPlaceholder(impactCalculation)
    }
  }, [])

  /// /////////////////////////////////////////////////////////
  //
  //                AG-GRID TABLE
  //
  /// /////////////////////////////////////////////////////////

  const handleRescheduleGridReady = (params) => {
    rescheduleGridApi.current = params.api
    params.api.setRowData(rescheduleData)
  }

  const handleGridReady = params => {
    gridApi.current = params.gridApi
    gridColumnApi.current = params.gridColumnApi
  }

  /// /////////////////////////////////////////////////////////
  //
  //                ACTIONS: API CALLS
  //
  /// /////////////////////////////////////////////////////////

  // fetch supplier CIDs
  const fetchLieferantCIDs = lieferantId => {
    if (!lieferantId) {
      setLieferantcids([{ label: 'Invalid Supplier ID', value: '1' }])
      return
    }
    fetch(`/api/lieferantcids?id=${lieferantId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (!data.lieferantCIDsResult) {
          setLieferantcids([{ label: 'No CIDs available for this Supplier', value: '1' }])
          return
        }
        const derenCIDidField = props.jsonData.profile.derenCIDid
        const commaRegex = new RegExp(',')
        if (commaRegex.test(derenCIDidField)) {
          // multiple CID string (comma separated)
          setLieferantcids(data.lieferantCIDsResult)
          fetch(`/api/lieferantcids/label?id=${derenCIDidField}`, {
            method: 'get'
          })
            .then(resp => resp.json())
            .then(data => {
              data.respArray.forEach(respCid => {
                fetchMailCIDs(respCid.value)
              })
              setSelectedLieferant: data.respArray
            })
        } else {
          // Single CID String
          const selectedLieferantCIDid = parseInt(derenCIDidField) || null
          fetchMailCIDs(selectedLieferantCIDid)
          const selectedLieferantCIDvalue = props.jsonData.profile.derenCID || null
          if (selectedLieferantCIDid) {
            setLieferantcids(data.lieferantCIDsResult)
            setSelectedLieferant([{
              label: selectedLieferantCIDvalue,
              value: selectedLieferantCIDid
            }])
          } else {
            setLieferantcids(data.lieferantCIDsResult)
          }
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  // fetch customer CIDs based on selected Supplier CID
  const fetchMailCIDs = lieferantCidId => {
    if (!lieferantCidId) {
      return
    }
    fetch(`/api/customercids/${lieferantCidId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const {
          done
        } = maintenance
        let currentSentStatus = 0
        if (done === 1 || done === true || done === '1') {
          currentSentStatus = 1
        }
        const kundencids = data.kundenCIDsResult
        kundencids.forEach(cid => {
          cid.sent = currentSentStatus
          cid.frozen = false
        })
        // const newKundenCids = kundencids
        // kundencids.forEach(cid => {
        //   newKundenCids.push(cid)
        // })
        const uniqueKundenCids = getUnique(kundencids, 'kundenCID')
        setKundencids(uniqueKundenCids)
        uniqueKundenCids.forEach(cid => {
          checkFreezeStatus(cid)
        })
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  const checkFreezeStatus = async (cid) => {
    const startDate = maintenance.startDateTime
    const endDate = maintenance.endDateTime

    await fetch(`/api/maintenances/freeze?companyid=${cid.kunde}&startDate=${startDate}&endDate=${endDate}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.freezeQuery.length !== 0) {
          const freezeEntry = data.freezeQuery[0]
          const localKundenCids = kundencids
          const frozenCidIndex = localKundenCids.findIndex(el => el.kunde === freezeEntry.companyId)
          Notify('error', 'CID Frozen', `${localKundenCids[frozenCidIndex].name} has an active network freeze at that time`)
          localKundenCids[frozenCidIndex].frozen = true
          setKundencids(localKundenCids)
          if (gridApi.current) {
            gridApi.current.refreshCells()
          }
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  /// /////////////////////////////////////////////////////////
  //                    SEND MAILS
  /// /////////////////////////////////////////////////////////

  // prepare mail from direct-send button
  const prepareDirectSend = (recipient, customerCID, frozen, companyName) => {
    if (frozen) {
      setFrozenState({
        recipient: recipient,
        cid: customerCID
      })
      setFrozenCompany(companyName)
      toggleConfirmFreezeModal()
      return
    }
    const HtmlBody = generateMail(customerCID)
    const subject = `Planned Work Notification - NT-${maintenance.id}`
    sendMail(recipient, customerCID, subject, HtmlBody, false)
  }

  // generate Mail contents
  const generateMail = (customerCID, protection) => {
    const {
      id,
      startDateTime,
      endDateTime,
      impact,
      reason,
      location,
      timezone,
      maintNote
    } = maintenance

    if (!id || !startDateTime || !endDateTime) {
      Notify('warning', 'Missing Required Fields')
      return
    }

    const timezoneValue = timezone || 'Europe/Dublin'
    const rawStart = moment.tz(startDateTime, timezoneValue)
    const rawEnd = moment.tz(endDateTime, timezoneValue)
    const utcStart1 = rawStart.tz('GMT').format('YYYY-MM-DD HH:mm:ss')
    const utcEnd1 = rawEnd.tz('GMT').format('YYYY-MM-DD HH:mm:ss')
    const utcStart = props.jsonData.profile.startDateTime || utcStart1
    const utcEnd = props.jsonData.profile.endDateTime || utcEnd1

    let maintenanceIntro = 'We would like to inform you about planned work on the following CID(s):'
    const rescheduleText = ''
    const tzSuffixRAW = 'UTC / GMT+0:00'

    const cancelled = convertBool(maintenance.cancelled)
    if (cancelled) {
      maintenanceIntro = `We would like to inform you that these planned works (<b>NT-${id}</b>) have been <b>cancelled</b> with the following CID(s):`
    }

    if (rescheduleData.length !== 0) {
      const latest = rescheduleData.length - 1
      const newStart = moment(rescheduleData[latest].startDateTime).format('YYYY-MM-DD HH:mm:ss')
      const newEnd = moment(rescheduleData[latest].endDateTime).format('YYYY-MM-DD HH:mm:ss')
      const newImpact = rescheduleData[latest].impact
      const newReason = rescheduleData[latest].reason.toLowerCase()
      const rcounter = rescheduleData[latest].rcounter
      if (cancelled && rescheduleData[latest]) {
        maintenanceIntro = `We would like to inform you that these rescheduled planned works (<b>NT-${id}-${rcounter}</b>) have been <b>cancelled</b>.<br><br>We are sorry for any inconveniences this may have caused.<br><footer>​<style>.sig{font-family:Century Gothic, sans-serif;font-size:9pt;color:#636266!important;}b.i{color:#4ca702;}.gray{color:#636266 !important;}a{text-decoration:none;color:#636266 !important;}</style><div class="sig"><div>Best regards <b class="i">|</b> Mit freundlichen Grüßen</div><br><div><b>Newtelco Maintenance Team</b></div><br><div>NewTelco GmbH <b class="i">|</b> Moenchhofsstr. 24 <b class="i">|</b> 60326 Frankfurt a.M. <b class="i">|</b> DE <br>www.newtelco.com <b class="i">|</b> 24/7 NOC  49 69 75 00 27 30 ​​<b class="i">|</b> <a style="color:#" href="mailto:service@newtelco.de">service@newtelco.de</a><br><br><div><img alt="sig" src="https://home.newtelco.de/sig.png" height="29" width="516"></div></div>​</footer><hr />`
      }
      maintenanceIntro += `We regret to inform you that the planned works have been <b>rescheduled</b> on the following CID(s):\n\n<br><br><b>${customerCID}</b><br><br>The maintenance has been rescheduled due to ${newReason}.<br><br>The new details are as follows:<br><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>NT-${id}-${rcounter}</b></td></tr><tr><td>New Start date and time:</td><td><b>${newStart} (${tzSuffixRAW})</b></td></tr><tr><td>New Finish date and time:</td><td><b>${newEnd} (${tzSuffixRAW})</b></td></tr><tr><td>New Impact:</td><td><b>${newImpact}</b></td></tr></table><br>Thank you very much for your patience and cooperation.<br>`

      if (rescheduleData.length > 1) {
        maintenanceIntro += '<br><hr><br><b>Previous Reschedules:</b><br>'
        const oldReschedules = rescheduleData
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
      if (convertBool(protection)) {
        body = body + '<tr><td>Impact:</td><td>50ms Protection Switch</td></tr>'
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
  const sendMail = (recipient, customerCid, subj, htmlBody, isFromPreview, isFromSendAll) => {
    const activeRowIndex = kundencids.findIndex(el => el.kundenCID === customerCid)
    const kundenCidRow = kundencids[activeRowIndex]
    if (kundenCidRow.frozen) {
      setFrozenCompany(kundenCidRow.name || '')
      setFrozenState({
        recipient: recipient,
        cid: customerCid
      })
      toggleConfirmFreezeModal()
      return
    }
    const body = htmlBody || mailBodyText
    let subject = subj || mailPreviewSubjectText
    const to = recipient || mailPreviewHeaderText

    if (convertBool(maintenance.emergency)) {
      subject = `[EMERGENCY] ${subject}`
    }
    if (convertBool(cancelled)) {
      subject = `[CANCELLED] ${subject}`
    }
    if (rescheduleData.length !== 0) {
      subject = `[RESCHEDULED] ${subject}-${rescheduleData[rescheduleData.length - 1].rcounter}`
    }

    fetch('/v1/api/mail/send', {
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
          const activeRowIndex = kundencids.findIndex(el => el.kundenCID === customerCid)
          const kundenCidRow = kundencids[activeRowIndex]
          if (maintenance.cancelled === true && maintenance.done === true) {
            kundenCidRow.sent = '2'
          } else {
            kundenCidRow.sent = '1'
          }
          const updatedKundenCids = [
            ...kundencids,
            kundenCidRow
          ]
          const deduplicatedKundenCids = getUnique(updatedKundenCids, 'kundenCID')
          setKundencids(deduplicatedKundenCids)
          if (!isFromSendAll) {
            Notify('success', 'Mail Sent')
          }
          if (isFromPreview) {
            setOpenPreviewModal(!openPreviewModal)
          }
          if (gridApi.current) {
            gridApi.current.refreshCells()
          }
          const maintId = maintenance.id
          const user = props.session.user.email
          const action = 'sent to'
          const field = kundenCidRow.name
          fetch(`/api/history?mid=${maintId}&user=${user}&field=${field}&action=${action}`, {
            method: 'get'
          })
            .then(resp => resp.json())
            .then(data => {
            })
            .catch(err => console.error(`Error updating Audit Log - ${err}`))
        } else {
          Notify('error', 'Error Sending Mail')
          if (isFromPreview) {
            setOpenPreviewModal(!openPreviewModal)
          }
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  const handleSendAll = () => {
    const rowCount = gridApi.current.getDisplayedRowCount() - 1
    gridApi.current.forEachNode((node, index) => {
      setTimeout(() => {
        const HtmlBody = generateMail(node.data.kundenCID, node.data.protected)
        const subject = `Planned Work Notification - NT-${maintenance.id}`
        sendMail(node.data.maintenanceRecipient, node.data.kundenCID, subject, HtmlBody, false, true)
        Notify('success', `Mail Sent - ${node.data.name}`)
        if (index === rowCount) {
          Notify('success', 'All Mails Sent!')
        }
      }, 500 * (index + 1))
    })
  }

  const sentProgress = () => {
    if (kundencids.length !== 0) {
      const total = kundencids.length
      let progressSent = 0
      kundencids.forEach(cid => {
        if (cid.sent === '1' || cid.sent === '2') {
          progressSent = progressSent + 1
        }
      })
      const result = (progressSent / total) * 100
      return result
    }
  }

  const moveCalendarEntry = (startDateTime, endDateTime, rcounter) => {
    const calId = maintenance.calendarId
    const company = maintenance.name
    const maintId = maintenance.id

    let derenCid = ''
    selectedLieferant.forEach(cid => {
      derenCid = derenCid + cid.label + ' '
    })
    derenCid = derenCid.trim()

    let cids = ''
    kundencids.forEach(cid => {
      cids = cids + cid.kundenCID + ' '
    })
    cids = cids.trim()

    if (calId) {
      fetch('/v1/api/calendar/reschedule', {
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
            Notify('success', 'Calendar Entry Rescheduled')
          }
        })
        .catch(err => console.error(err))
    } else {
      Notify('warning', 'No Calendar Entry ID Available!')
    }
  }

  const handleCalendarCreate = () => {
    const company = maintenance.name
    const maintId = maintenance.id
    const startDateTime = maintenance.startDateTime
    const endDateTime = maintenance.endDateTime

    let derenCid = ''
    selectedLieferant.forEach(cid => {
      derenCid = derenCid + cid.label + ' '
    })
    derenCid = derenCid.trim()

    let cids = ''
    kundencids.forEach(cid => {
      cids = cids + cid.kundenCID + ' '
    })
    cids = cids.trim()

    const startMoment = moment.tz(startDateTime, maintenance.timezone)
    const startDE = startMoment.tz('Europe/Berlin').format()
    const endMoment = moment.tz(endDateTime, maintenance.timezone)
    const endDE = endMoment.tz('Europe/Berlin').format()

    fetch('/v1/api/calendar/create', {
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
          Notify('success', 'Calendar Entry Created')
          const calId = data.event.data.id

          setMaintenance({
            ...maintenance,
            calendarId: calId
          })

          fetch(`/api/maintenances/save/calendar?mid=${maintenance.id}&cid=${calId}&updatedby=${props.session.user.email}`, {
            method: 'get'
          })
            .then(resp => resp.json())
            .then(data => {
              // console.log(data)
            })
            .catch(err => console.error(err))
        } else if (statusText === 'failed') {
          Notify('error', 'Error Creating Calendar Entry', data.statusText)
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
  const handleMailPreviewChange = (content, delta, source, editor) => {
    setMailBodyText(editor.getContents())
  }

  // react-select onChange - supplier CIDs
  const handleSelectLieferantChange = selectedOption => {
    if (selectedOption) {
      setKundencids([])
      selectedOption.forEach(option => {
        fetchMailCIDs(option.value)
      })
      setSelectedLieferant(selectedOption)
    }
  }

  const handleEditorChange = (data) => {
    setMailBodyText(data.level.content)
  }

  const handleNotesChange = (data) => {
    setMaintenance({ ...maintenance, notes: data.level.content })
  }

  const saveDateTime = (maintId, element, newValue) => {
    let newISOTime = moment.tz(newValue, maintenance.timezone)
    if (maintId === 'NEW') {
      Notify('error', 'Save Not Possible', 'No CID yet assigned.')
      return
    }
    newISOTime = newISOTime.utc().format('YYYY-MM-DD HH:mm:ss')
    const activeUserEmail = props.session.user.email
    const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
    fetch(`/api/maintenances/save/dateTime?maintId=${maintId}&element=${element}&value=${newISOTime}&updatedby=${activeUser}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: props.session.csrfToken
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

  const handleStartDateChange = date => {
    const startDate = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')

    setMaintenance({ ...maintenance, startDateTime: startDate })
    saveDateTime(maintenance.id, 'start', startDate)
    const startDateTime = maintenance.startDateTime
    const endDateTime = maintenance.endDateTime

    if (startDateTime && endDateTime && isValid(parseISO(startDateTime)) && isValid(parseISO(endDateTime))) {
      const impactCalculation = formatDistance(parseISO(endDateTime), parseISO(startDateTime))
      setImpactPlaceholder(impactCalculation)
    }
  }

  const handleEndDateChange = date => {
    const endDate = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')

    setMaintenance({ ...maintenance, endDateTime: endDate })
    saveDateTime(maintenance.id, 'end', endDate)
    const startDateTime = maintenance.startDateTime
    const endDateTime = maintenance.endDateTime

    if (startDateTime && endDateTime && isValid(parseISO(startDateTime)) && isValid(parseISO(endDateTime))) {
      const dateCompare = compareAsc(parseISO(endDateTime), parseISO(startDateTime))
      if (dateCompare !== 1) {
        Notify('warning', 'End date is before start date!')
        setDateTimeWarning(true)
      } else {
        if (dateTimeWarning) {
          setDateTimeWarning(false)
        }
      }
      const impactCalculation = formatDistance(parseISO(endDateTime), parseISO(startDateTime))
      setImpactPlaceholder(impactCalculation)
    }
  }

  const handleToggleChange = (element, event) => {
    const maintId = maintenance.id
    const activeUserEmail = props.session.user.email
    const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
    let newValue = !eval(`maintenance.${element}`)
    if (typeof newValue === 'string') {
      if (newValue === 'false') {
        newValue = false
      } else if (newValue === 'true') {
        newValue = true
      }
    }
    setMaintenance({ ...maintenance, [element]: newValue })

    if (element === 'done') {
      // save 'betroffeneCIDs'
      let impactedCIDs = ''
      kundencids.forEach(cid => {
        impactedCIDs += cid.kundenCID + ' '
      })

      impactedCIDs = impactedCIDs.trim()

      setMaintenance({ ...maintenance, betroffeneCIDs: impactedCIDs, [element]: newValue })

      if (maintenance.receivedmail) {
        const mailId = maintenance.receivedmail
        if (!mailId.startsWith('NT-')) {
          fetch('/v1/api/inbox/markcomplete', {
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
                Notify('error', 'Error moving Mail to Complete Label')
              }
            })
            .catch(err => console.error(`Error - ${err}`))
        }
      }

      fetch(`/api/maintenances/save/impactedcids?cids=${impactedCIDs}&maintId=${state.maintenance.id}&updatedby=${activeUser}`, {
        method: 'get',
        headers: {
          'Access-Control-Allow-Origin': '*',
          _csrf: props.session.csrfToken
        }
      })
        .then(resp => resp.json())
        .then(data => {
          if (!data.status === 200) {
            Notify('error', 'Impacted CIDs Not Saved')
          }
        })
        .catch(err => console.error(`Error - ${err}`))

      // update Algolia Index
      fetch('/v1/api/search/update', {
        method: 'get'
      })
    }

    if (maintId === 'NEW') {
      Notify('error', 'No CID Assigned', 'Cannot save updates.')
      return
    }
    fetch(`/api/maintenances/save/toggle?maintId=${maintId}&element=${element}&value=${newValue}&updatedby=${activeUser}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          Notify('success', 'Save Success')
        } else {
          Notify('error', 'Error Saving', data.err)
        }
      })
      .catch(err => console.error(err))
  }

  const handleReasonChange = (event) => {
    setMaintenance({ ...maintenance, reason: encodeURIComponent(event.target.value) })
  }

  const handleMaintNoteChange = (event) => {
    setMaintenance({ ...maintenance, maintNote: encodeURIComponent(event.target.value) })
  }

  const handleLocationChange = (event) => {
    setMaintenance({ ...maintenance, location: event.target.value })
  }

  const handleImpactChange = (event) => {
    setMaintenance({ ...maintenance, impact: event.target.value })
  }

  const handleTimezoneChange = (selection) => {
    const timezoneLabel = selection.label // 'Europe/Amsterdam'
    const timezoneValue = selection.value // '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna'

    setMaintenance({ ...maintenance, timezone: timezoneValue, timezoneLabel: timezoneLabel })
  }

  const handleUpdatedByChange = () => {
    const value = maintenance.updatedBy
    setMaintenance({ ...maintenance, updatedBy: value })
  }

  const handleUpdatedAtChange = () => {
    const value = maintenance.updatedAt
    setMaintenance({ ...maintenance, updatedAt: value })
  }

  const handleSupplierChange = (selectedOption) => {
    setMaintenance({ ...maintenance, lieferant: selectedOption.value, name: selectedOption.label })
    setSelectedLieferant([])
    setKundencids([])
    fetchLieferantCIDs(selectedOption.value)
  }

  /// /////////////////////////////////////////////////////////
  //
  //                INPUTS: ONBLUR
  //
  /// /////////////////////////////////////////////////////////

  const handleDateTimeBlur = (element) => {
    Notify('success', 'Save Success')
  }

  const handleCIDBlur = (ev) => {
    const postSelection = (id) => {
      let idParameter
      if (Array.isArray(id)) {
        idParameter = id.join(',')
      } else {
        idParameter = id
      }
      if (idParameter === maintenance.derenCIDid) {
        return true
      }
      const maintId = maintenance.id
      if (maintId === 'NEW') {
        Notify('error', 'Cannot Save', 'No CID Assigned')
        return
      }
      const activeUserEmail = props.session.user.email
      const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
      fetch(`/api/maintenances/save/lieferant?maintId=${maintId}&cid=${idParameter}&updatedby=${activeUser}`, {
        method: 'get',
        headers: {
          'Access-Control-Allow-Origin': '*',
          _csrf: props.session.csrfToken
        }
      })
        .then(resp => resp.json())
        .then(data => {
          if (data.status === 200 && data.statusText === 'OK') {
            Notify('success', 'Save Success')
            setMaintenance({ ...maintenance, updatedBy: activeUser })
          } else {
            Notify('error', 'Error Saving', data.err)
          }
        })
        .catch(err => console.error(err))
    }
    const selectedSupplierCids = selectedLieferant
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

  const handleTimezoneBlur = () => {
    const incomingTimezone = maintenance.timezone || 'Europe/Amsterdam'
    const incomingTimezoneLabel = encodeURIComponent(maintenance.timezoneLabel || '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna')
    const activeUserEmail = props.session.user.email
    const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
    fetch(`/api/maintenances/save/timezone?maintId=${maintenance.id}&timezone=${incomingTimezone}&timezoneLabel=${incomingTimezoneLabel}&updatedby=${activeUser}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          Notify('success', 'Save Success')
          setMaintenance({ ...maintenance, updatedBy: activeUser })
        } else {
          Notify('error', 'Error Saving', data.err)
        }
      })
      .catch(err => console.error(err))
  }

  const handleTextInputBlur = (element) => {
    const newValue = eval(`maintenance.${element}`)
    const originalValue = eval(`props.jsonData.profile.${element}`)
    const maintId = maintenance.id
    const activeUserEmail = props.session.user.email
    const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))

    if (newValue === originalValue) {
      return
    }

    if (maintId === 'NEW') {
      Notify('warning', 'Cannot Save', 'No CID Assigned')
      return
    }
    fetch(`/api/maintenances/save/textinput?maintId=${maintId}&element=${element}&value=${newValue}&updatedby=${activeUser}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          Notify('success', 'Save Success')
          setMaintenance({ ...maintenance, updatedBy: activeUser })
        } else {
          Notify('error', 'Error Saving', data.err)
        }
      })
      .catch(err => console.error(err))
  }

  const handleNotesBlur = () => {
    const newValue = maintenance.notes
    const originalValue = props.jsonData.profile.notes
    const activeUserEmail = props.session.user.email
    const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
    if (newValue === originalValue) {
      return
    }
    const maintId = maintenance.id
    if (maintId === 'NEW') {
      Notify('warning', 'Cannot Save', 'No CID Assigned')
      return
    }
    fetch(`/api/maintenances/save/notes?maintId=${maintId}&value=${newValue}&updatedby=${activeUser}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          Notify('success', 'Save Success')
          setMaintenance({ ...maintenance, updatedBy: activeUser })
        } else {
          Notify('error', 'Error Saving', data.err)
        }
      })
      .catch(err => console.error(err))
  }

  const handleSupplierBlur = () => {
    const newValue = maintenance.lieferant
    const maintId = maintenance.id
    const activeUserEmail = props.session.user.email
    const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
    if (maintId === 'NEW') {
      Notify('warning', 'Cannot Save', 'No CID Assigned')
      return
    }
    fetch(`/api/maintenances/save/supplier?maintId=${maintId}&value=${newValue}&updatedby=${activeUser}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          Notify('success', 'Save Success')
          setMaintenance({ ...maintenance, updatedBy: activeUser })
        } else {
          Notify('error', 'Error Saving', data.err)
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
  const toggleReadModal = () => {
    if (!maintenance.incomingBody) {
      const mailId = maintenance.mailId || maintenance.receivedmail
      if (mailId === 'NT') {
        Notify('warning', 'No Mail Available', 'This Maintenance was manually created.')
        return
      }
      fetch(`/v1/api/mail/${mailId}`, {
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
            setIncomingMailIsHtml(true)
          } else {
            mailBody = `<pre>${data.body}</pre>`
            setIncomingMailIsHtml(false)
          }
          setMaintenance({
            ...maintenance,
            incomingBody: mailBody,
            incomingFrom: data.from,
            incomingSubject: data.subject,
            incomingDate: data.date,
            incomingAttachments: data.attachments,
            incomingDomain: props.jsonData.profile.mailDomain
          })
          setOpenReadModal(!openReadModal)
        })
        .catch(err => console.error(`Error - ${err}`))
    } else {
      setOpenReadModal(!openReadModal)
    }
    if (!readIconUrl) {
      fetch(`/v1/api/favicon?d=${props.jsonData.profile.mailDomain}`, {
        method: 'get'
      })
        .then(resp => resp.json())
        .then(data => {
          setReadIconUrl(data.icons)
        })
    }
  }

  // open / close send preview modal
  const togglePreviewModal = (recipient, customerCID, protection) => {
    if (recipient && customerCID) {
      const HtmlBody = generateMail(customerCID, protection)
      if (HtmlBody) {
        setOpenPreviewModal(!openPreviewModal)
        setMailBodyText(HtmlBody)
        setMailPreviewHeaderText(recipient || mailPreviewHeaderText)
        setMailPreviewSubjectText(`Planned Work Notification - NT-${state.maintenance.id}`)
        setMailPreviewCustomerCid(customerCID)
      }
    } else {
      setOpenPreviewModal(!openPreviewModal)
    }
    mailSubjectText()
  }

  const toggleHelpModal = () => {
    setOpenHelpModal(!openHelpModal)
  }

  const toggleRescheduleModal = () => {
    setOpenRescheduleModal(!openRescheduleModal)
  }

  const toggleHistoryView = () => {
    setOpenMaintenanceChangelog(!openMaintenanceChangelog)
  }

  const toggleConfirmFreezeModal = () => {
    setOpenConfirmFreezeModal(!openConfirmFreezeModal)
  }

  /// /////////////////////////////////////////////////////////
  //
  //                    RESCHEDULE
  //
  /// /////////////////////////////////////////////////////////

  const handleRescheduleTimezoneChange = (selection) => {
    const timezoneLabel = selection.label // 'Europe/Amsterdam'
    const timezoneValue = selection.value // '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna'

    setReschedule({ ...reschedule, timezone: timezoneValue, timezoneLabel: timezoneLabel })
  }

  const handleRescheduleStartDateTimeChange = (date) => {
    const startDateTime = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')
    setReschedule({ ...reschedule, startDateTime })
  }

  const handleRescheduleEndDateTimeChange = (date) => {
    const endDateTime = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')
    setReschedule({ ...reschedule, endDateTime })
  }

  const handleRescheduleImpactChange = (event) => {
    setReschedule({ ...reschedule, impact: event.target.value })
  }

  const handleRescheduleReasonChange = (reason) => {
    setReschedule({ ...reschedule, reason })
  }

  const handleRescheduleSave = () => {
    const newImpact = reschedule.impact
    const newReason = reschedule.reason.label
    const timezone = reschedule.timezone
    const newStartDateTime = moment.tz(reschedule.startDateTime, timezone).utc().format('YYYY-MM-DD HH:mm:ss')
    const newEndDateTime = moment.tz(reschedule.endDateTime, timezone).utc().format('YYYY-MM-DD HH:mm:ss')

    fetch(`/api/reschedule/save?mid=${maintenance.id}&impact=${encodeURIComponent(newImpact)}&sdt=${encodeURIComponent(newStartDateTime)}&edt=${encodeURIComponent(newEndDateTime)}&rcounter=${rescheduleData.length + 1}&user=${encodeURIComponent(props.session.user.email)}&reason=${encodeURIComponent(newReason)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.insertRescheduleQuery.affectedRows === 1) {
          setOpenRescheduleModal(!openRescheduleModal)
          Notify('success', 'Reschedule Save Complete')
          const newRescheduleData = rescheduleData
          newRescheduleData.push({ rcounter: rescheduleData.length + 1, startDateTime: moment(newStartDateTime).format(), endDateTime: moment(newEndDateTime).format(), impact: newImpact, reason: newReason, sent: 0 })
          setRescheduleData(newRescheduleData)
          setReschedule({
            impact: '',
            reason: '',
            startDateTime: null,
            endDateTime: null
          })
          rescheduleGridApi.current.setRowData(newRescheduleData)
        }
      })
      .catch(err => console.error(`Error Saving Reschedule - ${err}`))

    fetch(`/api/reschedule/increment?id=${maintenance.id}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        // console.log(data.rescheduleInc)
      })
      .catch(err => console.error(`Error Incrementing Reschedule - ${err}`))
  }

  const handleRescheduleCellEdit = (params) => {
    const rcounter = params.data.rcounter
    const newStartDateTime = moment(params.data.startDateTime).format('YYYY.MM.DD HH:mm:ss')
    const newEndDateTime = moment(params.data.endDateTime).format('YYYY.MM.DD HH:mm:ss')
    const newImpact = params.data.impact

    fetch(`/api/reschedule/edit?mid=${maintenance.id}&impact=${encodeURIComponent(newImpact)}&sdt=${encodeURIComponent(newStartDateTime)}&edt=${encodeURIComponent(newEndDateTime)}&rcounter=${rcounter}&user=${encodeURIComponent(props.session.user.email)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.editRescheduleQuery.affectedRows === 1) {
          Notify('success', 'Reschedule Edit Success')
        }
      })
      .catch(err => console.error(`Reschedule Edit Error - ${err}`))
  }

  const toggleRescheduleSentBtn = (rcounter) => {
    const newRescheduleData = rescheduleData
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
    setRescheduleData(newRescheduleData)

    fetch(`/api/reschedule/sent?mid=${maintenance.id}&rcounter=${rcounter}&sent=${newSentStatus}&user=${encodeURIComponent(props.session.user.email)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.editRescheduleQuery.affectedRows === 1) {
          Notify('success', 'Reschedule Sent Change Success')
        }
      })
      .catch(err => console.error(`Reschedule Sent Change Error - ${err}`))

    rescheduleGridApi.current.refreshCells()
  }

  const toggleConfirmDeleteRescheduleModal = () => {
    if (rescheduleGridApi.current) {
      const row = rescheduleGridApi.current.getSelectedRows()
      const rescheduleId = `NT-${maintenance.id}-${row[0].rcounter}`
      setRescheduleToDelete({
        id: rescheduleId,
        rcounter: row[0].rcounter
      })
      setOpenConfirmDeleteModal(!openConfirmDeleteModal)
    }
  }

  const toggleDownloadPopover = () => {
    setOpenedDownloadPopupId(null)
  }

  const handleDeleteReschedule = () => {
    fetch(`/api/reschedule/delete?mid=${maintenance.id}&rcounter=${rescheduleToDelete.rcounter}&user=${encodeURIComponent(props.session.user.email)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.deleteRescheduleQuery.affectedRows === 1) {
          Notify('success', 'Reschedule Delete Success')
          const newRescheduleData = rescheduleData.filter(resched => resched.rcounter !== rescheduleToDelete.rcounter)
          rescheduleGridApi.current.setRowData(newRescheduleData)
          setOpenConfirmDeleteModal(!openConfirmDeleteModal)
          setRescheduleData(newRescheduleData)
        } else {
          Notify('error', 'Reschedule Delete Error')
        }
      })
      .catch(err => console.error(`Reschedule Delete Error - ${err}`))
  }

  /// /////////////////////////////////////////////////////////
  //
  //                    OTHER ACTIONS
  //
  /// /////////////////////////////////////////////////////////

  const showAttachments = (id, filename) => {
    const fixBase64 = (binaryData) => {
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
    const downloadFile = (base64, filename, mimeType) => {
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
        const excelIndex = maintenance.incomingAttachments.findIndex(el => el.id === id)
        const file = maintenance.incomingAttachments[excelIndex]
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
            setAttachmentDetails({
              filetype: filetype,
              cols: resp.cols,
              rows: resp.rows,
              currentAttachmentName: filename,
              currentAttachment: id || null,
              openedDownloadPopupId: id,
              attachmentPopoverBody:
  <span>
                <ButtonGroup>
                  <Button onClick={() => { setOpenAttachmentModal(!openAttachmentModal); setOpenedDownloadPopupId(null) }} outline size='sm'>Preview</Button>
                  <Button onClick={() => downloadFile(base64, filename, mime)} size='sm'>Download</Button>
                </ButtonGroup>
              </span>
            })
            // this.setState({
            //   filetype: filetype,
            //   cols: resp.cols,
            //   rows: resp.rows,
            //   currentAttachmentName: filename,
            //   currentAttachment: id || null,
            //   openedDownloadPopupId: id,
            //   attachmentPopoverBody:
            //   <span>
            //     <ButtonGroup>
            //       <Button onClick={() => this.setState({ openAttachmentModal: !openAttachmentModal, openedDownloadPopupId: null })} outline size='sm'>Preview</Button>
            //       <Button onClick={() => downloadFile(base64, filename, mime)} size='sm'>Download</Button>
            //     </ButtonGroup>
            //   </span>
            // })
          }
        })
      } else if (filetype === 'pdf') {
        const pdfIndex = maintenance.incomingAttachments.findIndex(el => el.id === id)
        const file = maintenance.incomingAttachments[pdfIndex]
        const filedata = file.data
        const mime = file.mime
        const filename = file.name
        let base64 = (filedata).replace(/_/g, '/')
        base64 = base64.replace(/-/g, '+')
        const base64Fixed = fixBase64(base64)
        const fileData = new Blob([base64Fixed], { type: 'application/pdf' })
        setAttachmentDetails({
          size: {
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
              <Button onClick={() => { setOpenAttachmentModal(!openAttachmentModal); setOpenedDownloadPopupId(null) }} outline size='sm'>Preview</Button>
              <Button onClick={() => downloadFile(base64, filename, mime)} size='sm'>Download</Button>
            </ButtonGroup>
          </span>
        })
      } else if (filetype === 'html') {
        const fileIndex = maintenance.incomingAttachments.findIndex(el => el.id === id)
        const file = maintenance.incomingAttachments[fileIndex]
        const filedata = file.data
        const filename = file.name
        const mime = file.mime
        let base64 = (filedata).replace(/_/g, '/')
        base64 = base64.replace(/-/g, '+')
        setAttachmentHtmlContent(attachmentHTMLContent: window.atob(base64)),
        setAttachmentDetails({
          filetype: filetype,
          currentAttachment: id || null,
          currentAttachmentName: filename,
          openedDownloadPopupId: id,
          attachmentPopoverBody:
          <span>
            <ButtonGroup>
              <Button onClick={() => { setOpenAttachmentModal(!openAttachmentModal); setOpenedDownloadPopupId(null) }} outline size='sm'>Preview</Button>
              <Button onClick={() => downloadFile(base64, filename, mime)} size='sm'>Download</Button>
            </ButtonGroup>
          </span>
        })
      } else {
        const fileIndex = maintenance.incomingAttachments.findIndex(el => el.id === id)
        const file = maintenance.incomingAttachments[fileIndex]
        const mime = file.mime
        const rawData = file.data
        let base64 = (rawData).replace(/_/g, '/')
        base64 = base64.replace(/-/g, '+')
        setAttachmentDetails({
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
      setOpenAttachmentModal(!openAttachmentModal)
      setCurrentAttachment(id || null)
    }
  }

  const handleProtectionSwitch = () => {
    setMaintenance({ ...maintenance, impact: '50ms protection switch' })
    handleTextInputBlur('impact')
  }

  const useImpactPlaceholder = () => {
    setMaintenance({ ...maintenance, impact: impactPlaceholder })
  }

  const handleCreateOnClick = (event) => {
    const {
      bearbeitetvon,
      maileingang,
      lieferant,
      mailId,
      updatedAt
    } = maintenance

    let incomingFormatted
    if (mailId === 'NT') {
      incomingFormatted = format(new Date(updatedAt), 'yyyy-MM-dd HH:mm:ss')
    } else {
      incomingFormatted = format(new Date(maileingang), 'yyyy-MM-dd HH:mm:ss')
    }
    const updatedAtFormatted = format(new Date(updatedAt), 'yyyy-MM-dd HH:mm:ss')

    fetch(`/api/maintenances/save/create?bearbeitetvon=${bearbeitetvon}&lieferant=${lieferant}&mailId=${mailId}&updatedAt=${updatedAtFormatted}&maileingang=${incomingFormatted}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const newId = data.newId['LAST_INSERT_ID()']
        setMaintenance({
          ...maintenance,
          id: newId
        })
        const newLocation = `/maintenance?id=${newId}`
        Router.push(newLocation, newLocation, { shallow: true })
        if (data.status === 200 && data.statusText === 'OK') {
          Notify('success', 'Create Success')
        } else {
          Notify('error', 'Create Error', data.err)
        }
      })
      .catch(err => console.error(err))

    // mark mail as unread as well
    const incomingMailId = maintenance.mailId || maintenance.receivedmail
    if (incomingMailId !== 'NT') {
      fetch('/v1/api/inbox/delete', {
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
            Notify('success', 'Message Removed from Inbox')
          } else if (data.id === 500) {
            Notify('error', 'Error Removing Message from Inbox')
          }
        })
        .catch(err => console.error(`Error - ${err}`))
    }
  }

  const handleSearchSelect = (selection) => {
    const cleanId = selection.id.replace(/[0-9]+/g, '')
    const newLocation = `/maintenance?id=${cleanId}`
    Router.push(newLocation)
  }

  const mailSubjectText = () => {
    let text = rescheduleData.length !== 0 ? ' [RESCHEDULED]' : ''
    text += maintenance.emergency ? ' [EMERGENCY]' : ''
    text += maintenance.cancelled ? ' [CANCELLED]' : ''
    text += ' Planned Work Notification - NT-' + maintenance.id
    if (rescheduleData.length !== 0) {
      text += rescheduleData.length !== 0 && '-' + rescheduleData[rescheduleData.length - 1].rcounter
    }
    setMailPreviewSubjectTextPreview(text)
  }

  /// /////////////////////////////////////////////////////////
  //
  //                      RENDER
  //
  /// /////////////////////////////////////////////////////////

  // const {
  //   maintenance,
  //   dateTimeWarning,
  //   suppliers,
  //   lieferantcids,
  //   openReadModal,
  //   selectedLieferant,
  //   impactPlaceholder,
  //   openPreviewModal,
  //   notesText,
  //   incomingAttachments,
  //   night
  // } = this.state

  let maintenanceIdDisplay
  if (maintenance.id === 'NEW') {
    maintenanceIdDisplay = maintenance.id
  } else {
    maintenanceIdDisplay = `NT-${maintenance.id}`
  }

  // let HALF_WIDTH = 500
  // if (typeof window !== 'undefined') {
  //   HALF_WIDTH = this.state.width !== 0 ? this.state.width / 2 : 500
  // }

  if (props.session.user) {
    return (
      <Layout count={props.unread} session={props.session}>
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
                <Button onClick={toggleReadModal} outline>
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
              {width > 500
                ? (
                  <ButtonGroup className='btn-group-2' size='md'>
                    <Button outline onClick={toggleRescheduleModal}>
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
                    <Button onClick={handleCalendarCreate} outline>
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
                        <Button className='create-btn' onClick={handleCreateOnClick}>
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
                        <Button className='send-bulk' theme='primary' onClick={handleSendAll}>
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
                              <FormInput tabIndex='-1' readOnly id='edited-by-input' name='edited-by' type='text' value={maintenance.bearbeitetvon} />
                            </FormGroup>
                            <FormGroup>
                              <label htmlFor='supplier'>Timezone</label>
                              <TimezoneSelector
                                className='maint-select'
                                value={{ value: maintenance.timezone, label: maintenance.timezoneLabel }}
                                onChange={handleTimezoneChange}
                                onBlur={handleTimezoneBlur}
                              />
                            </FormGroup>
                            <FormGroup>
                              <label htmlFor='start-datetime'>Start Date/Time</label>
                              <Flatpickr
                                data-enable-time
                                options={{ time_24hr: 'true', allow_input: 'true' }}
                                className='flatpickr end-date-time'
                                value={maintenance.startDateTime || null}
                                onChange={date => handleStartDateChange(date)}
                                onClose={() => handleDateTimeBlur('start')}
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
                                value={{ label: maintenance.name, value: maintenance.lieferant }}
                                onChange={handleSupplierChange}
                                options={suppliers}
                                noOptionsMessage={() => 'No Suppliers'}
                                placeholder='Please select a Supplier'
                                onBlur={handleSupplierBlur}
                              />
                            </FormGroup>
                            <FormGroup>
                              <label htmlFor='end-datetime'>End Date/Time</label>
                              <Flatpickr
                                data-enable-time
                                options={{ time_24hr: 'true', allow_input: 'true' }}
                                className='flatpickr end-date-time'
                                style={dateTimeWarning ? { border: '2px solid #dc3545', boxShadow: '0 0 10px 1px #dc3545' } : null}
                                value={maintenance.endDateTime || null}
                                onChange={date => handleEndDateChange(date)}
                                onClose={() => handleDateTimeBlur('end')}
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
                                value={selectedLieferant || undefined}
                                onChange={handleSelectLieferantChange}
                                options={lieferantcids}
                                components={animatedComponents}
                                isMulti
                                noOptionsMessage={() => 'No CIDs for this Supplier'}
                                placeholder='Please select a CID'
                                onBlur={handleCIDBlur}
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
                                      <Button id='protectionswitchtext' style={{ padding: '0.35em', marginRight: '10px', marginTop: '10px' }} onClick={handleProtectionSwitch} outline theme='secondary'>
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
                                      <Button id='impactplaceholdertext' style={{ padding: '0.35em', marginTop: '10px' }} onClick={useImpactPlaceholder} outline theme='secondary'>
                                        <FontAwesomeIcon width='16px' icon={faHistory} />
                                      </Button>
                                    </Tooltip>
                                  </div>
                                  <FormInput onBlur={() => handleTextInputBlur('impact')} id='impact' name='impact' type='text' onChange={handleImpactChange} placeholder={impactPlaceholder} value={maintenance.impact || ''} />
                                </FormGroup>
                              </Col>
                              <Col>
                                <FormGroup>
                                  <label htmlFor='location'>Location</label>
                                  <FormInput onBlur={() => handleTextInputBlur('location')} id='location' name='location' type='text' onChange={handleLocationChange} value={maintenance.location || ''} />
                                </FormGroup>
                              </Col>
                            </Row>
                            <FormGroup>
                              <label htmlFor='reason'>Reason</label>
                              <FormTextarea id='reason' name='reason' onBlur={() => handleTextInputBlur('reason')} onChange={handleReasonChange} type='text' value={maintenance.reason && decodeURIComponent(maintenance.reason)} />
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
                              <FormTextarea id='maintNote' name='maintNote' onBlur={() => handleTextInputBlur('maintNote')} onChange={handleMaintNoteChange} type='text' value={maintenance.maintNote && decodeURIComponent(maintenance.maintNote)} />
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
                                    onChange={(event) => handleToggleChange('cancelled', event)}
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
                                    onChange={(event) => handleToggleChange('emergency', event)}
                                  />
                                </label>
                              </Badge>
                              <Badge theme='secondary' outline>
                                <label>
                                  <div>Done</div>
                                  <Toggle
                                    checked={maintenance.done === 'false' ? false : !!maintenance.done}
                                    onChange={(event) => handleToggleChange('done', event)}
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
                                initialValue={notesText}
                                apiKey='ttv2x1is9joc0fi7v6f6rzi0u98w2mpehx53mnc1277omr7s'
                                onBlur={handleNotesBlur}
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
                                onChange={handleNotesChange}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </Container>
                    </Col>
                  </Row>
                </Col>
                <Col sm='12' lg='6' className='flip-container'>
                  {openMaintenanceChangelog
                    ? (
                      <CSSTransition
                        timeout={500}
                        classNames='flip-transition'
                        in={openMaintenanceChangelog}
                      >
                        <Row>
                          <Col>
                            <Container style={{ padding: '20px' }} className='maintenance-subcontainer'>
                              <Row>
                                <Col>
                                  <span style={{ color: 'var(--font-color)', fontWeight: '300 !important', fontSize: '1.5rem' }}>Maintenance History</span>
                                </Col>
                                <Col style={{ flexGrow: '0' }}>
                                  <Button style={{ float: 'right' }} onClick={toggleHistoryView} outline>
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
                                  <Changelog maintid={maintenance.id} />
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
                        in={openMaintenanceChangelog}
                      >
                        <Row>
                          <Col>
                            <Container style={{ padding: '20px' }} className='maintenance-subcontainer'>
                              <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Col>
                                  <span style={{ color: 'var(--font-color)', fontWeight: '300 !important', fontSize: '1.5rem' }}>Customer CIDs</span>
                                </Col>
                                <Col style={{ flexGrow: '0' }}>
                                  <Button style={{ float: 'right' }} onClick={toggleHistoryView} outline>
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
                                  {kundencids.length !== 0
                                    ? (
                                      <Progress theme='primary' value={sentProgress()} />
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
                                      gridOptions={gridOptions}
                                      rowData={kundencids}
                                      onGridReady={handleGridReady}
                                      pagination
                                      deltaRowDataMode
                                      getRowNodeId={(data) => {
                                        return data.kundenCID
                                      }}
                                    />
                                  </div>
                                </Col>
                              </Row>
                            </Container>
                            {rescheduleData.length !== 0
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
                                          gridOptions={rescheduleGridOptions}
                                          rowData={rescheduleData}
                                          onGridReady={handleRescheduleGridReady}
                                          pagination
                                          onCellEditingStopped={handleRescheduleCellEdit}
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
          {width < 500
            ? (
              <CardFooter className='card-footer'>
                <ButtonGroup className='btn-group-2' size='md'>
                  <Button outline onClick={toggleRescheduleModal}>
                    <FontAwesomeIcon icon={faClock} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                    Reschedule
                  </Button>
                  <Button onClick={handleCalendarCreate} outline>
                    <FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                      Calendar
                  </Button>
                  {maintenance.id === 'NEW'
                    ? (
                      <Button disabled={maintenance.id !== 'NEW'} className='create-btn' onClick={handleCreateOnClick}>
                        <FontAwesomeIcon icon={faPlusCircle} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                          Create
                      </Button>
                    ) : (
                      <Button className='send-bulk' theme='primary' onClick={handleSendAll}>
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
                // onResize={(e, direction, ref, delta, position) => {
                //   this.setState({
                //     readHeight: ref.style.height,
                //     readWidth: ref.style.width
                //   })
                // }}
              >
                <div style={{ borderRadius: '15px', position: 'relative' }}>
                  <ModalHeader
                    style={{
                      backgroundColor: 'var(--fourth-bg)',
                      borderRadius: '0px'
                    }}
                    className='modal-read-header'
                  >
                    <img className='mail-icon' alt='Logo' src={readIconUrl} />
                    <div className='modal-incoming-header-text'>
                      <InputGroup size='sm' className='mb-2'>
                        <InputGroupAddon style={{ height: '31px' }} size='sm' type='prepend'>
                          <InputGroupText size='sm'>From:</InputGroupText>
                        </InputGroupAddon>
                        <FormInput size='sm' disabled placeholder={maintenance.incomingFrom} />
                      </InputGroup>
                      <InputGroup size='sm' className='mb-2'>
                        <InputGroupAddon style={{ height: '31px' }} size='sm' type='prepend'>
                          <InputGroupText size='sm'>Subject:</InputGroupText>
                        </InputGroupAddon>
                        <FormInput size='sm' disabled placeholder={maintenance.incomingSubject} />
                      </InputGroup>
                      <InputGroup size='sm' className='mb-2'>
                        <InputGroupAddon style={{ height: '31px' }} type='prepend'>
                          <InputGroupText size='sm'>Date/Time:</InputGroupText>
                        </InputGroupAddon>
                        <FormInput size='sm' disabled placeholder={maintenance.incomingDate} />
                      </InputGroup>
                    </div>
                    <ButtonGroup style={{ display: 'flex', flexDirection: 'column' }}>
                      <Button outline className='close-read-modal-btn' theme='light' style={{ borderRadius: '5px 5px 0 0', padding: '0.7em 0.9em' }} onClick={toggleReadModal}>
                        <FontAwesomeIcon
                          className='close-read-modal-icon' width='1.5em' style={{ color: 'var(--light)', fontSize: '12px' }}
                          icon={faTimesCircle}
                        />
                      </Button>
                      {/* <Button theme='light' style={{ borderRadius: '0 0 5px 5px', padding: '0.7em 0.9em' }} onClick={handleTranslate.bind(this)}>
                        <FontAwesomeIcon width='1.8em' style={{ fontSize: '12px' }} className='translate-icon' icon={faLanguage} />
                      </Button> */}
                    </ButtonGroup>
                    <div style={{ flexGrow: Array.isArray(maintenance.incomingAttachments) ? '1' : '0', width: '100%', marginTop: '5px' }}>
                      {Array.isArray(maintenance.incomingAttachments) && maintenance.incomingAttachments.length !== 0
                        ? maintenance.incomingAttachments.map((attachment, index) => {
                          return (
                            <Popover
                              isOpen={openedDownloadPopupId === attachment.id}
                              onOuterAction={() => toggleDownloadPopover(false)}
                              body={attachmentPopoverBody}
                              key={index}
                              tipSize={12}
                              preferPlace='below'
                            >
                              <Button pill size='sm' onClick={() => showAttachments(attachment.id, attachment.name)} theme='primary' style={{ marginLeft: '10px' }}>
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
                  <ModalBody className='mail-body' dangerouslySetInnerHTML={{ __html: maintenance.incomingBody }} />
                </div>
              </Rnd>
            ) : (
              null
            )}
          <Attachment night={false} incomingAttachments={maintenance.incomingAttachments} />
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
                    <Button outline className='close-attachment-modal-btn' theme='light' style={{ borderRadius: '5px', padding: '0.7em 0.9em' }} onClick={() => showAttachments(null)}>
                      <FontAwesomeIcon
                        className='close-attachment-modal-icon' width='1.5em' style={{ color: 'var(--light)', fontSize: '12px' }}
                        icon={faTimesCircle}
                      />
                    </Button>
                  </ModalHeader>
                  <ModalBody style={attachmentDetails.filetype === 'pdf' ? { overflow: 'scroll', padding: '0', height: '450px' } : null}>
                    {attachmentDetails.filetype === 'excel'
                      // rows && cols
                      ? (
                        <div className='attachment-body pdf'>
                          <OutTable data={rows} columns={cols} tableClassName='ExcelTable2007' tableHeaderRowClass='heading' />
                        </div>
                      ) : (
                        null
                      )}
                    {attachmentDetails.filetype === 'pdf'
                      ? (
                        <div className='attachment-body excel'>
                          <PDF file={pdfB64} scale={1.75} />
                        </div>
                      ) : (
                        null
                      )}
                    {attachmentDetails.filetype === 'html'
                      ? (
                        <root.div className='attachment-body html'>
                          <div dangerouslySetInnerHTML={{ __html: attachmentHTMLContent }} />
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
          <Modal className='modal-preview-send' backdropClassName='modal-backdrop modal-preview-send-backdrop' animation backdrop size='lg' open={openPreviewModal} toggle={togglePreviewModal}>
            <ModalHeader>
              <div className='modal-preview-text-wrapper'>
                <InputGroup size='sm' className='mb-2'>
                  <InputGroupAddon style={{ height: '31px' }} size='sm' type='prepend'>
                    <InputGroupText size='sm'>To:</InputGroupText>
                  </InputGroupAddon>
                  <FormInput size='sm' disabled placeholder={mailPreviewHeaderText.toLowerCase()} />
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
                  <FormInput size='sm' disabled placeholder={mailPreviewSubjectTextPreview} />
                </InputGroup>
              </div>
              <ButtonGroup style={{ flexDirection: 'column' }}>
                <Button theme="light" style={{ borderRadius: '5px 5px 0 0' }} onClick={togglePreviewModal}>
                  <FontAwesomeIcon width='1.5em' style={{ fontSize: '12px' }} className='modal-preview-send-icon' icon={faTimesCircle} />
                </Button>
                <Button theme="light" outline id='send-mail-btn' style={{ borderRadius: '0 0 5px 5px', padding: '0.9em 1.1em' }} onClick={() => sendMail(mailPreviewHeaderText, mailPreviewCustomerCid, mailPreviewSubjectText, mailBodyText, true)}>
                  <FontAwesomeIcon width='1.5em' style={{ fontSize: '12px' }} className='modal-preview-send-icon modal-preview-paperplane-icon' icon={faPaperPlane} />
                </Button>
              </ButtonGroup>
            </ModalHeader>
            <ModalBody>
              <TinyEditor
                initialValue={mailBodyText}
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
                onChange={handleEditorChange}
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
                  visibility: openRescheduleModal ? 'visible' : 'hidden',
                  opacity: openRescheduleModal ? 1 : 0,
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
                    {rescheduleData.length + 1}
                  </Badge>
                  <Button outline className='close-attachment-modal-btn' theme='light' style={{ borderRadius: '5px', marginLeft: '15px', padding: '0.7em 0.9em' }} onClick={toggleRescheduleModal}>
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
                            value={{ value: reschedule.timezone, label: reschedule.timezoneLabel }}
                            onChange={handleRescheduleTimezoneChange}
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
                            value={reschedule.startDateTime || null}
                            onChange={date => handleRescheduleStartDateTimeChange(date)}
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
                            value={reschedule.endDateTime || null}
                            onChange={date => handleRescheduleEndDateTimeChange(date)}
                          />
                        </FormGroup>
                      </Row>
                      <Row>
                        <FormGroup style={{ margin: '0px 15px', width: '100%', marginBottom: '10px !important' }}>
                          <label htmlFor='resched-impact'>
                            New Impact
                          </label>
                          <FormInput id='resched-impact' name='resched-impact' type='text' value={reschedule.impact} onChange={handleRescheduleImpactChange} />
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
                            value={reschedule.reason}
                            onChange={handleRescheduleReasonChange}
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
                      <Button onClick={handleRescheduleSave} style={{ width: '100%', marginTop: '15px' }} theme='primary'>
                        Save
                      </Button>
                    </Col>
                  </Row>
                </ModalBody>
              </Rnd>
            ) : (
              null
            )}
          {openConfirmDeleteModal && (
            <Modal className='delete-modal' animation backdrop backdropClassName='modal-backdrop' open={openConfirmDeleteModal} size='md' toggle={toggleConfirmDeleteRescheduleModal}>
              <ModalHeader className='modal-delete-header'>
                Confirm Delete Reschedule
              </ModalHeader>
              <ModalBody>
                <Container className='container-border'>
                  <Row>
                    <Col>
                      Are you sure you want to delete reschedule: <b style={{ fontWeight: '900' }}> {rescheduleToDelete.id}</b>
                    </Col>
                  </Row>
                </Container>
                <Row style={{ marginTop: '20px' }}>
                  <Col>
                    <ButtonGroup style={{ width: '100%' }}>
                      <Button style={{ color: 'var(font-color)' }} onClick={toggleConfirmDeleteRescheduleModal} outline theme='secondary'>
                        Cancel
                      </Button>
                      <Button onClick={handleDeleteReschedule} theme='danger'>
                        Confirm
                      </Button>
                    </ButtonGroup>
                  </Col>
                </Row>
              </ModalBody>
            </Modal>
          )}
          {openConfirmFreezeModal && (
            <Modal className='confirm-freeze-modal' animation backdrop backdropClassName='modal-backdrop' open={openConfirmFreezeModal} size='md' toggle={toggleConfirmFreezeModal}>
              <ModalHeader className='modal-delete-header'>
                Confirm Freeze Send
              </ModalHeader>
              <ModalBody>
                <Container className='container-border'>
                  <Row>
                    <Col>
                      There is a network freeze for <b>{frozenCompany || ''}</b>. Are you sure you want to send this mail?
                    </Col>
                  </Row>
                </Container>
                <Row style={{ marginTop: '20px' }}>
                  <Col>
                    <ButtonGroup style={{ width: '100%' }}>
                      <Button style={{ color: 'var(font-color)' }} onClick={toggleConfirmFreezeModal} outline theme='secondary'>
                        Cancel
                      </Button>
                      <Button onClick={() => prepareDirectSend(frozenState.recipient, frozenState.cid, false)} theme='danger'>
                        Confirm
                      </Button>
                    </ButtonGroup>
                  </Col>
                </Row>
              </ModalBody>
            </Modal>
          )}
        </Card>
      </Layout>
    )
  } else {
    return <RequireLogin />
  }
}

Maintenance.getInitialProps = async ({ req }) => {
  const host = req ? req.headers['x-forwarded-host'] : window.location.hostname
  const protocol = 'https:'
  if (host.indexOf('localhost') > -1) {
    protocol = 'http:'
  }
  const pageRequest2 = `${protocol}//${host}/v1/api/count`
  const res2 = await fetch(pageRequest2)
  const count = await res2.json()
  let display
  if (count === 'No unread emails') {
    display = 0
  } else {
    display = count.count
  }
  if (req.query.id === 'NEW') {
    return {
      jsonData: { profile: req.query },
      unread: display,
      // night: query.night,
      session: await NextAuth.init({ req })
    }
  } else {
    const pageRequest = `${protocol}//${host}/api/maintenances/${req.query.id}`
    const res = await fetch(pageRequest)
    const json = await res.json()
    return {
      jsonData: json,
      unread: display,
      session: await NextAuth.init({ req })
    }
  }
}

export default Maintenance
