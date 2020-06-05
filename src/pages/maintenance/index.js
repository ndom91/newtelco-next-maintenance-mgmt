import React, { useState, useEffect, useRef } from 'react'
import NextAuth from 'next-auth/client'
import Layout from '@/newtelco/layout'
import RequireLogin from '@/newtelco/require-login'
import './maintenance.css'
import Router, { useRouter } from 'next/router'
import { Helmet } from 'react-helmet'
import MailEditor from '@/newtelco/maintenance/mailEditor'
import { format, isValid, formatDistance, parseISO } from 'date-fns'
import moment from 'moment-timezone'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/airbnb.css'
import { getUnique, convertDateTime } from '@/newtelco/maintenance/helper'
import ProtectedIcon from '@/newtelco/ag-grid/protected'
import SentIcon from '@/newtelco/ag-grid/sent'
import { AgGridReact } from 'ag-grid-react'
import dynamic from 'next/dynamic'
import ReadModal from '@/newtelco/maintenance/readmodal'
import Store from '@/newtelco/store'
import ConfirmModal from '@/newtelco/confirmmodal'
import CommentList from '@/newtelco/maintenance/comments/list'
import MaintPanel from '@/newtelco/panel'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import Notify from '@/newtelco-utils/notification'
import { Formik, FastField, Field, useFormikContext } from 'formik'
import tzOptions from '@/newtelco/maintenance/timezoneOptions'
import Select from 'react-select'
import debounce from 'just-debounce-it'
import objDiff from '@/newtelco-utils/objdiff'
import RescheduleGrid from '@/newtelco/maintenance/reschedule'

import {
  Icon,
  FormGroup,
  Input,
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
  Container,
  Message,
  SelectPicker,
  TagPicker,
  Nav
} from 'rsuite'

const Changelog = dynamic(
  () => import('@/newtelco/maintenance/timeline'),
  { ssr: false }
)

const MyTextarea = ({ field, form }) => {
  return (
    <Input
      rows={3}
      type='text'
      key={field.name}
      componentClass='textarea'
      name={field.name}
      value={field.value}
      validateOnChange={false}
      validateOnBlur={false}
      onChange={option => form.setFieldValue(field.name, option)}
    />
  )
}

const MyDateTime = ({ field, form }) => {
  return (
    <Flatpickr
      name={field.name}
      value={field.value}
      data-enable-time
      validateOnChange={false}
      validateOnBlur={false}
      onChange={option => form.setFieldValue(field.name, option[0])}
      options={{ time_24hr: 'true', allow_input: 'true' }}
      className='flatpickr end-date-time'
    />
  )
}

const MyTagPicker = ({ field, form, ...props }) => {
  return (
    <TagPicker
      name={field.name}
      value={field.value}
      onChange={option => {
        form.setFieldValue(field.name, option)
        if (!option && props.customerCids.length) {
          props.setCustomerCids([])
        }
      }}
      onClose={() => {
        if (field.value?.length) {
          props.fetchCustomerCids(field.value)
        } else {
          props.setCustomerCids([])
        }
      }}
      onClean={() => {
        props.setCustomerCids([])
      }}
      data={props.supplierCids}
      block
      cleanable
      validateOnChange={false}
      validateOnBlur={false}
      placeholder='Please select a CID'
    />
  )
}

const AutoSave = ({ debounceMs, id }) => {
  const formik = useFormikContext()
  const [lastSaved, setLastSaved] = React.useState(null)
  const debouncedSubmit = React.useCallback(
    debounce(
      () =>
        formik.submitForm().then(() => setLastSaved(new Date().toLocaleString('de-DE'))),
      debounceMs
    ),
    [debounceMs, formik.submitForm]
  )

  React.useEffect(() => {
    if (id !== 'NEW') {
      debouncedSubmit()
    }
  }, [debouncedSubmit, formik.values])

  let result = null

  if (formik.isSubmitting) {
    result = 'Saving...'
  } else if (Object.keys(formik.errors).length > 0) {
    result = `Error: ${formik.errors.error}`
  } else if (lastSaved !== null) {
    result = `Last Saved: ${lastSaved}`
  }
  return <div style={{ color: 'var(--grey2)', display: 'flex', alignItems: 'center' }}><svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='var(--grey2)' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' /><polyline points='17 21 17 13 7 13 7 21' /><polyline points='7 3 7 8 15 8' /></svg><span style={{ marginLeft: '5px' }}>{result}</span></div>
}

const Maintenance = ({ session, serverData, suppliers }) => {
  const store = Store.useStore()

  const [maintenance, setMaintenance] = useState(serverData.profile)
  const [frozenCompany, setFrozenCompany] = useState('')
  const [openReadModal, setOpenReadModal] = useState(false)
  const [openPreviewModal, setOpenPreviewModal] = useState(false)
  const [openRescheduleModal, setOpenRescheduleModal] = useState(false)
  const [openConfirmFreezeModal, setOpenConfirmFreezeModal] = useState(false)
  const [openMaintenanceChangelog, setOpenMaintenanceChangelog] = useState(false)
  const [mailBodyText, setMailBodyText] = useState('')
  const [mailPreviewRecipients, setMailPreviewRecipients] = useState('')
  const [mailPreviewCustomerCID, setMailPreviewCustomerCid] = useState('')
  const [mailPreviewSubject, setMailPreviewSubject] = useState('')
  const [customerCids, setCustomerCids] = useState([])
  const [supplierCids, setSupplierCids] = useState([])
  const [impactPlaceholder, setImpactPlaceholder] = useState([])
  const [sentProgress, setSentProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('customer')
  const [maintHistory, setMaintHistory] = useState({
    timezone: serverData.profile.timezone || undefined,
    supplier: serverData.profile.lieferant,
    startDateTime: serverData.profile.startDateTime,
    endDateTime: serverData.profile.endDateTime,
    supplierCids: serverData.profile.derenCIDid?.split(',').map(Number) || '',
    impact: serverData.profile.impact,
    location: serverData.profile.location,
    reason: serverData.profile.reason,
    note: serverData.profile.maintNote,
    cancelled: !!+serverData.profile.cancelled,
    emergency: !!+serverData.profile.emergency,
    done: !!+serverData.profile.done
  })
  const [frozenState, setFrozenState] = useState({
    recipient: '',
    cid: ''
  })

  const formRef = useRef()
  const gridApi = useRef()
  const gridColumnApi = useRef()

  const router = useRouter()

  const sendMailBtns = ({ data: { maintenanceRecipient, kundenCID, frozen, name, protected: protection } }) => {
    return (
      <ButtonGroup>
        <IconButton
          onClick={() => prepareDirectSend(maintenanceRecipient, kundenCID, frozen, name)}
          size='sm'
          appearance='ghost'
          icon={<Icon icon='send' />}
        />
        <IconButton
          onClick={() => togglePreviewModal(maintenanceRecipient, kundenCID, protection)}
          size='sm'
          appearance='ghost'
          icon={<Icon icon='search' />}
        />
      </ButtonGroup>
    )
  }

  const togglePreviewModal = (recipient, customerCID, protection) => {
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
        if (params.data.frozen) {
          return true
        }
        return false
      }
    }
  }

  useEffect(() => {
    if (serverData.profile.id === 'NEW') {
      // prepare NEW maintenance
      const username = session.user.email.substr(0, session.user.email.indexOf('@'))
      fetch(`/api/companies/domain?id=${serverData.profile.name}`, {
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
            ...serverData.profile,
            name: companyName,
            lieferant: companyId,
            bearbeitetvon: username,
            updatedAt: format(new Date(), 'MM.dd.yyyy HH:mm')
          })
          fetchSupplierCids(companyId)
          formRef.current.setFieldValue('supplier', companyId)
          gridApi.current.hideOverlay()
        })
        .catch(err => console.error(`Error - ${err}`))
    } else {
      // prepare page for existing maintenance
      const {
        cancelled,
        emergency,
        done
      } = serverData.profile

      setMaintenance({
        ...serverData.profile,
        cancelled: !!+cancelled,
        emergency: !!+emergency,
        done: !!+done,
        timezone: 'Europe/Amsterdam',
        timezoneLabel: '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
        startDateTime: moment.tz(serverData.profile.startDateTime, 'GMT').tz('Etc/GMT-1').format('YYYY-MM-DD HH:mm:ss'), // TODO: DONT HARDCORE TIMEZONE
        endDateTime: moment.tz(serverData.profile.endDateTime, 'GMT').tz('Etc/GMT-1').format('YYYY-MM-DD HH:mm:ss') // TODO: DONT HARDCORE TIMEZONE
      })
      fetchSupplierCids(serverData.profile.lieferant)

      const startDateTime = serverData.profile.startDateTime
      const endDateTime = serverData.profile.endDateTime
      if (startDateTime && endDateTime && isValid(parseISO(startDateTime)) && isValid(parseISO(endDateTime))) {
        const impactCalculation = formatDistance(parseISO(endDateTime), parseISO(startDateTime))
        setImpactPlaceholder(impactCalculation)
      }
    }
  }, [serverData.profile])

  /// /////////////////////////////////////////////////////////
  //
  //                AG-GRID TABLE
  //
  /// /////////////////////////////////////////////////////////

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
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  // fetch customer CIDs based on selected Supplier CID
  const fetchCustomerCids = lieferantCidId => {
    if (!lieferantCidId) {
      gridApi.current.hideOverlay()
      return
    }
    fetch('/api/customercids/maint', {
      method: 'post',
      body: JSON.stringify({
        cids: lieferantCidId
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(resp => resp.json())
      .then(data => {
        gridApi.current.showLoadingOverlay()
        let currentSentStatus = 0
        if (maintenance.done) {
          currentSentStatus = 1
        }
        const kundencids = data.kundenCIDsResult
        kundencids.forEach(cid => {
          cid.sent = currentSentStatus
          cid.frozen = false
          cid.protected = !!+cid.protected
        })
        const uniqueKundenCids = getUnique(kundencids, 'kundenCID')
        setCustomerCids(uniqueKundenCids)
        gridApi.current.hideOverlay()
        checkFreezeStatus(uniqueKundenCids)
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  const checkFreezeStatus = (cids) => {
    const startDate = maintenance.startDateTime
    const endDate = maintenance.endDateTime
    const uniqueCustomers = []
    cids.forEach(cid => {
      uniqueCustomers.push(cid.kunde)
    })
    fetch('/api/maintenances/freeze', {
      method: 'post',
      body: JSON.stringify({
        companys: [...new Set(uniqueCustomers)],
        startDate: startDate,
        endDate: endDate
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.freezeQuery.length !== 0) {
          const customerCidEntries = customerCids
          data.freezeQuery.forEach(freezeResult => {
            const frozenCidIndex = customerCidEntries.findIndex(el => el.kunde === freezeResult.companyId)
            Notify('error', 'Network Freeze', `${freezeResult.name} has active freeze during this time period!`)
            customerCidEntries[frozenCidIndex].frozen = true
          })
          setCustomerCids(customerCidEntries)
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
  function prepareDirectSend(recipient, customerCID, frozen, companyName) {
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
    const subject = generateMailSubject()
    sendMail(recipient, customerCID, subject, HtmlBody, false)
  }

  // generate Mail contents
  const generateMail = (customerCID, protection) => {
    // TODO: everything that can be changed by form = currentMaint, everythign else =hook maintenance
    const currentMaint = formRef.current.values

    if (currentMaint.id === '' || currentMaint.startDateTime === '' || currentMaint.endDateTime === '') {
      Notify('warning', 'Missing Required Fields')
      return
    }

    const timezoneValue = currentMaint.timezone || 'Europe/Dublin'
    const rawStart = moment.tz(moment(currentMaint.startDateTime).format('YYYY-MM-DD HH:mm:ss'), timezoneValue)
    const rawEnd = moment.tz(moment(currentMaint.endDateTime).format('YYYY-MM-DD HH:mm:ss'), timezoneValue)
    const utcStart1 = rawStart.tz('GMT').format('YYYY-MM-DD HH:mm:ss')
    const utcEnd1 = rawEnd.tz('GMT').format('YYYY-MM-DD HH:mm:ss')
    const utcStart = utcStart1 || serverData.profile.startDateTime
    const utcEnd = utcEnd1 || serverData.profile.endDateTime

    // let maintenanceIntro = 'We would like to inform you about planned work on the following CID(s):'
    let maintenanceIntro = ''
    const rescheduleText = ''
    const tzSuffixRAW = 'UTC / GMT+0:00'

    const cancelled = !!+currentMaint.cancelled
    if (cancelled) {
      maintenanceIntro = `We would like to inform you that these planned works (<b>NT-${maintenance.id}</b>) have been <b>cancelled</b> with the following CID(s):`
    }

    if (store.get('rescheduleData').length !== 0) {
      const latest = store.get('rescheduleData').length - 1
      const newStart = moment(store.get('rescheduleData')[latest].startDateTime).format('YYYY-MM-DD HH:mm:ss')
      const newEnd = moment(store.get('rescheduleData')[latest].endDateTime).format('YYYY-MM-DD HH:mm:ss')
      const newImpact = store.get('rescheduleData')[latest].impact
      const newReason = store.get('rescheduleData')[latest].reason.toLowerCase()
      const rcounter = store.get('rescheduleData')[latest].rcounter
      if (cancelled && store.get('rescheduleData')[latest]) {
        maintenanceIntro = `We would like to inform you that these rescheduled planned works (<b>NT-${maintenance.id}-${rcounter}</b>) have been <b>cancelled</b>.<br><br>We are sorry for any inconveniences this may have caused.<br><footer>​<style>.sig{font-family:Century Gothic, sans-serif;font-size:9pt;color:#636266!important;}b.i{color:#4ca702;}.gray{color:#636266 !important;}a{text-decoration:none;color:#636266 !important;}</style><div class="sig"><div>Best regards <b class="i">|</b> Mit freundlichen Grüßen</div><br><div><b>Newtelco Maintenance Team</b></div><br><div>NewTelco GmbH <b class="i">|</b> Moenchhofsstr. 24 <b class="i">|</b> 60326 Frankfurt a.M. <b class="i">|</b> DE <br>www.newtelco.com <b class="i">|</b> 24/7 NOC  49 69 75 00 27 30 ​​<b class="i">|</b> <a style="color:#" href="mailto:service@newtelco.de">service@newtelco.de</a><br><br><div><img alt="sig" src="https://home.newtelco.de/sig.png" height="29" width="516"></div></div>​</footer><hr />`
      }
      maintenanceIntro += `We regret to inform you that the planned works have been <b>rescheduled</b> on the following CID(s):\n\n<br><br><b>${customerCID}</b><br><br>The maintenance has been rescheduled due to ${newReason}.<br><br>The new details are as follows:<br><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>NT-${maintenance.id}-${rcounter}</b></td></tr><tr><td>New Start date and time:</td><td><b>${newStart} (${tzSuffixRAW})</b></td></tr><tr><td>New Finish date and time:</td><td><b>${newEnd} (${tzSuffixRAW})</b></td></tr><tr><td>New Impact:</td><td><b>${newImpact}</b></td></tr></table><br>Thank you very much for your patience and cooperation.<br>`

      if (store.get('rescheduleData').length > 1) {
        maintenanceIntro += '<br><hr><br><b>Previous Reschedules:</b><br>'
        const oldReschedules = store.get('rescheduleData')
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
          maintenanceIntro += `<br>This maintenance had been rescheduled due to ${newReason}.<br><br>The previous details were as follows:<br><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>NT-${maintenance.id}-${rcounter}</b></td></tr><tr><td>Previous Start date and time:</td><td><b>${newStart} (${tzSuffixRAW})</b></td></tr><tr><td>Previous Finish date and time:</td><td><b>${newEnd} (${tzSuffixRAW})</b></td></tr><tr><td>Previous Impact:</td><td><b>${newImpact}</b></td></tr></table>`
        }
      }
      maintenanceIntro += '<br><hr><i><b>Original Planned Works:</b></i><br><br>Dear Colleagues,<br><br>We would like to inform you about planned work on the following CID(s):\n'
    }

    let body = `<body style="color:#666666;">${rescheduleText} Dear Colleagues,​​<p><span>${maintenanceIntro}<br><br> <b>${customerCID}</b> <br><br>The maintenance work is with the following details:</span></p><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>NT-${maintenance.id}</b></td></tr><tr><td>Start date and time:</td><td><b>${utcStart} (${tzSuffixRAW})</b></td></tr><tr><td>Finish date and time:</td><td><b>${utcEnd} (${tzSuffixRAW})</b></td></tr>`
    if (currentMaint.impact || protection || impactPlaceholder) {
      if (protection) {
        body = body + '<tr><td>Impact:</td><td>50ms Protection Switch</td></tr>'
      } else {
        const impactText = currentMaint.impact || store.get('impactPlaceholder')
        body = body + '<tr><td>Impact:</td><td>' + impactText + '</td></tr>'
      }
    }

    if (currentMaint.location) {
      body = body + '<tr><td>Location:</td><td>' + currentMaint.location + '</td></tr>'
    }

    if (currentMaint.reason) {
      body = body + '<tr><td>Reason:</td><td>' + currentMaint.reason + '</td></tr>'
    }

    const maintNoteBody = currentMaint.maintNote ? `<p>${currentMaint.maintNote}</p>` : ''

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

    if (+maintenance.emergency) {
      subject = `[EMERGENCY] ${subject}`
    }
    if (+maintenance.cancelled) {
      subject = `[CANCELLED] ${subject}`
    }
    if (store.get('rescheduleData').length !== 0) {
      subject = `[RESCHEDULED] ${subject}-${store.get('rescheduleData')[store.get('rescheduleData').length - 1].rcounter}`
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
          const user = session.user.email
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

  const handleCalendarCreate = () => {
    const company = maintenance.name
    const maintId = maintenance.id
    const currentMaint = formRef.current.values
    const startDateTime = currentMaint.startDateTime
    const endDateTime = currentMaint.endDateTime

    let derenCid = ''
    currentMaint.supplierCids.forEach(supp => {
      const supplierLabel = supplierCids.filter(supplier => supplier.value === supp)
      derenCid += ` ${supplierLabel[0].label}`
    })
    derenCid = derenCid.trim()

    let cids = ''
    customerCids.forEach(cid => {
      cids += ` ${cid.kundenCID}`
    })
    cids = cids.trim()

    const startMoment = moment.tz(startDateTime, currentMaint.timezone)
    const startDE = startMoment.tz('Europe/Berlin').format()
    const endMoment = moment.tz(endDateTime, currentMaint.timezone)
    const endDE = endMoment.tz('Europe/Berlin').format()

    fetch('/v1/api/calendar/create', {
      method: 'post',
      body: JSON.stringify({
        company: company,
        cids: cids,
        supplierCID: derenCid,
        maintId: maintId,
        startDateTime: startDE,
        endDateTime: endDE,
        user: session.user.email
      }),
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
            ...currentMaint,
            calendarId: calId
          })

          fetch('/api/maintenances/save/calendar', {
            method: 'post',
            body: JSON.stringify({
              mid: maintenance.id,
              cid: calId,
              updatedBy: session.user.email
            }),
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            }
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

  function handleCalendarUpdate(startDateTime, endDateTime, rcounter) {
    const calId = maintenance.calendarId
    const company = maintenance.name
    const maintId = maintenance.id
    const currentMaint = formRef.current.values

    let derenCid = ''
    currentMaint.supplierCids.forEach(supp => {
      const supplierLabel = supplierCids.filter(supplier => supplier.value === supp)
      derenCid += ` ${supplierLabel[0].label}`
    })
    derenCid = derenCid.trim()

    let cids = ''
    customerCids.forEach(cid => {
      cids += ` ${cid.kundenCID}`
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

  /// /////////////////////////////////////////////////////////
  //
  //                INPUTS: ONCHANGE
  //
  /// /////////////////////////////////////////////////////////

  const handleEditorChange = (data) => {
    setMailBodyText(data.level.content)
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
            incomingDomain: serverData.profile.mailDomain
          })
          setOpenReadModal(!openReadModal)
        })
        .catch(err => console.error(`Error - ${err}`))
    } else {
      setOpenReadModal(!openReadModal)
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
  //                    OTHER ACTIONS
  //
  /// /////////////////////////////////////////////////////////

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

    fetch('/api/maintenances/save/create', {
      method: 'post',
      body: JSON.stringify({
        bearbeitetvon: bearbeitetvon,
        lieferant: lieferant,
        mailId: mailId,
        updatedAt: updatedAtFormatted,
        maileingang: incomingFormatted
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
      .then(resp => resp.json())
      .then(data => {
        const newId = data.newId['LAST_INSERT_ID()']
        const newMaint = { ...maintenance, id: newId }
        setMaintenance(newMaint)
        const newLocation = `/maintenance?id=${newId}`
        router.push(newLocation, newLocation, { shallow: false })

        if (data.status === 200 && data.statusText === 'OK') {
          Notify('success', 'Create Success')
        } else {
          Notify('error', 'Create Error', data.err)
        }
      })
      .catch(err => console.error(err))

    // mark mail as read in connected gmail inbox
    const incomingMailId = maintenance.mailId || maintenance.receivedmail
    if (incomingMailId !== 'NT') {
      fetch('/v1/api/inbox/delete', {
        method: 'post',
        body: JSON.stringify({ m: incomingMailId }),
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
    const rData = store.get('rescheduleData')
    let text = rData.length !== 0 ? ' [RESCHEDULED]' : ''
    text += formRef.current.values.emergency ? ' [EMERGENCY]' : ''
    text += formRef.current.values.cancelled ? ' [CANCELLED]' : ''
    text += ' Planned Work Notification - NT-' + maintenance.id
    if (rData.length !== 0) {
      text += '-' + rData[rData.length - 1].rcounter
    }
    setMailPreviewSubject(text.trimStart().trimEnd())
    return text
  }

  /// /////////////////////////////////////////////////////////
  //
  //                      RENDER
  //
  /// /////////////////////////////////////////////////////////

  if (session) {
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
        <Badge content={maintenance.id === 'NEW' ? 'NEW' : `NT-${maintenance.id}`} className='header-badge'>
          <Button appearance='subtle' size='lg' style={{ fontSize: '1.1em', fontWeight: '200', border: '1px solid var(--grey2)' }}>
            {maintenance.name}
          </Button>
        </Badge>
      )
    }

    const HeaderRight = () => {
      return (
        <ButtonGroup size='md'>
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

    const TimezoneSelector = ({
      field,
      form
    }) => {
      return (
        <Select
          options={tzOptions}
          name={field.name}
          value={tzOptions ? tzOptions.find(option => option.value === field.value) : ''}
          validateOnChange={false}
          validateOnBlur={false}
          onChange={(option) => form.setFieldValue(field.name, option.value)}
          className='timezone-select'
        />
      )
    }

    const SupplierSelector = ({
      field,
      form
    }) => {
      return (
        <SelectPicker
          style={{ width: '100%' }}
          name={field.name}
          validateOnChange={false}
          validateOnBlur={false}
          value={field.value}
          onChange={option => {
            fetch(`/api/lieferantcids?id=${option}`, {
              method: 'get'
            })
              .then(resp => resp.json())
              .then(data => {
                if (!data.lieferantCIDsResult) {
                  setSupplierCids([{ label: 'No CIDs available for this Supplier', value: '1' }])
                  return
                }
                setMaintenance({
                  ...maintenance,
                  lieferant: option,
                  name: suppliers.companies.find(options => options.value === option).label
                })
                setSupplierCids(data.lieferantCIDsResult)
                setCustomerCids([])
                gridApi.current.hideOverlay()
              })
              .catch(err => console.error(err))
            form.setFieldValue(field.name, option)
            form.setFieldValue('supplierCids', [])
          }}
          data={suppliers?.companies || []}
          placeholder='Please select a Supplier'
        />
      )
    }

    const MyTextinput = ({ field, form, placeholder = '' }) => {
      return (
        <Input
          name={field.name}
          value={field.value}
          placeholder={placeholder}
          validateOnChange={false}
          validateOnBlur={false}
          onChange={option => form.setFieldValue(field.name, option)}
        />
      )
    }
    const MyToggle = ({ field, form, checkedChildren = '' }) => {
      return (
        <Toggle
          size='lg'
          validateOnChange={false}
          validateOnBlur={false}
          checkedChildren={checkedChildren}
          checked={field.value}
          name={field.name}
          onChange={option => {
            form.setFieldValue(field.name, option)

            // Actions required on marking 'Done':
            if (field.name === 'done' && option === true) {
              // Set Mail as READ in Gmail Mailbox
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
                      Notify('error', 'Error', 'Cannot move mail to complete label.')
                    }
                  })
                  .catch(err => console.error(`Error - ${err}`))
              }
              // Set 'impacted CIDs'
              fetch(`/api/maintenances/save/impactedcids?cids=${impactedCIDs}&maintId=${maintenance.id}&updatedby=${activeUser}`, {
                method: 'get',
                headers: {
                  'Access-Control-Allow-Origin': '*',
                  _csrf: session.accessToken
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
          }}
        />
      )
    }

    return (
      <Layout>
        {maintenance.id === 'NEW' && (
          <Message full showIcon type='warning' description='Remember to Save before continuing to work!' style={{ position: 'fixed', zIndex: '999' }} />
        )}
        <Helmet>
          <title>{`Newtelco Maintenance | NT-${maintenance.id}`}</title>
        </Helmet>
        <MaintPanel header={<HeaderLeft />} center={<HeaderCenter />} buttons={<HeaderRight />}>
          <FlexboxGrid justify='space-around' align='top' style={{ width: '100%' }}>
            <FlexboxGrid.Item colspan={11} style={{ margin: '0 10px' }}>
              <Panel bordered>
                <Grid fluid>
                  <Formik
                    innerRef={formRef}
                    validateOnChange={false}
                    validateOnBlur={false}
                    initialValues={{
                      timezone: serverData.profile.timezone,
                      supplier: serverData.profile.lieferant,
                      startDateTime: serverData.profile.startDateTime,
                      endDateTime: serverData.profile.endDateTime,
                      supplierCids: serverData.profile.derenCIDid?.split(',').map(Number) || '',
                      impact: serverData.profile.impact,
                      location: serverData.profile.location,
                      reason: serverData.profile.reason,
                      maintNote: serverData.profile.maintNote,
                      cancelled: !!+serverData.profile.cancelled,
                      emergency: !!+serverData.profile.emergency,
                      done: !!+serverData.profile.done
                    }}
                    onSubmit={async (values, formikHelpers) => {
                      const diff = objDiff(maintHistory, values)
                      setMaintHistory(values)
                      if (values.supplierCids && !customerCids.length) {
                        fetchCustomerCids(values.supplierCids)
                      }
                      if (Object.keys(diff).length) {
                        if (maintenance.id === 'NEW') {
                          Notify('error', 'Unable to Save', 'Not maintenance ID created yet.')
                          return
                        }
                        try {
                          await fetch('/api/maintenances/saveAll', {
                            method: 'post',
                            body: JSON.stringify({
                              id: maintenance.id,
                              values: values,
                              user: session.user.email.match(/^([^@]*)@/)[1],
                              field: Object.keys(diff)[0]
                            }),
                            headers: {
                              'Content-Type': 'application/json'
                            }
                          })
                        } catch (e) {
                          formikHelpers.setErrors({ error: e })
                        }
                      }
                    }}
                  >
                    {({ values, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
                      <>
                        <Row gutter={20} style={{ marginBottom: '20px' }}>
                          <Col sm={24} xs={24}>
                            <AutoSave debounceMs={1000} id={maintenance.id} />
                          </Col>
                        </Row>
                        <Row gutter={20} style={{ marginBottom: '20px' }}>
                          <Col sm={12} xs={24}>
                            <FormGroup>
                              <ControlLabel htmlFor='edited-by'>Created By</ControlLabel>
                              <Input tabIndex='-1' readOnly id='edited-by-input' name='edited-by' type='text' value={maintenance.bearbeitetvon} disabled />
                            </FormGroup>
                          </Col>
                          <Col sm={12} xs={24}>
                            <FormGroup>
                              <ControlLabel htmlFor='maileingang'>Mail Arrived</ControlLabel>
                              <Input tabIndex='-1' readOnly id='maileingang-input' name='maileingang' type='text' value={convertDateTime(maintenance.maileingang)} disabled />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row gutter={20} style={{ marginBottom: '20px' }}>
                          <Col sm={12} xs={24}>
                            <FormGroup>
                              <ControlLabel htmlFor='supplier'>Timezone</ControlLabel>
                              <FastField name='timezone' component={TimezoneSelector} />
                            </FormGroup>
                          </Col>
                          <Col sm={12} xs={24}>
                            <FormGroup>
                              <ControlLabel htmlFor='supplier'>Supplier</ControlLabel>
                              <FastField name='supplier' component={SupplierSelector} />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row gutter={20} style={{ marginBottom: '20px' }}>
                          <Col sm={12} xs={24}>
                            <FormGroup>
                              <ControlLabel htmlFor='start-datetime' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Start Date/Time
                                <HelpBlock style={{ float: 'right' }} tooltip>
                                  Time in above selected Timezone
                                </HelpBlock>
                              </ControlLabel>
                              <FastField name='startDateTime' component={MyDateTime} />
                            </FormGroup>
                          </Col>
                          <Col sm={12} xs={24}>
                            <FormGroup>
                              <ControlLabel htmlFor='end-datetime' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                End Date/Time
                                <HelpBlock style={{ float: 'right' }} tooltip>
                                  Time in above selected Timezone
                                </HelpBlock>
                              </ControlLabel>
                              <FastField name='endDateTime' component={MyDateTime} />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row gutter={20} style={{ marginBottom: '20px' }}>
                          <Col sm={24}>
                            <FormGroup>
                              <ControlLabel htmlFor='their-cid'>{maintenance.name} CID</ControlLabel>
                              <Field name='supplierCids' customerCids={customerCids} setCustomerCids={setCustomerCids} fetchCustomerCids={fetchCustomerCids} supplierCids={supplierCids} component={MyTagPicker} />
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
                                    <IconButton id='protectionswitchtext' onClick={() => setFieldValue('impact', '50ms protection switch')} size='sm' icon={<Icon icon='clock-o' />} />
                                  </Whisper>
                                  <Whisper placement='bottom' speaker={<Tooltip>Use Time Difference Text</Tooltip>}>
                                    <IconButton id='impactplaceholdertext' onClick={() => setFieldValue('impact', impactPlaceholder)} size='sm' icon={<Icon icon='history' />} />
                                  </Whisper>
                                </ButtonGroup>
                              </ControlLabel>
                              <FastField name='impact' component={MyTextinput} placeholder={impactPlaceholder} />
                            </FormGroup>
                          </Col>
                          <Col sm={12} xs={24}>
                            <FormGroup style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '70px' }}>
                              <ControlLabel htmlFor='location' style={{ marginBottom: '10px' }}>Location</ControlLabel>
                              <FastField name='location' component={MyTextinput} />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row gutter={20} style={{ marginBottom: '20px' }}>
                          <Col sm={24}>
                            <FormGroup>
                              <ControlLabel htmlFor='reason'>Reason</ControlLabel>
                              <FastField name='reason' component={MyTextarea} />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row gutter={20} style={{ marginBottom: '20px' }}>
                          <Col sm={24}>
                            <FormGroup>
                              <ControlLabel htmlFor='maintNote' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Note
                                <HelpBlock style={{ float: 'right' }} tooltip>
                                  This note will be included in the mail
                                </HelpBlock>
                              </ControlLabel>
                              <FastField name='maintNote' key='maintNote' component={MyTextarea} />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row gutter={20} style={{ marginBottom: '20px' }}>
                          <Col xs={8} style={{ display: 'flex', justifyContent: 'center' }}>
                            <FormGroup style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <ControlLabel>
                                Cancelled
                              </ControlLabel>
                              <Field name='cancelled' component={MyToggle} checkedChildren={<Icon icon='ban' inverse />} />
                            </FormGroup>
                          </Col>
                          <Col xs={8} style={{ display: 'flex', justifyContent: 'center' }}>
                            <FormGroup style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <ControlLabel>
                                Emergency
                              </ControlLabel>
                              <Field name='emergency' component={MyToggle} checkedChildren={<Icon icon='hospital-o' inverse />} />
                            </FormGroup>
                          </Col>
                          <Col xs={8} style={{ display: 'flex', justifyContent: 'center' }}>
                            <FormGroup style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <ControlLabel>
                                Done
                              </ControlLabel>
                              <Field name='done' component={MyToggle} checkedChildren={<Icon icon='check' inverse />} />
                            </FormGroup>
                          </Col>
                        </Row>
                      </>
                    )}
                  </Formik>
                  <Row gutter={20} style={{ marginBottom: '20px' }}>
                    <Col>
                      {maintenance.id && (
                        <CommentList user={session.user.email} id={maintenance.id} initialComment={serverData.profile.notes} />
                      )}
                    </Col>
                  </Row>
                </Grid>
              </Panel>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={11} style={{ margin: '0 10px' }}>
              <Panel bordered className='panel-right'>
                <Nav justified appearance='tabs' reversed activeKey={activeTab} onSelect={key => setActiveTab(key)} style={{ marginTop: '-1px' }}>
                  <Nav.Item eventKey='customer'>Customer CIDs</Nav.Item>
                  <Nav.Item eventKey='reschedule'>Reschedule</Nav.Item>
                  <Nav.Item eventKey='changelog'>Changelog</Nav.Item>
                </Nav>
                <Grid fluid>
                  <Row>
                    <Col>
                      {activeTab === 'customer' && (
                        <Row>
                          <Col>
                            <Container style={{ marginTop: '10px' }}>
                              <Row>
                                <Col>
                                  <Progress.Line percent={sentProgress} showInfo={false} />
                                </Col>
                              </Row>
                              <Row>
                                <Col style={{ width: '100%', height: '500px', padding: '20px' }}>
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
                          </Col>
                        </Row>
                      )}
                      {activeTab === 'changelog' && (
                        <Row>
                          <Col>
                            <Container style={{ padding: '20px' }}>
                              <Row>
                                <Col style={{ padding: '0 40px' }}>
                                  <Changelog maintId={maintenance.id} />
                                </Col>
                              </Row>
                            </Container>
                          </Col>
                        </Row>
                      )}
                      {activeTab === 'reschedule' && (
                        <Row>
                          <Col>
                            <RescheduleGrid
                              maintId={maintenance.id}
                              user={session.user.email}
                              handleCalendarUpdate={handleCalendarUpdate}
                            />
                          </Col>
                        </Row>
                      )}
                    </Col>
                  </Row>
                </Grid>
              </Panel>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </MaintPanel>
        {
          openReadModal && (
            <ReadModal
              maintenance={maintenance}
              openReadModal={openReadModal}
              toggleReadModal={toggleReadModal}
              incomingAttachments={maintenance.incomingAttachments}
              jsonData={serverData}
            />
          )
        }
        {
          openPreviewModal && (
            <MailEditor
              open={openPreviewModal}
              onHide={togglePreviewModal}
              recipients={mailPreviewRecipients.toLowerCase()}
              subject={mailPreviewSubject}
              body={mailBodyText}
              customerCid={mailPreviewCustomerCID}
              sendMail={sendMail}
              onEditorChange={handleEditorChange}
            />
          )
        }
        {
          openConfirmFreezeModal && (
            <ConfirmModal
              show={openConfirmFreezeModal}
              onHide={toggleConfirmFreezeModal}
              header='Confirm Freeze'
              content={`There is a network freeze for <b>${frozenCompany || ''}</b>. Are you sure you want to send this mail?`}
              cancelAction={toggleConfirmFreezeModal}
              confirmAction={() => prepareDirectSend(frozenState.recipient, frozenState.cid, false)}
            />
          )
        }
      </Layout>
    )
  } else {
    return <RequireLogin />
  }
}

export async function getServerSideProps({ req, query }) {
  const session = await NextAuth.session({ req })
  const host = req ? req.headers['x-forwarded-host'] : window.location.hostname
  let protocol = 'https:'
  if (host.indexOf('localhost') > -1) {
    protocol = 'http:'
  }
  const res2 = await fetch(`${protocol}//${host}/api/companies/selectmaint`)
  const suppliers = await res2.json()
  if (query.id === 'NEW') {
    return {
      props: {
        serverData: { profile: query },
        suppliers,
        session
      }
    }
  } else {
    const res = await fetch(`${protocol}//${host}/api/maintenances/${query.id}`)
    const serverData = await res.json()
    return {
      props: {
        serverData,
        suppliers,
        session
      }
    }
  }
}

export default Maintenance
