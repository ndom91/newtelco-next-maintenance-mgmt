import React from 'react'
import Layout from '../src/components/layout'
import fetch from 'isomorphic-unfetch'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import RequireLogin from '../src/components/require-login'
import ProtectedIcon from '../src/components/ag-grid/protected'
import SentIcon from '../src/components/ag-grid/sent'
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
import { format, isValid, formatDistance, parseISO, addMinutes, parse, subMinutes, toDate, getYear, getMonth, getDay, getHours, getMinutes, getSeconds } from 'date-fns'
import moment from 'moment-timezone'
import { zonedTimeToUtc, format as formatTz } from 'date-fns-tz'
import { Rnd } from 'react-rnd'
import { Timezones } from '../src/components/timezone/timezones.js'
import UnreadCount from '../src/components/unreadcount'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/material_blue.css'

import {
  faPlusCircle,
  faCalendarAlt,
  faArrowLeft,
  faEnvelopeOpenText,
  faLanguage,
  faFirstAid,
  faSearch,
  faPaperPlane,
  faTimesCircle
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
        incomingBody: this.props.jsonData.profile.body,
        incomingTimezone: this.props.jsonData.profile.timezone
      },
      openReadModal: false,
      openPreviewModal: false,
      translateTooltipOpen: false,
      translated: false,
      translatedBody: '',
      notesText: props.jsonData.profile.notes || '',
      mailBodyText: '',
      lieferantcids: {},
      kundencids: [],
      windowInnerHeight: 0,
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
        context: { componentParent: this },
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
    this.toggleTooltip = this.toggleTooltip.bind(this)
    this.handleNotesChange = this.handleNotesChange.bind(this)
    this.handleMailPreviewChange = this.handleMailPreviewChange.bind(this)
    this.sendMail = this.sendMail.bind(this)
    this.handleEditorChange = this.handleEditorChange.bind(this)
    this.handleCalendarCreate = this.handleCalendarCreate.bind(this)
    this.handleCIDBlur = this.handleCIDBlur.bind(this)
    this.handleDateTimeSave = this.handleDateTimeSave.bind(this)
    this.handleTextInputBlur = this.handleTextInputBlur.bind(this)
    this.handleImpactChange = this.handleImpactChange.bind(this)
    this.handleReasonChange = this.handleReasonChange.bind(this)
    this.handleLocationChange = this.handleLocationChange.bind(this)
    this.handleSaveOnClick = this.handleSaveOnClick.bind(this)
    this.handleNotesBlur = this.handleNotesBlur.bind(this)
    this.handleTimezoneChange = this.handleTimezoneChange.bind(this)
    this.handleTimezoneBlur = this.handleTimezoneBlur.bind(this)
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

  fetchLieferantCIDs (lieferantId) {
    if (!lieferantId) {
      this.setState({
        lieferantcids: [{ label: 'No CIDs available for this Supplier', value: '1' }]
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

  componentDidMount () {
    const convertBool = (input) => {
      if (input === '1' || input === '0') {
        if (input === '1') {
          return true
        } else if (input === '0') {
          return false
        }
      } else {
        return input
      }
    }

    if (this.props.jsonData.profile.id === 'NEW') {
      const {
        email
      } = this.props.session.user
      const username = email.substr(0, email.indexOf('@'))
      const maintenance = {
        ...this.props.jsonData.profile,
        bearbeitetvon: username,
        incomingBody: '',
        incomingSubject: this.props.jsonData.profile.subject,
        incomingFrom: this.props.jsonData.profile.from,
        incomingDate: this.props.jsonData.profile.maileingang,
        incomingDomain: this.props.jsonData.profile.name,
        updatedAt: format(new Date(), 'MM.dd.yyyy HH:mm') //, { locale: de })
      }
      this.setState({
        maintenance: maintenance,
        width: window.innerWidth
      })
    } else {
      const {
        cancelled,
        emergency,
        done
      } = this.props.jsonData.profile

      const newMaintenance = {
        ...this.props.jsonData.profile,
        cancelled: convertBool(cancelled),
        emergency: convertBool(emergency),
        done: convertBool(done)
      }

      this.setState({
        maintenance: newMaintenance,
        width: window.innerWidth
      })
    }

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
          // const selectedLieferantCIDid = parseInt(this.props.jsonData.profile.derenCIDid) || null
          // const selectedLieferantCIDvalue = this.props.jsonData.profile.derenCID || null
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
    this.setState({
      windowInnerHeight: window.innerHeight
    })
  }

  getUnique (arr, comp) {
    const unique = arr
      .map(e => e[comp])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter(e => arr[e]).map(e => arr[e])
    return unique
  }

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
        if (data.kundenCIDsResult[0]) {
          if (done === 1 || done === true || done === '1') {
            data.kundenCIDsResult[0].sent = '1'
          } else {
            data.kundenCIDsResult[0].sent = '0'
          }

          const existingKundenCids = [
            ...this.state.kundencids,
            data.kundenCIDsResult[0]
          ]
          const uniqueKundenCids = this.getUnique(existingKundenCids, 'kundenCID')
          this.setState({
            kundencids: uniqueKundenCids
          })
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  componentDidUpdate () {
  }

  convertDateTime = (datetime) => {
    let newDateTime
    if (isValid(new Date(datetime))) {
      newDateTime = format(new Date(datetime), 'dd.MM.yyyy HH:mm')
    } else {
      newDateTime = datetime
    }
    return newDateTime
  }

  handleMailPreviewChange (content, delta, source, editor) {
    this.setState({ mailBodyText: editor.getContents() })
  }

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

  toggleReadModal () {
    if (!this.state.maintenance.incomingBody) {
      const host = window.location.host
      let mailId
      console.log(this.state.maintenance.id, this.state.maintenance.receivedmail, this.state.maintenance.mailId)
      if (this.state.maintenance.id === 'NEW') {
        mailId = this.state.maintenance.mailId
      } else {
        mailId = this.state.maintenance.receivedmail
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

          console.log(htmlRegex.test(data.body))

          if (htmlRegex.test(data.body)) {
            console.log('html true')
            mailBody = data.body
            this.setState({
              incomingMailIsHtml: true
            })
          } else {
            console.log('html false')
            mailBody = `<pre>${data.body}</pre>`
            this.setState({
              incomingMailIsHtml: false
            })
          }
          // console.log(data)
          this.setState({
            openReadModal: !this.state.openReadModal,
            maintenance: {
              ...this.state.maintenance,
              incomingBody: mailBody,
              incomingFrom: data.from,
              incomingSubject: data.subject,
              incomingDate: data.date,
              incomingDomain: this.props.jsonData.profile.mailDomain
            }
          })
        })
        .catch(err => console.error(`Error - ${err}`))
    } else {
      this.setState({
        openReadModal: !this.state.openReadModal
      })
    }
  }

  togglePreviewModal = (recipient, customerCID) => {
    if (recipient && customerCID) {
      const HtmlBody = this.generateMail(customerCID)
      HtmlBody && this.setState({
        openPreviewModal: !this.state.openPreviewModal,
        mailBodyText: HtmlBody,
        mailPreviewHeaderText: recipient || this.state.mailPreviewHeaderText,
        mailPreviewSubjectText: `Planned Work Notification - NT-${this.state.maintenance.id}`
      })
    } else {
      this.setState({
        openPreviewModal: !this.state.openPreviewModal
      })
    }
  }

  toggleTooltip () {
    this.setState({
      translateTooltipOpen: !this.state.translateTooltipOpen
    })
  }

  handleGridReady = params => {
    // this.gridApi = params.gridApi
    // this.gridColumnApi = params.gridColumnApi
    // params.columnApi.autoSizeColumns()
  }

  onFirstDataRendered (params) {
    // params.columnApi.autoSizeColumns()
    // params.columnApi.sizeColumnsToFit()
  }

  generateMail = (customerCID) => {
    const {
      id,
      startDateTime,
      endDateTime,
      impact,
      reason,
      location,
      incomingTimezone
    } = this.state.maintenance

    if (!id || !startDateTime || !endDateTime) {
      cogoToast.warn('Missing required fields', {
        position: 'top-right'
      })
      return
    }

    const timezone = incomingTimezone || 'Europe/Dublin'
    console.log(startDateTime)
    // startDateTime = Tue Oct 22 2019 15:00:00 GMT+0200 (Central European Summer Time)

    const momentTz = moment(startDateTime).tz(timezone).add(2, 'h').utc().toString()

    console.log(momentTz)
    // momentTz = Tue Oct 22 2019 13:00:00 GMT+0000

    // const momentStartUserTz = moment.tz(momentTz, timezone)
    // console.log(momentStartUserTz.add(2, 'h').toString())
    // momentStartUserTz = Tue Oct 22 2019 17:00:00 GMT+0400

    // moment.tz.setDefault('Europe/London')
    // const timeZone = incomingTimezone || 'Europe/Dublin'
    // console.log(timeZone)
    // const isoStartTime = new Date(startDateTime).toISOString()
    // const isoEndTime = new Date(endDateTime).toISOString()
    // console.log(isoStartTime, isoEndTime)

    // const momentStart = moment(isoStartTime)
    // console.log(momentStart)
    // const momentStartA = momentStart.tz(timeZone)
    // console.log(momentStartA)
    // const momentStartF = moment.tz(startDateTime, timeZone).utc().toString()
    // console.log(momentStartF)

    ////////////////////////////////////////
    // Export Object ob available Timezone data
    // var timeZones = moment.tz.names()
    // var offsetTmz = []

    // for (var i in timeZones) {
    //   offsetTmz.push({ label: '(GMT'+moment.tz(timeZones[i]).format('Z')+") " + timeZones[i], value: timeZones[i]});
    // }
    // console.log(offsetTmz)
    ////////////////////////////////////////


    // const newStartDateTime = new Date(startDateTime)
    // console.log(new Date(startDateTime))
    // console.log(new Date(startDateTime).toLocaleString('de-DE', {timeZone: 'Europe/London'}))
    // const convertedTime = new Date(startDateTime).toLocaleString('de-DE', {timeZone: 'Europe/London'})
    // const timezoneOffset = new Date(startDateTime).getTimezoneOffset()
    // console.log(timezoneOffset)

    // const newStartDateTime = new Date(startDateTime)
    // const y = getYear(newStartDateTime)
    // const mo = getMonth(newStartDateTime)
    // const d = getDay(newStartDateTime)
    // const h = getHours(newStartDateTime)
    // const mi = getMinutes(newStartDateTime)
    // console.log(y, mo, d, h, mi)
    // console.log(new Date(y, mo, d, h, mi))
    // const result = addMinutes(new Date(y, mo, d, h, mi), timezoneOffset)
    // console.log(result)

    // console.log(new Date(startDateTime).toString().substr(0, newStartDateTime.toString().indexOf('GMT') - 1))
    // console.log(zonedTimeToUtc(new Date(startDateTime)))
    // console.log(this.state.maintenance.incomingTimezoneLabel.match(/GMT(\+|-)\d{2}:\d{2}/))
    // const selectedTimezone = this.state.maintenance.incomingTimezoneLabel.match(/(\+|-)\d{2}:\d{2}/)[0]
    // console.log(format(new Date(startDateTime), "yyyy-MM-dd'T'HH:mm:ss"), selectedTimezone)
    // console.log(`${format(new Date(startDateTime), "yyyy-MM-dd'T'HH:mm:ss")}${selectedTimezone}`)
    // const hackedTimeString = `${format(new Date(startDateTime), "yyyy-MM-dd'T'HH:mm:ss")}${selectedTimezone}`
    // // console.log(zonedTimeToUtc(format(new Date(hackedTimeString), 'dd.MM.yyyy HH:mm'), 'Europe/London'))
    // const printDate = toDate(parseISO(hackedTimeString))
    // const printDate2 = format(printDate, 'dd-MM-yyyy HH:mm', { timeZone: 'Europe/London' })
    // console.log(printDate)
    // console.log(printDate2)

    const rescheduleText = ''
    // const startDateTimeDE = addMinutes(formatTz(zonedTimeToUtc(new Date(startDateTime), timeZone), 'dd.MM.yyyy HH:mm'), 120)
    // const endDateTimeDE = addMinutes(formatTz(zonedTimeToUtc(new Date(endDateTime), timeZone), 'dd.MM.yyyy HH:mm'), 120)
    const tzSuffixRAW = 'UTC / GMT+0:00'

    let body = `<body style="color:#666666;">${rescheduleText} Dear Colleagues,​​<p><span>We would like to inform you about planned work on the following CID(s):<br><br> <b>${customerCID}</b> <br><br>The maintenance work is with the following details:</span></p><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>NT-${id}</b></td></tr><tr><td>Start date and time:</td><td><b>${startDateTime} (${tzSuffixRAW})</b></td></tr><tr><td>Finish date and time:</td><td><b>${endDateTime} (${tzSuffixRAW})</b></td></tr>`

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

  sendMail (recipient, customerCid, subj, htmlBody) {
    const host = window.location.host
    const body = this.state.mailBodyText || htmlBody
    const subject = this.state.mailPreviewSubjectText || subj
    const to = this.state.mailPreviewHeaderText || recipient

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

        const getUnique = (arr, comp) => {
          const unique = arr
            .map(e => e[comp])
            .map((e, i, final) => final.indexOf(e) === i && i)
            .filter(e => arr[e]).map(e => arr[e])
          return unique
        }

        if (status === 200 && statusText === 'OK') {
          if (customerCid) {
            const activeRowIndex = this.state.kundencids.findIndex(el => el.kundenCID === customerCid)
            const kundenCidRow = this.state.kundencids[activeRowIndex]
            kundenCidRow.sent = 1
            const updatedKundenCids = [
              kundenCidRow,
              ...this.state.kundencids
            ]
            const deduplicatedKundenCids = getUnique(updatedKundenCids, 'kundenCID')
            this.setState({
              kundencids: deduplicatedKundenCids
            })
            this.gridApi.refreshCells()
            cogoToast.success('Mail Sent', {
              position: 'top-right'
            })
          } else {
            this.setState({
              openPreviewModal: !this.state.openPreviewModal
            })
            cogoToast.success('Mail Sent', {
              position: 'top-right'
            })
          }
        } else {
          if (customerCid) {
            cogoToast.warn('Error Sending Mail', {
              position: 'top-right'
            })
          } else {
            this.setState({
              openPreviewModal: !this.state.openPreviewModal
            })
            cogoToast.warn('Error Sending Mail', {
              position: 'top-right'
            })
          }
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  handleCreatedByChange (data) {
    // console.log(data.nativeEvent)
  }

  handleCalendarCreate () {
    const host = window.location.host
    const company = this.state.maintenance.name
    const cids = this.state.maintenance.betroffeneCIDs || ''
    const supplierCID = this.state.maintenance.derenCID
    const maintId = this.state.maintenance.id
    const startDateTime = this.state.maintenance.startDateTime
    const endDateTime = this.state.maintenance.endDateTime

    fetch(`https://api.${host}/calendar/create`, {
      method: 'post',
      body: JSON.stringify({
        company: company,
        cids: cids,
        supplierCID: supplierCID,
        maintId: maintId,
        startDateTime: startDateTime,
        endDateTime: endDateTime
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
          cogoToast.warn(`Error creating Calendar Entry - ${data.error}`, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  prepareDirectSend (recipient, customerCID) {
    if (!this.state.mailBodyText) {
      const HtmlBody = this.generateMail(customerCID)
      const subject = `Planned Work Notification - NT-${this.state.maintenance.id}`
      this.setState({
        mailBodyText: HtmlBody,
        mailPreviewHeaderText: recipient,
        mailPreviewSubjectText: subject
      })
      this.sendMail(recipient, customerCID, subject, HtmlBody)
    } else {
      this.sendMail(recipient, customerCID)
    }
  }

  renderDateTimeLabel = (date) => {
    if (isValid(date)) {
      return format(new Date(date), 'dd.MM.yyyy HH:mm')
    } else {
      return ''
    }
  }

  // parseDate (dateString, format) {
  //   return parseISO(dateString)
  //   // console.log(dateString, format)
  //   // let timezonedDate = timeZone ? new moment.tz(dateString, format, timeZone)
  //   //                               : new moment(dateString, format);
  //   // const timezonedDate = format(dateString, format)
  //   // return timezonedDate
  // }

  // formatDate (date, formatIn) {
  //   console.log(date, formatIn)
  //   console.log(new Date(date).getTimezoneOffset())
  //   const timezoneOffset = new Date(date).getTimezoneOffset()
  //   const UTCDateTime = subMinutes(new Date(date), timezoneOffset)
  //   console.log(UTCDateTime)
  //   console.log(zonedTimeToUtc(date, 'Europe/Berlin'))


  //   // var dt = moment(date);
  //   // if(timeZone)
  //   //     dt = dt.tz(timeZone);

  //   return format(date, 'yyyy-MM-dd HH:mm:ss')
  // }

  handleStartDate (date) {

    this.setState({
      maintenance: {
        ...this.state.maintenance,
        startDateTime: date[0]
        // Tue Oct 22 2019 15:00:00 GMT+0200 (Central European Summer Time)
        // startDateTime: new Date(date[0]).toISOString()
      }
    })
    const startDateTime = this.state.maintenance.startDateTime
    const endDateTime = this.state.maintenance.endDateTime

    if (startDateTime && endDateTime && isValid(parseISO(startDateTime)) && isValid(parseISO(endDateTime))) {
      const impactCalculation = formatDistance(parseISO(endDateTime), parseISO(startDateTime))
      this.setState({
        impactPlaceholder: impactCalculation
      })
    }
  }



  handleEndDate (date) {
    // console.log(date[0])
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        endDateTime: new Date(date[0]).toISOString()
      }
    })
    const startDateTime = this.state.maintenance.startDateTime
    const endDateTime = this.state.maintenance.endDateTime

    if (startDateTime && endDateTime && isValid(parseISO(startDateTime)) && isValid(parseISO(endDateTime))) {
      const impactCalculation = formatDistance(parseISO(endDateTime), parseISO(startDateTime))
      this.setState({
        impactPlaceholder: impactCalculation
      })
    }
  }

  handleDateTimeSave (element) {
    let newValue
    const maintId = this.state.maintenance.id
    const host = window.location.host
    // console.log(element)
    if (element === 'start') {
      // console.log(isValid(this.state.maintenance.startDateTime))
      // console.log(this.state.maintenance.startDateTime)
      // console.log(isValid(parseISO(this.state.maintenance.startDateTime)))
      // console.log(parseISO(this.state.maintenance.startDateTime))
      // console.log(this.state.maintenance.startDateTime, this.props.jsonData.profile.endDateTime)
      if (isValid(parseISO(this.state.maintenance.startDateTime))) {
        newValue = this.state.maintenance.startDateTime
        // if (newValue === this.props.jsonData.profile.startDateTime) {
        //   return
        // }
      }
    } else if (element === 'end') {
      // console.log(isValid(this.state.maintenance.endDateTime))
      // console.log(isValid(new Date(this.state.maintenance.endDateTime)))
      // console.log(new Date(this.state.maintenance.endDateTime))
      // console.log(this.state.maintenance.endDateTime, this.props.jsonData.profile.endDateTime)
      if (isValid(new Date(this.state.maintenance.endDateTime))) {
        newValue = this.state.maintenance.endDateTime
        // if (newValue === this.props.jsonData.profile.endDateTime) {
        //   // console.log('return if same as old')
        //   return
        // }
      }
    }
    const saveDateTime = (host, maintId, element, newValue) => {
      let newISOTime = parseISO(newValue)
      const selectedTimezone = this.state.maintenance.incomingTimezone
      if (selectedTimezone && isValid(newISOTime)) {
        newISOTime = zonedTimeToUtc(newISOTime, selectedTimezone)
      }
      if (isValid(newISOTime)) {
        const maintId = this.state.maintenance.id
        if (maintId === 'NEW') {
          cogoToast.warn('No CID assigned - Cannot Save', {
            position: 'top-right'
          })
          return
        }
        const saveDateFormat = format(newISOTime, 'yyyy-MM-dd HH:mm:ss')
        // console.log(format(newISOTime, 'yyyy-MM-dd HH:mm:ss'))
        fetch(`https://${host}/api/maintenances/save/dateTime?maintId=${maintId}&element=${element}&value=${saveDateFormat}`, {
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
    }
    saveDateTime(host, maintId, element, newValue)
  }

  handleToggleChange (element, event) {
    const host = window.location.host
    const maintId = this.state.maintenance.id
    const newValue = !eval(`this.state.maintenance.${element}`)
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        [element]: newValue
      }
    })

    if (element === 'done') {
      // mark mail as unread as well
      fetch(`https://api.${host}/inbox/delete`, {
        method: 'post',
        body: JSON.stringify({ m: this.state.maintenance.mailId }),
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      })
        .then(resp => resp.json())
        .then(data => {
          if (data.status === 'complete') {
            cogoToast.success('Message Marked Complete', {
              position: 'top-right'
            })
          } else {
            cogoToast.warn('Error marking as complete', {
              position: 'top-right'
            })
          }
        })
        .catch(err => console.error(`Error - ${err}`))
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
    const zoneLabel = selection.value
    const zoneGMTValue = selection.label
    this.setState({
      maintenance: {
        ...this.state.maintenance,
        incomingTimezone: zoneLabel,
        incomingTimezoneLabel: zoneGMTValue
      }
    })
  }

  handleTimezoneBlur (ev) {
    const incomingTimezone = this.state.maintenance.incomingTimezone || 'Europe/Berlin'
    const host = window.location.host
    fetch(`https://${host}/api/maintenances/save/timezone?maintId=${this.state.maintenance.id}&timezone=${incomingTimezone}`, {
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

  handleSaveOnClick (event) {
    const {
      bearbeitetvon,
      maileingang,
      lieferant,
      mailId,
      updatedAt
    } = this.state.maintenance

    // console.log(Date.parse(incomingDate))
    // const incomingFormatted = format(incomingDate, 'YYYY-MM-DD HH:mm:ss')
    const incomingFormatted = format(new Date(maileingang), 'yyyy-MM-dd HH:mm:ss')
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

  handleLoadTimezones = input => {
    new Promise(resolve => {
      resolve(Timezones)
    })
  }

  render () {
    const {
      maintenance,
      openReadModal,
      openPreviewModal
    } = this.state
    // console.log(maintenance)
    let maintenanceIdDisplay
    if (maintenance.id === 'NEW') {
      maintenanceIdDisplay = maintenance.id
    } else {
      maintenanceIdDisplay = `NT-${maintenance.id}`
    }

    if (this.props.session.user) {
      return (
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
                      <Button className='create-btn' onClick={this.handleSaveOnClick}>
                        <FontAwesomeIcon icon={faPlusCircle} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                      Create
                      </Button>
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
                                <FormInput readOnly id='updated-by' name='updated-by' type='text' value={maintenance.updatedBy} />
                              </FormGroup>
                              <FormGroup>
                                <label htmlFor='supplier'>Timezone</label>
                                <Select
                                  value={this.state.incomingTimezone}
                                  onChange={this.handleTimezoneChange}
                                  options={Timezones}
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
                                  onChange={date => this.handleStartDate(date)}
                                  onClose={() => this.handleDateTimeSave('start')}
                                />
                              </FormGroup>
                              <FormGroup>
                                <label htmlFor='supplier'>Supplier</label>
                                <FormInput id='supplier-input' name='supplier' type='text' value={maintenance.name} />
                              </FormGroup>
                            </Col>
                            <Col style={{ width: '30vw' }}>
                              <FormGroup>
                                <label htmlFor='maileingang'>Mail Arrived</label>
                                <FormInput tabIndex='-1' readOnly id='maileingang-input' name='maileingang' type='text' value={this.convertDateTime(maintenance.maileingang)} />
                              </FormGroup>
                              <FormGroup>
                                <label htmlFor='updated-at'>Updated At</label>
                                <FormInput tabIndex='-1' readOnly id='updated-at' name='updated-at' type='text' value={this.convertDateTime(maintenance.updatedAt)} />
                              </FormGroup>
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
                              <FormGroup>
                                <label htmlFor='end-datetime'>End Date/Time</label>
                                <Flatpickr
                                  data-enable-time
                                  options={{ time_24hr: 'true', allow_input: 'true' }}
                                  className='flatpickr end-date-time'
                                  value={maintenance.endDateTime || null}
                                  onChange={date => this.handleEndDate(date)}
                                  onClose={() => this.handleDateTimeSave('end')}
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
                                    <label htmlFor='impact'>Impact</label>
                                    <FormInput onBlur={() => this.handleTextInputBlur('impact')} id='impact' name='impact' type='text' onChange={this.handleImpactChange} placeholder={this.state.impactPlaceholder} value={maintenance.impact} />
                                  </FormGroup>
                                </Col>
                                <Col>
                                  <FormGroup>
                                    <label htmlFor='location'>Location</label>
                                    <FormInput onBlur={() => this.handleTextInputBlur('location')} id='location' name='location' type='text' onChange={this.handleLocationChange} value={maintenance.location} />
                                  </FormGroup>
                                </Col>
                              </Row>
                              <FormGroup>
                                <label htmlFor='reason'>Reason</label>
                                <FormTextarea id='reason' name='reason' onBlur={() => this.handleTextInputBlur('reason')} onChange={this.handleReasonChange} type='text' value={maintenance.reason} />
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
                                        checked: <FontAwesomeIcon icon={faFirstAid} width='0.5em' style={{ color: '#fff' }} />,
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
                                  // onGridReady={this.handleGridReady}
                                  onGridReady={params => this.gridApi = params.api}
                                  animateRows
                                  pagination
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
                    <Button onClick={this.toggle} outline>
                      <FontAwesomeIcon icon={faEnvelopeOpenText} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                      Read
                    </Button>
                    <Button outline>
                      <FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                      Calendar
                    </Button>
                    <Button>
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
                    background: 'var(--light)',
                    overflow: 'hidden',
                    border: '2px solid #007bff',
                    height: 'auto',
                    zIndex: '101'
                  }}
                  minWidth={500}
                  minHeight={590}
                  bounds='window'
                  dragHandleClassName='modal-incoming-header-text'
                >
                  <div style={{ position: 'relative' }}>
                    <ModalHeader style={{
                      background: 'var(--secondary)',
                      borderRadius: '0px'
                    }}
                    >
                      <img className='mail-icon' src={`https://cdn.statically.io/favicons/${this.state.maintenance.incomingDomain}`} />
                      <div className='modal-incoming-header-text'>
                        <h5 className='modal-incoming-from'>{this.state.maintenance.incomingFrom}</h5>
                        <small className='modal-incoming-subject'>{this.state.maintenance.incomingSubject}</small><br />
                        <small className='modal-incoming-datetime'>{this.state.maintenance.incomingDate}</small>
                      </div>
                      <ButtonGroup style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button outline className='close-read-modal-btn' theme='light' style={{ borderRadius: '5px 5px 0 0', padding: '0.7em 0.9em' }} onClick={this.toggleReadModal}>
                          <FontAwesomeIcon
                            className='close-read-modal-icon' width='1.5em' style={{ color: 'var(--light)', fontSize: '12px' }}
                            icon={faTimesCircle}
                          />
                        </Button>
                        <Button theme='light' style={{ borderRadius: '0 0 5px 5px', padding: '0.7em 0.9em' }} onClick={this.handleTranslate.bind(this)}>
                          <FontAwesomeIcon width='1.5em' style={{ fontSize: '12px' }} className='translate-icon' icon={faLanguage} />
                        </Button>
                      </ButtonGroup>
                    </ModalHeader>
                    <ModalBody className='mail-body' dangerouslySetInnerHTML={{ __html: this.state.translated ? this.state.translatedBody : this.state.maintenance.incomingBody }} />
                  </div>
                </Rnd>
              ) : (
                <></>
              )}
            <Modal backdropClassName='modal-backdrop' animation backdrop size='lg' open={openPreviewModal} toggle={this.togglePreviewModal}>
              <ModalHeader>
                <div className='modal-preview-text-wrapper'>
                  <div className='modal-preview-to-text'>
                    To: {this.state.mailPreviewHeaderText}
                  </div>
                  <div className='modal-preview-to-text'>
                    Cc: service@newtelco.de
                  </div>
                  <div className='modal-preview-Subject-text'>
                    Subject: {this.state.mailPreviewSubjectText}
                  </div>
                </div>
                <Button id='send-mail-btn' style={{ padding: '0.9em 1.1em' }} onClick={this.sendMail}>
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
              border: 2px solid var(--primary);
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
              height: 460px;
              overflow-y: ${this.state.incomingMailIsHtml ? 'scroll' : 'hidden'};
            }
            :global(.mail-body > :first-child) {
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
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
            .modal-incoming-header-text {
              cursor: pointer;
            }
            .modal-incoming-header-text > * {
              color: #fff;
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
      )
    } else {
      return <RequireLogin />
    }
  }
}
