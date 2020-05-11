import React, { useState, useEffect, useRef } from 'react'
import NextAuth from 'next-auth/client'
import Layout from '../../components/layout'
import fetch from 'isomorphic-unfetch'
import RequireLogin from '../../components/require-login'
import './maintenance.css'
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
import ProtectedIcon from '../../components/ag-grid/protected'
import SentIcon from '../../components/ag-grid/sent'
import StartDateTime from '../../components/ag-grid/startdatetime'
import EndDateTime from '../../components/ag-grid/enddatetime'
import sentBtn from '../../components/ag-grid/sentBtn'
import sendMailBtns from '../../components/ag-grid/sendMailBtns'
import { AgGridReact } from 'ag-grid-react'
import dynamic from 'next/dynamic'
import ReadModal from '../../components/maintenance/readmodal'
import Store from '../../components/store'

import MaintPanel from '../../components/panel'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'

import Notify from '../../lib/notification'

import {
  Icon,
  Form,
  FormGroup,
  Input,
  InputGroup,
  ControlLabel,
  HelpBlock,
  Badge,
  Button,
  Whisper,
  Tooltip,
  Panel,
  IconButton,
  ButtonGroup,
  FlexboxGrid,
  Toggle,
  Grid,
  Row,
  Col,
  Loader,
  Progress,
  Modal,
  Container,
  Message,
  Avatar,
  SelectPicker,
  TagPicker
} from 'rsuite'

const Changelog = dynamic(
  () => import('../../components/maintenance/timeline'),
  { ssr: false }
)

const Maintenance = props => {
  const store = Store.useStore()
  const [maintenance, setMaintenance] = useState({
    incomingAttachments: [],
    incomingBody: props.jsonData.profile.body,
    timezone: 'Europe/Amsterdam',
    timezoneLabel: '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
    bearbeitetvon: '',
    maileingang: '',
    updatedAt: '',
    updatedBy: props.jsonData.profile.updatedBy || '',
    name: '',
    impact: '',
    location: '',
    reason: '',
    mailId: 'NT',
    calendarId: props.jsonData.profile.calendarId,
    maintNote: ''
  })
  const [frozenState, setFrozenState] = useState({
    recipient: '',
    cid: ''
  })
  const [frozenCompany, setFrozenCompany] = useState('')
  const [dateTimeWarning, setDateTimeWarning] = useState(false)
  const [openReadModal, setOpenReadModal] = useState(false)
  const [openPreviewModal, setOpenPreviewModal] = useState(false)
  const [openRescheduleModal, setOpenRescheduleModal] = useState(false)
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false)
  const [openConfirmFreezeModal, setOpenConfirmFreezeModal] = useState(false)
  const [openMaintenanceChangelog, setOpenMaintenanceChangelog] = useState(false)
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
  const [mailPreviewRecipients, setMailPreviewRecipients] = useState('')
  const [mailPreviewCustomerCID, setMailPreviewCustomerCid] = useState('')
  const [mailPreviewSubject, setMailPreviewSubject] = useState('')
  const [customerCids, setCustomerCids] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [supplierCids, setSupplierCids] = useState([])
  const [impactPlaceholder, setImpactPlaceholder] = useState([])
  const [selectedSupplierCids, setSelectedSupplierCids] = useState([])
  const [sentProgress, setSentProgress] = useState(0)

  const gridApi = useRef()
  const gridColumnApi = useRef()
  const rescheduleGridApi = useRef()

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
    loadingOverlayComponent: 'customLoadingOverlay',
    context: { moveCalendarEntry: moveCalendarEntry, toggleRescheduleSentBtn: toggleRescheduleSentBtn },
    frameworkComponents: {
      startdateTime: StartDateTime,
      enddateTime: EndDateTime,
      sentBtn: sentBtn,
      customLoadingOverlay: Loader
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
        pinned: 'right',
        cellStyle: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }
      }, {
        headerName: 'Mail',
        width: 80,
        sortable: false,
        filter: false,
        resizable: false,
        pinned: 'right',
        cellRenderer: 'sendMailBtn',
        cellStyle: { 'padding-right': '0px', 'padding-left': '10px' }
      }
    ],
    loadingOverlayComponent: 'customLoadingOverlay',
    context: { prepareDirectSend: prepareDirectSend, togglePreviewModal: togglePreviewModal },
    frameworkComponents: {
      sendMailBtn: sendMailBtns,
      protectedIcon: ProtectedIcon,
      sentIcon: SentIcon,
      customLoadingOverlay: Loader
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
    store.set('maintenance')(maintenance)
  }, [maintenance])

  useEffect(() => {
    store.set('impactPlaceholder')(impactPlaceholder)
  }, [impactPlaceholder])

  useEffect(() => {
    gridApi?.current?.showLoadingOverlay()
    selectedSupplierCids.forEach(id => {
      fetchCustomerCids(id)
    })
    gridApi?.current?.hideOverlay()
  }, [selectedSupplierCids])

  useEffect(() => {
    let lieferantDomain
    let localMaint
    if (props.jsonData.profile.id === 'NEW') {
      // prepare NEW maintenance
      const username = props.session.user.email.substr(0, props.session.user.email.indexOf('@'))
      const newMaint = {
        ...maintenance,
        ...props.jsonData.profile,
        bearbeitetvon: username,
        updatedAt: format(new Date(), 'MM.dd.yyyy HH:mm')
      }
      setMaintenance(newMaint)
      localMaint = newMaint
      lieferantDomain = props.jsonData.profile.name
    } else {
      // prepare page for existing maintenance
      fetch(`/api/reschedule?id=${props.jsonData.profile.id}`, {
        method: 'get'
      })
        .then(resp => resp.json())
        .then(data => {
          setRescheduleData(data.reschedules)
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
      fetchSupplierCids(props.jsonData.profile.lieferant)
    } else {
      fetch(`/api/companies/domain?id=${lieferantDomain}`, {
        method: 'get'
      })
        .then(resp => resp.json())
        .then(data => {
          if (!data.companyResults[0]) {
            fetchSupplierCids()
            return
          }
          const companyId = data.companyResults[0].id
          const companyName = data.companyResults[0].name
          setMaintenance({
            ...maintenance,
            ...localMaint,
            name: companyName,
            lieferant: companyId
          })
          fetchSupplierCids(companyId)
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
    store.set('maintenance')(maintenance)
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
    gridApi.current = params.api
    if (customerCids.length === 0) {
      gridApi.current.showLoadingOverlay()
    }
    gridColumnApi.current = params.gridColumnApi
  }

  /// /////////////////////////////////////////////////////////
  //
  //                ACTIONS: API CALLS
  //
  /// /////////////////////////////////////////////////////////

  // fetch supplier CIDs
  const fetchSupplierCids = lieferantId => {
    if (!lieferantId) {
      setSupplierCids([{ label: 'Invalid Supplier ID', value: '1' }])
      return
    }
    fetch(`/api/lieferantcids?id=${lieferantId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (!data.lieferantCIDsResult) {
          setSupplierCids([{ label: 'No CIDs available for this Supplier', value: '1' }])
          return
        }
        setSupplierCids(data.lieferantCIDsResult)
        const derenCIDids = props.jsonData.profile.derenCIDid
        if (derenCIDids.includes(',')) {
          let selectedCids = []
          derenCIDids
            .split(',')
            .forEach(x => {
              selectedCids.push(parseInt(x, 10))
            })
          setSelectedSupplierCids(selectedCids)
        } else {
          setSelectedSupplierCids([parseInt(derenCIDids, 10)])
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  // fetch customer CIDs based on selected Supplier CID
  const fetchCustomerCids = lieferantCidId => {
    if (!lieferantCidId) {
      gridApi.current.hideOverlay()
      return
    }
    fetch(`/api/customercids/${lieferantCidId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        let currentSentStatus = 0
        if (maintenance.done) {
          currentSentStatus = 1
        }
        const kundencids = data.kundenCIDsResult
        kundencids.forEach(cid => {
          cid.sent = currentSentStatus
          cid.frozen = false
        })
        const existingCustomerCids = customerCids
        kundencids.forEach(cid => {
          existingCustomerCids.push(cid)
        })
        const uniqueKundenCids = getUnique(existingCustomerCids, 'kundenCID')
        setCustomerCids(uniqueKundenCids)
        gridApi.current.hideOverlay()
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
          const localKundenCids = customerCids
          const frozenCidIndex = localKundenCids.findIndex(el => el.kunde === freezeEntry.companyId)
          Notify('error', 'CID Frozen', `${localKundenCids[frozenCidIndex].name} has an active network freeze at that time`)
          localKundenCids[frozenCidIndex].frozen = true
          setCustomerCids(localKundenCids)
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
  function prepareDirectSend (recipient, customerCID, frozen, companyName) {
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
    // const subject = `Planned Work Notification - NT-${maintenance.id}`
    const subject = generateMailSubject()
    sendMail(recipient, customerCID, subject, HtmlBody, false)
  }

  // generate Mail contents
  const generateMail = (customerCID, protection) => {
    console.log('store', !store.get('maintenance').id , !store.get('maintenance').startDateTime , !store.get('maintenance').endDateTime)
    console.log('hook', maintenance.id , maintenance.startDateTime , maintenance.endDateTime)

    if (store.get('maintenance').id === '' || store.get('maintenance').startDateTime === '' || store.get('maintenance').endDateTime === '') {
      Notify('warning', 'Missing Required Fields')
      return
    }

    const timezoneValue = store.get('maintenance').timezone || 'Europe/Dublin'
    const rawStart = moment.tz(store.get('maintenance').startDateTime, store.get('maintenance').timezoneValue)
    const rawEnd = moment.tz(store.get('maintenance').endDateTime, timezoneValue)
    const utcStart1 = rawStart.tz('GMT').format('YYYY-MM-DD HH:mm:ss')
    const utcEnd1 = rawEnd.tz('GMT').format('YYYY-MM-DD HH:mm:ss')
    const utcStart = props.jsonData.profile.startDateTime || utcStart1
    const utcEnd = props.jsonData.profile.endDateTime || utcEnd1

    let maintenanceIntro = 'We would like to inform you about planned work on the following CID(s):'
    const rescheduleText = ''
    const tzSuffixRAW = 'UTC / GMT+0:00'

    const cancelled = convertBool(store.get('maintenance').cancelled)
    if (cancelled) {
      maintenanceIntro = `We would like to inform you that these planned works (<b>NT-${store.get('maintenance').id}</b>) have been <b>cancelled</b> with the following CID(s):`
    }

    if (rescheduleData.length !== 0) {
      const latest = rescheduleData.length - 1
      const newStart = moment(rescheduleData[latest].startDateTime).format('YYYY-MM-DD HH:mm:ss')
      const newEnd = moment(rescheduleData[latest].endDateTime).format('YYYY-MM-DD HH:mm:ss')
      const newImpact = rescheduleData[latest].impact
      const newReason = rescheduleData[latest].reason.toLowerCase()
      const rcounter = rescheduleData[latest].rcounter
      if (cancelled && rescheduleData[latest]) {
        maintenanceIntro = `We would like to inform you that these rescheduled planned works (<b>NT-${store.get('maintenance').id}-${rcounter}</b>) have been <b>cancelled</b>.<br><br>We are sorry for any inconveniences this may have caused.<br><footer>​<style>.sig{font-family:Century Gothic, sans-serif;font-size:9pt;color:#636266!important;}b.i{color:#4ca702;}.gray{color:#636266 !important;}a{text-decoration:none;color:#636266 !important;}</style><div class="sig"><div>Best regards <b class="i">|</b> Mit freundlichen Grüßen</div><br><div><b>Newtelco Maintenance Team</b></div><br><div>NewTelco GmbH <b class="i">|</b> Moenchhofsstr. 24 <b class="i">|</b> 60326 Frankfurt a.M. <b class="i">|</b> DE <br>www.newtelco.com <b class="i">|</b> 24/7 NOC  49 69 75 00 27 30 ​​<b class="i">|</b> <a style="color:#" href="mailto:service@newtelco.de">service@newtelco.de</a><br><br><div><img alt="sig" src="https://home.newtelco.de/sig.png" height="29" width="516"></div></div>​</footer><hr />`
      }
      maintenanceIntro += `We regret to inform you that the planned works have been <b>rescheduled</b> on the following CID(s):\n\n<br><br><b>${customerCID}</b><br><br>The maintenance has been rescheduled due to ${newReason}.<br><br>The new details are as follows:<br><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>NT-${store.get('maintenance').id}-${rcounter}</b></td></tr><tr><td>New Start date and time:</td><td><b>${newStart} (${tzSuffixRAW})</b></td></tr><tr><td>New Finish date and time:</td><td><b>${newEnd} (${tzSuffixRAW})</b></td></tr><tr><td>New Impact:</td><td><b>${newImpact}</b></td></tr></table><br>Thank you very much for your patience and cooperation.<br>`

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
          maintenanceIntro += `<br>This maintenance had been rescheduled due to ${newReason}.<br><br>The previous details were as follows:<br><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>NT-${store.get('maintenance').id}-${rcounter}</b></td></tr><tr><td>Previous Start date and time:</td><td><b>${newStart} (${tzSuffixRAW})</b></td></tr><tr><td>Previous Finish date and time:</td><td><b>${newEnd} (${tzSuffixRAW})</b></td></tr><tr><td>Previous Impact:</td><td><b>${newImpact}</b></td></tr></table>`
        }
      }
      maintenanceIntro += '<br><hr><i><b>Original Planned Works:</b></i><br><br>Dear Colleagues,<br><br>We would like to inform you about planned work on the following CID(s):\n'
    }

    let body = `<body style="color:#666666;">${rescheduleText} Dear Colleagues,​​<p><span>${maintenanceIntro}<br><br> <b>${customerCID}</b> <br><br>The maintenance work is with the following details:</span></p><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>NT-${store.get('maintenance').id}</b></td></tr><tr><td>Start date and time:</td><td><b>${utcStart} (${tzSuffixRAW})</b></td></tr><tr><td>Finish date and time:</td><td><b>${utcEnd} (${tzSuffixRAW})</b></td></tr>`
    if (store.get('maintenance').impact || protection || impactPlaceholder) {
      if (convertBool(protection)) {
        body = body + '<tr><td>Impact:</td><td>50ms Protection Switch</td></tr>'
      } else {
        const impactText = store.get('maintenance').impact || store.get('impactPlaceholder')
        body = body + '<tr><td>Impact:</td><td>' + impactText + '</td></tr>'
      }
    }

    if (store.get('maintenance').location) {
      body = body + '<tr><td>Location:</td><td>' + store.get('maintenance').location + '</td></tr>'
    }

    if (store.get('maintenance').reason) {
      if (store.get('maintenance').reason.includes('%20')) {
        body = body + '<tr><td>Reason:</td><td>' + decodeURIComponent(store.get('maintenance').reason) + '</td></tr>'
      } else {
        body = body + '<tr><td>Reason:</td><td>' + store.get('maintenance').reason + '</td></tr>'
      }
    }

    let maintNoteBody = ''
    if (store.get('maintenance').maintNote) {
      if (store.get('maintenance').maintNote.includes('%20')) {
        maintNoteBody = '<p>' + decodeURIComponent(store.get('maintenance').maintNote) + '</p>'
      } else {
        maintNoteBody = '<p>' + store.get('maintenance').maintNote + '</p>'
      }
    }

    body = body + `</table>${maintNoteBody}<p>We sincerely regret any inconvenience that may be caused by this and hope for further mutually advantageous cooperation.</p><p>If you have any questions feel free to contact us at maintenance@newtelco.de.</p></div>​​</body>​​<footer>​<style>.sig{font-family:Century Gothic, sans-serif;font-size:9pt;color:#636266!important;}b.i{color:#4ca702;}.gray{color:#636266 !important;}a{text-decoration:none;color:#636266 !important;}</style><div class="sig"><div>Best regards <b class="i">|</b> Mit freundlichen Grüßen</div><br><div><b>Newtelco Maintenance Team</b></div><br><div>NewTelco GmbH <b class="i">|</b> Moenchhofsstr. 24 <b class="i">|</b> 60326 Frankfurt a.M. <b class="i">|</b> DE <br>www.newtelco.com <b class="i">|</b> 24/7 NOC  49 69 75 00 27 30 ​​<b class="i">|</b> <a style="color:#" href="mailto:service@newtelco.de">service@newtelco.de</a><br><br><div><img alt="sig" src="https://home.newtelco.de/sig.png" height="29" width="516"></div></div>​</footer>`

    return body
  }

  // send out the created mail
  const sendMail = (recipient, customerCid, subj, htmlBody, isFromPreview, isFromSendAll) => {
    const activeRowIndex = customerCids.findIndex(el => el.kundenCID === customerCid)
    const kundenCidRow = customerCids[activeRowIndex]
    if (kundenCidRow && kundenCidRow.frozen) {
      setFrozenCompany(kundenCidRow.name || '')
      setFrozenState({
        recipient: recipient,
        cid: customerCid
      })
      toggleConfirmFreezeModal()
      return
    }
    const body = htmlBody || mailBodyText
    let subject = subj || mailPreviewSubject
    const to = recipient || mailPreviewRecipients

    if (convertBool(maintenance.emergency)) {
      subject = `[EMERGENCY] ${subject}`
    }
    if (convertBool(maintenance.cancelled)) {
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
          const activeRowIndex = customerCids.findIndex(el => el.kundenCID === customerCid)
          const kundenCidRow = customerCids[activeRowIndex]
          if (maintenance.cancelled === true && maintenance.done === true) {
            kundenCidRow.sent = 2
          } else {
            kundenCidRow.sent = 1
          }
          const updatedKundenCids = [
            ...customerCids,
            kundenCidRow
          ]
          const deduplicatedKundenCids = getUnique(updatedKundenCids, 'kundenCID')
          setCustomerCids(deduplicatedKundenCids)
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
          updateSentProgress()
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
        const subject = generateMailSubject()
        // const subject = `Planned Work Notification - NT-${maintenance.id}`
        sendMail(node.data.maintenanceRecipient, node.data.kundenCID, subject, HtmlBody, false, true)
        Notify('success', `Mail Sent - ${node.data.name}`)
        if (index === rowCount) {
          Notify('success', 'All Mails Sent!')
        }
      }, 500 * (index + 1))
    })
  }

  const updateSentProgress = () => {
    if (customerCids.length !== 0) {
      let progressSent = 0
      customerCids.forEach(cid => {
        if (cid.sent === 1 || cid.sent === 2) {
          progressSent += 1
        }
      })
      const result = (progressSent / customerCids.length) * 100
      setSentProgress(result)
    }
  }

  function moveCalendarEntry (startDateTime, endDateTime, rcounter) {
    const calId = maintenance.calendarId
    const company = maintenance.name
    const maintId = maintenance.id

    let derenCid = ''
    selectedSupplierCids.forEach(cid => {
      derenCid = derenCid + cid.label + ' '
    })
    derenCid = derenCid.trim()

    let cids = ''
    customerCids.forEach(cid => {
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
    selectedSupplierCids.forEach(cid => {
      derenCid = derenCid + cid.label + ' '
    })
    derenCid = derenCid.trim()

    let cids = ''
    customerCids.forEach(cid => {
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
  const handleSelectSupplierChange = selectedOption => {
    if (selectedOption) {
      setSelectedSupplierCids(selectedOption)
    } else {
      setSelectedSupplierCids([])
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
        _csrf: props.session.accessToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status !== 200) {
          Notify('error', 'Datetime Not Saved')
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
      customerCids.forEach(cid => {
        impactedCIDs += cid.kundenCID + ' '
      })

      impactedCIDs = impactedCIDs.trim()

      setMaintenance({ ...maintenance, betroffeneCIDs: impactedCIDs, [element]: newValue })

      if (maintenance.receivedmail !== 'NT') {
        fetch('/v1/api/inbox/markcomplete', {
          method: 'post',
          body: JSON.stringify({ m: maintenance.receivedmail }),
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

      fetch(`/api/maintenances/save/impactedcids?cids=${impactedCIDs}&maintId=${maintenance.id}&updatedby=${activeUser}`, {
        method: 'get',
        headers: {
          'Access-Control-Allow-Origin': '*',
          _csrf: props.session.accessToken
        }
      })
        .then(resp => resp.json())
        .then(data => {
          if (!data.status === 200) {
            Notify('error', 'Impacted CIDs Not Saved')
          }
        })
        .catch(err => console.error(`Error - ${err}`))

      // TODO: Check whats up here
      // update Algolia Index
      // fetch('/v1/api/search/update', {
      //   method: 'get'
      // })
    }

    if (maintId === 'NEW') {
      Notify('error', 'No CID Assigned', 'Cannot save updates.')
      return
    }
    fetch(`/api/maintenances/save/toggle?maintId=${maintId}&element=${element}&value=${newValue}&updatedby=${activeUser}`, {
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        _csrf: props.session.accessToken
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

  const handleReasonChange = (value) => {
    setMaintenance({ ...maintenance, reason: encodeURIComponent(value) })
  }

  const handleMaintNoteChange = (value) => {
    setMaintenance({ ...maintenance, maintNote: encodeURIComponent(value) })
  }

  const handleLocationChange = (value) => {
    setMaintenance({ ...maintenance, location: value })
  }

  const handleImpactChange = (value) => {
    setMaintenance({ ...maintenance, impact: value })
  }

  const handleTimezoneChange = (selection) => {
    const timezoneLabel = selection.label // 'Europe/Amsterdam'
    const timezoneValue = selection.value // '(GMT+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna'

    setMaintenance({ ...maintenance, timezone: timezoneValue, timezoneLabel: timezoneLabel })
  }

  const handleSupplierChange = (selectedOption) => {
    const selectedSupplier = suppliers.find(x => x.value === selectedOption)
    setMaintenance({ ...maintenance, lieferant: selectedOption, name: selectedSupplier.label })
    setSelectedSupplierCids([])
    setCustomerCids([])
    fetchSupplierCids(selectedOption)
  }

  /// /////////////////////////////////////////////////////////
  //
  //                INPUTS: ONBLUR
  //
  /// /////////////////////////////////////////////////////////

  const handleDateTimeBlur = (element) => {
    Notify('success', 'Save Success')
  }

  const handleCIDBlur = () => {
    const postSelection = (id) => {
      let idParameter
      if (Array.isArray(id)) {
        idParameter = id.join(',')
      } else {
        idParameter = id
      }
      if (idParameter === props.jsonData.profile.derenCIDid) {
        return true
      }
      if (maintenance.id === 'NEW') {
        Notify('error', 'Cannot Save', 'No CID Assigned')
        return
      }
      const activeUserEmail = props.session.user.email
      const activeUser = activeUserEmail.substring(0, activeUserEmail.lastIndexOf('@'))
      fetch(`/api/maintenances/save/lieferant?maintId=${maintenance.id}&cid=${idParameter}&updatedby=${activeUser}`, {
        method: 'get',
        headers: {
          'Access-Control-Allow-Origin': '*',
          _csrf: props.session.accessToken
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
    postSelection(selectedSupplierCids)
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
        _csrf: props.session.accessToken
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
        _csrf: props.session.accessToken
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
        _csrf: props.session.accessToken
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
        _csrf: props.session.accessToken
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
          } else {
            mailBody = `<pre>${data.body}</pre>`
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
  }

  function togglePreviewModal (recipient, customerCID, protection) {
    if (recipient && customerCID) {
      const HtmlBody = generateMail(customerCID, protection)
      if (HtmlBody) {
        setMailBodyText(HtmlBody)
        setMailPreviewRecipients(recipient || mailPreviewRecipients)
        setMailPreviewCustomerCid(customerCID)
        generateMailSubject()
        setOpenPreviewModal(!openPreviewModal)
      }
    } else {
      generateMailSubject()
      setOpenPreviewModal(!openPreviewModal)
    }
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

  function toggleRescheduleSentBtn (rcounter) {
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


  const handleProtectionSwitch = () => {
    setMaintenance({ ...maintenance, impact: '50ms protection switch' })
    handleTextInputBlur('impact')
  }

  const useImpactPlaceholder = () => {
    setMaintenance({ ...maintenance, impact: impactPlaceholder })
    handleTextInputBlur('impact')
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

  const generateMailSubject = () => {
    let text = rescheduleData.length !== 0 ? ' [RESCHEDULED]' : ''
    text += maintenance.emergency ? ' [EMERGENCY]' : ''
    text += maintenance.cancelled ? ' [CANCELLED]' : ''
    text += ' Planned Work Notification - NT-' + store.get('maintenance').id
    if (rescheduleData.length !== 0) {
      text += rescheduleData.length !== 0 && '-' + rescheduleData[rescheduleData.length - 1].rcounter
    }
    setMailPreviewSubject(text)
    return text
  }

  /// /////////////////////////////////////////////////////////
  //
  //                      RENDER
  //
  /// /////////////////////////////////////////////////////////

  let maintenanceIdDisplay
  if (maintenance.id === 'NEW') {
    maintenanceIdDisplay = maintenance.id
  } else {
    maintenanceIdDisplay = `NT-${maintenance.id}`
  }

  if (props?.session?.user) {
    const HeaderLeft = () => {
      return (
        <ButtonGroup size='md'>
          <IconButton appearance='ghost' onClick={() => Router.back()} icon={<Icon icon='chevron-left' />}>
              Back
          </IconButton>
          <Whisper placement='bottom' speaker={<Tooltip>Open Incoming Mail</Tooltip>}>
            <IconButton appearance='ghost' onClick={toggleReadModal} icon={<Icon icon='at' />}>
              Read
            </IconButton>
          </Whisper>
        </ButtonGroup>
      )
    }

    const HeaderCenter = () => {
      return (
        <Badge content={maintenanceIdDisplay} className='header-badge'>
          <Button appearance='subtle' size='lg' style={{ fontSize: '1.1em', fontWeight: '200', border: '1px solid var(--grey2)' }}>
            {maintenance.name}
          </Button>
        </Badge>
      )
    }

    const HeaderRight = () => {
      return (
        <ButtonGroup size='md'>
          <Whisper placement='bottom' speaker={<Tooltip>Create New Reschedule</Tooltip>}>
            <IconButton appearance='ghost' onClick={toggleRescheduleModal} icon={<Icon icon='clock-o' />}>
              Reschedule
            </IconButton>
          </Whisper>
          <Whisper placement='bottom' speaker={<Tooltip>Create Calendar Entry</Tooltip>}>
            <IconButton appearance='ghost' onClick={handleCalendarCreate} icon={<Icon icon='calendar' />}>
              Create
            </IconButton>
          </Whisper>
          {maintenance.id === 'NEW'
            ? (
              <Whisper placement='bottom' speaker={<Tooltip>Create New Maintenance</Tooltip>}>
                <IconButton appearance='ghost' onClick={handleCreateOnClick} icon={<Icon icon='plus' />} className='create-btn'>
                  Save
                </IconButton>
              </Whisper>
            ) : (
              <Whisper placement='bottom' speaker={<Tooltip>Send All Notifications</Tooltip>}>
                <IconButton appearance='ghost' onClick={handleSendAll} icon={<Icon icon='envelope-o' />}>
                  Send
                </IconButton>
              </Whisper>
            )}
        </ButtonGroup>
      )
    }

    return (
      <Layout count={props.unread} session={props.session}>
        {maintenance.id === 'NEW' && (
          <Message full showIcon type="warning" description="Remember to Save before continuing to work!" style={{ position: 'fixed', zIndex: '999' }} />
        )}
        <Helmet>
          <title>{`Newtelco Maintenance - NT-${maintenance.id}`}</title>
        </Helmet>
        <MaintPanel header={<HeaderLeft />} center={<HeaderCenter />} buttons={<HeaderRight />}>
          <FlexboxGrid justify='space-around' align='top' style={{ width: '100%' }}>
            <FlexboxGrid.Item colspan={11} style={{ margin: '0 10px' }}>
              <Form>
                <Panel bordered>
                  <Grid fluid>
                    <Row gutter={20} style={{ marginBottom: '20px' }}>
                      <Col sm={12} xs={24}>
                        <FormGroup>
                          <ControlLabel htmlFor='edited-by'>Created By</ControlLabel>
                          <Input tabIndex='-1' readOnly id='edited-by-input' name='edited-by' type='text' value={maintenance.bearbeitetvon} />
                        </FormGroup>
                      </Col>
                      <Col sm={12} xs={24}>
                        <FormGroup>
                          <ControlLabel htmlFor='maileingang'>Mail Arrived</ControlLabel>
                          <Input tabIndex='-1' readOnly id='maileingang-input' name='maileingang' type='text' value={convertDateTime(maintenance.maileingang)} />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row gutter={20} style={{ marginBottom: '20px' }}>
                      <Col sm={12} xs={24}>
                        <FormGroup>
                          <ControlLabel htmlFor='supplier'>Timezone</ControlLabel>
                          <TimezoneSelector
                            style={{ borderColor: '#e5e5ea' }}
                            value={{ value: maintenance.timezone, label: maintenance.timezoneLabel }}
                            onChange={handleTimezoneChange}
                            onBlur={handleTimezoneBlur}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={12} xs={24}>
                        <FormGroup>
                          <ControlLabel htmlFor='supplier'>Supplier</ControlLabel>
                          <SelectPicker
                            style={{ width: '100%' }}
                            value={maintenance.lieferant}
                            // value={{ label: maintenance.name, value: maintenance.lieferant }}
                            onChange={handleSupplierChange}
                            data={suppliers}
                            placeholder='Please select a Supplier'
                            onExit={handleSupplierBlur}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row gutter={20} style={{ marginBottom: '20px' }}>
                      <Col sm={12} xs={24}>
                        <FormGroup>
                          <ControlLabel htmlFor='start-datetime'>Start Date/Time</ControlLabel>
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
                      <Col sm={12} xs={24}>
                        <FormGroup>
                          <ControlLabel htmlFor='end-datetime'>End Date/Time</ControlLabel>
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
                    <Row gutter={20} style={{ marginBottom: '20px' }}>
                      <Col sm={24}>
                        <FormGroup>
                          <ControlLabel htmlFor='their-cid'>{maintenance.name} CID</ControlLabel>
                          <TagPicker
                            block
                            value={selectedSupplierCids || undefined}
                            onChange={handleSelectSupplierChange}
                            data={supplierCids}
                            cleanable
                            placeholder='Please select a CID'
                            onExit={handleCIDBlur}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row gutter={20} style={{ marginBottom: '20px' }}>
                      <Col sm={12} xs={24}>
                        <FormGroup>
                          <ControlLabel htmlFor='impact' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Impact
                            <ButtonGroup size='sm' style={{ float: 'right' }}>
                              <Whisper placement='bottom' speaker={<Tooltip>Use 50ms Protection Switch Text</Tooltip>}>
                                <IconButton id='protectionswitchtext' onClick={handleProtectionSwitch} size='sm' icon={<Icon icon='clock-o' />} />
                              </Whisper>
                              <Whisper placement='bottom' speaker={<Tooltip>Use Time Difference Text</Tooltip>}>
                                <IconButton id='impactplaceholdertext' onClick={useImpactPlaceholder} size='sm' icon={<Icon icon='history' />} />
                              </Whisper>
                            </ButtonGroup>
                          </ControlLabel>
                          <Input onBlur={() => handleTextInputBlur('impact')} id='impact' name='impact' type='text' onChange={handleImpactChange} placeholder={impactPlaceholder} value={maintenance.impact || ''} />
                        </FormGroup>
                      </Col>
                      <Col sm={12} xs={24}>
                        <FormGroup style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '70px' }}>
                          <ControlLabel htmlFor='location' style={{ marginBottom: '10px' }}>Location</ControlLabel>
                          <Input onBlur={() => handleTextInputBlur('location')} id='location' name='location' type='text' onChange={handleLocationChange} value={maintenance.location || ''} />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row gutter={20} style={{ marginBottom: '20px' }}>
                      <Col sm={24}>
                        <FormGroup>
                          <ControlLabel htmlFor='reason'>Reason</ControlLabel>
                          <Input
                            id='reason'
                            name='reason'
                            componentClass='textarea'
                            rows={3}
                            onBlur={() => handleTextInputBlur('reason')}
                            onChange={handleReasonChange}
                            type='text'
                            value={maintenance.reason ? decodeURIComponent(maintenance.reason) : ''}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row gutter={20} style={{ marginBottom: '20px' }}>
                      <Col sm={24}>
                        <FormGroup>
                          <ControlLabel htmlFor='maintNote'>
                            Note
                            <HelpBlock style={{ float: 'right' }} tooltip>
                              This note will be included in the mail
                            </HelpBlock>
                          </ControlLabel>
                          <Input
                            componentClass='textarea'
                            rows={3}
                            id='maintNote'
                            name='maintNote'
                            onBlur={() => handleTextInputBlur('maintNote')}
                            onChange={handleMaintNoteChange}
                            type='text'
                            value={maintenance.maintNote ? decodeURIComponent(maintenance.maintNote) : ''}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row gutter={20} style={{ marginBottom: '20px' }}>
                      <Col xs={8} style={{ display: 'flex', justifyContent: 'center' }}>
                        <FormGroup style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <ControlLabel>
                            Cancelled
                          </ControlLabel>
                          <Toggle
                            size='lg'
                            checkedChildren={<Icon icon='ban' inverse />}
                            checked={maintenance.cancelled === 'false' ? false : !!maintenance.cancelled}
                            onChange={(event) => handleToggleChange('cancelled', event)}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs={8} style={{ display: 'flex', justifyContent: 'center' }}>
                        <FormGroup style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <ControlLabel>
                            Emergency
                          </ControlLabel>
                          <Toggle
                            size='lg'
                            checkedChildren={<Icon inverse icon='hospital-o' />}
                            checked={maintenance.emergency === 'false' ? false : !!maintenance.emergency}
                            onChange={(event) => handleToggleChange('emergency', event)}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs={8} style={{ display: 'flex', justifyContent: 'center' }}>
                        <FormGroup style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <ControlLabel>
                            Done
                          </ControlLabel>
                          <Toggle
                            size='lg'
                            checkedChildren={<Icon inverse icon='check' />}
                            checked={maintenance.done === 'false' ? false : !!maintenance.done}
                            onChange={(event) => handleToggleChange('done', event)}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row gutter={20} style={{ marginBottom: '20px' }}>
                      <Col>
                        <FormGroup>
                          <ControlLabel htmlFor='notes'>Private Notes</ControlLabel>
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
                  </Grid>
                </Panel>
              </Form>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={11} style={{ margin: '0 10px' }}>
              <Panel bordered>
                <Grid fluid>
                  <Row>
                    <Col>
                      {openMaintenanceChangelog
                        ? (
                          <CSSTransition
                            timeout={500}
                            classNames='flip-transition'
                            in={openMaintenanceChangelog}
                          >
                            <Row>
                              <Col>
                                <Container style={{ padding: '20px' }}>
                                  <Row>
                                    <FlexboxGrid justify='space-between' align='middle'>
                                      <FlexboxGrid.Item>
                                        <span style={{ color: 'var(--grey4)', fontFamily: 'var(--font-body)', fontWeight: '100 !important', fontSize: '1.5rem' }}>Maintenance History</span>
                                      </FlexboxGrid.Item>
                                      <FlexboxGrid.Item>
                                        <Whisper placement='left' speaker={<Tooltip>View Mails</Tooltip>}>
                                          <IconButton
                                            size='lg'
                                            onClick={toggleHistoryView}
                                            icon={<Icon icon='history' />}
                                          />
                                        </Whisper>
                                      </FlexboxGrid.Item>
                                    </FlexboxGrid>
                                  </Row>
                                  <Row>
                                    <Col>
                                      <Changelog maintId={maintenance.id} />
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
                                <Container>
                                  <Row>
                                    <FlexboxGrid justify='space-between' align='middle' style={{ margin: '0px 20px 10px 20px' }}>
                                      <FlexboxGrid.Item>
                                        <span style={{ color: 'var(--grey4)', fontFamily: 'var(--font-body)', fontWeight: '100 !important', fontSize: '1.5rem' }}>Customer CIDs</span>
                                      </FlexboxGrid.Item>
                                      <FlexboxGrid.Item>
                                        <Whisper placement='left' speaker={<Tooltip>View Changelog</Tooltip>}>
                                          <IconButton
                                            size='lg'
                                            onClick={toggleHistoryView}
                                            icon={<Icon icon='history' />}
                                          />
                                        </Whisper>
                                      </FlexboxGrid.Item>
                                    </FlexboxGrid>
                                  </Row>
                                  <Row>
                                    <Col>
                                      <Progress.Line percent={sentProgress} showInfo={false} />
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
                                          rowData={customerCids}
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
                                {rescheduleData.length !== 0 && (
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
                                )}
                              </Col>
                            </Row>
                          </CSSTransition>
                        )}
                    </Col>
                  </Row>
                </Grid>
              </Panel>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </MaintPanel>
        {typeof window !== 'undefined' && openReadModal && (
          <ReadModal
            maintenance={maintenance}
            openReadModal={openReadModal}
            toggleReadModal={toggleReadModal}
            incomingAttachments={maintenance.incomingAttachments}
            jsonData={props.jsonData}
          />
        )}
        {openPreviewModal && (
          <Modal className='modal-preview-send' backdrop size='lg' show={openPreviewModal} onHide={togglePreviewModal}>
            <Modal.Header>
              <FlexboxGrid justify='start' align='middle' style={{ width: '100%' }}>
                <FlexboxGrid.Item colspan={2} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    size='lg'
                    src={'/v1/api/faviconUrl?d=newtelco.de'}
                    style={{ backgroundColor: 'transparent' }}
                  />
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={20}>
                  <div className='modal-preview-text-wrapper'>
                    <InputGroup className='modal-textbox' >
                      <InputGroup.Addon style={{ height: '31px' }} type='prepend'>
                        To
                      </InputGroup.Addon>
                      <Input readOnly value={mailPreviewRecipients.toLowerCase()} />
                    </InputGroup>
                    <InputGroup className='modal-textbox' >
                      <InputGroup.Addon style={{ height: '31px' }} type='prepend'>
                        CC
                      </InputGroup.Addon>
                      <Input type='text' readOnly value='service@newtelco.de' />
                    </InputGroup>
                    <InputGroup className='modal-textbox' >
                      <InputGroup.Addon style={{ height: '31px' }} type='prepend'>
                        Subject 
                      </InputGroup.Addon>
                      <Input type='text' readOnly value={mailPreviewSubject} />
                    </InputGroup>
                  </div>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={1} style={{ marginLeft: '30px' }}>
                  <Whisper speaker={<Tooltip>Send Mail</Tooltip>} placement='bottom'>
                    <IconButton
                      onClick={() => sendMail(mailPreviewRecipients, mailPreviewCustomerCID, mailPreviewSubject, mailBodyText, true)}
                      appearance='ghost'
                      style={{ color: 'var(--grey4)' }}
                      size='lg'
                      icon={<Icon icon='send' />}
                    />
                  </Whisper>
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </Modal.Header>
            <Modal.Body>
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

            </Modal.Body>
          </Modal>
        )}
        {typeof window !== 'undefined' && openRescheduleModal && (
          <Rnd
            default={{
              x: window.outerWidth - (window.outerWidth / 1.5),
              y: 25,
              width: 600,
              height: 565
            }}
            style={{
              backgroundColor: 'var(--background)',
              overflow: 'hidden',
              borderRadius: '5px',
              height: 'auto',
              zIndex: '101',
              boxShadow: '0px 0px 10px 1px var(--grey3)'
            }}
            bounds='window'
            dragHandleClassName='reschedule-header'
          >
            <Modal.Header className='reschedule reschedule-header'>
              <span style={{ flexGrow: '1' }}>
                  Reschedule Maintenance
              </span>
              <Badge>
                {rescheduleData.length + 1}
              </Badge>
              <IconButton onClick={toggleRescheduleModal} icon={<Icon icon='close' />} />
            </Modal.Header>
            <Modal.Body className='modal-body reschedule'>
              <Container style={{ paddingTop: '0px !important' }} className='container-border'>
                <Col>
                  <Row style={{ display: 'flex', flexWrap: 'nowrap' }}>
                    <FormGroup style={{ margin: '0 15px', width: '100%' }}>
                      <label htmlFor='supplier'>Timezone</label>
                      <TimezoneSelector
                        style={{ borderColor: '#e5e5ea' }}
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
                      <Input id='resched-impact' name='resched-impact' type='text' value={reschedule.impact} onChange={handleRescheduleImpactChange} />
                    </FormGroup>
                  </Row>
                  <Row>
                    <FormGroup style={{ margin: '0px 15px', width: '100%', marginBottom: '10px !important' }}>
                      <label htmlFor='resched-reason'>
                          Reason for Reschedule
                      </label>
                      <SelectPicker
                        cleanable
                        placement='top'
                        searchable={false}
                        value={reschedule.reason}
                        onChange={handleRescheduleReasonChange}
                        placeholder='Please select a reason for reschedule'
                        data={[
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
                      />
                    </FormGroup>
                  </Row>
                </Col>
              </Container>
              <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Col>
                  <Button onClick={handleRescheduleSave} style={{ width: '100%', marginTop: '15px' }}>
                      Save
                  </Button>
                </Col>
              </Row>
            </Modal.Body>
          </Rnd>
        )}
        {openConfirmDeleteModal && (
          <Modal className='delete-modal' animation backdrop backdropClassName='modal-backdrop' open={openConfirmDeleteModal} size='md' toggle={toggleConfirmDeleteRescheduleModal}>
            <Modal.Header className='modal-delete-header'>
                Confirm Delete Reschedule
            </Modal.Header>
            <Modal.Body>
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
                    <Button style={{ color: 'var(font-color)' }} onClick={toggleConfirmDeleteRescheduleModal}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteReschedule}>
                        Confirm
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </Modal.Body>
          </Modal>
        )}
        {openConfirmFreezeModal && (
          <Modal className='confirm-freeze-modal' animation backdrop backdropClassName='modal-backdrop' open={openConfirmFreezeModal} size='md' toggle={toggleConfirmFreezeModal}>
            <Modal.Header className='modal-delete-header'>
                Confirm Freeze Send
            </Modal.Header>
            <Modal.Body>
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
                    <Button style={{ color: 'var(font-color)' }} onClick={toggleConfirmFreezeModal}>
                        Cancel
                    </Button>
                    <Button onClick={() => prepareDirectSend(frozenState.recipient, frozenState.cid, false)}>
                        Confirm
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </Modal.Body>
          </Modal>
        )}
      </Layout>
    )
  } else {
    return <RequireLogin />
  }
}

export async function getServerSideProps ({ req, query }) {
  const session = await NextAuth.session({ req })
  const host = req ? req.headers['x-forwarded-host'] : window.location.hostname
  let protocol = 'https:'
  if (host.indexOf('localhost') > -1) {
    protocol = 'http:'
  }
  if (query.id === 'NEW') {
    return {
      props: {
        jsonData: { profile: query },
        session
      }
    }
  } else {
    const pageRequest = `${protocol}//${host}/api/maintenances/${query.id}`
    const res = await fetch(pageRequest)
    const json = await res.json()
    return {
      props: {
        jsonData: json,
        session
      }
    }
  }
}

export default Maintenance
