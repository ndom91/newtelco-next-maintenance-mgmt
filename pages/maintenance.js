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
import Router from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Editor as TinyEditor } from '@tinymce/tinymce-react'
import { format, isValid } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime, format as formatTz } from 'date-fns-tz'
import {
  faSave,
  faCalendarAlt,
  faArrowLeft,
  faEnvelopeOpenText,
  faLanguage,
  faFirstAid,
  faSearch,
  faPaperPlane
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
  FormInput,
  Modal,
  ModalHeader,
  ModalBody,
  Tooltip
} from 'shards-react'

export default class Maintenance extends React.Component {
  static async getInitialProps ({ req, query }) {
    console.log('q', query)
    if (query.id === 'NEW') {
      // query all mail info about company, available CIDs, etc.
      // combine with existing query object
      //
      // const host = req ? req.headers['x-forwarded-host'] : location.host
      // const pageRequest = `https://${host}/api/maintenances/${query.id}`
      // const res = await fetch(pageRequest)
      // const json = await res.json()
      return {
        jsonData: { profile: query },
        session: await NextAuth.init({ req })
      }
    } else {
      const host = req ? req.headers['x-forwarded-host'] : location.host
      const pageRequest = `https://${host}/api/maintenances/${query.id}`
      const res = await fetch(pageRequest)
      const json = await res.json()
      return {
        jsonData: json,
        session: await NextAuth.init({ req })
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      width: 0,
      maintenance: {
        incomingBody: this.props.jsonData.profile.body
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
            headerName: 'Protected',
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
            // cellRenderer: 'supplier',
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
      cogoToast.warning('No Mail Body Available', {
        position: 'top-right'
      })
    }
  }

  fetchLieferantCIDs (lieferantId) {
    const host = window.location.host
    fetch(`https://${host}/api/lieferantcids?id=${lieferantId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        // console.log(data)
        const selectedLieferantCIDid = parseInt(this.props.jsonData.profile.derenCIDid) || null
        const selectedLieferantCIDvalue = this.props.jsonData.profile.derenCID || null
        this.setState({
          lieferantcids: data.lieferantCIDsResult,
          selectedLieferant: {
            label: selectedLieferantCIDvalue,
            value: selectedLieferantCIDid
          }
        })
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  componentDidMount () {
    if (this.props.jsonData.profile.id === 'NEW') {
      const {
        email
      } = this.props.session.user
      const username = email.substr(0, email.indexOf('@'))
      const maintenance = {
        ...this.props.jsonData.profile,
        bearbeitetvon: username,
        incomingBody: this.props.jsonData.profile.body,
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
      this.setState({
        maintenance: this.props.jsonData.profile,
        width: window.innerWidth
      })
    }
    // get available supplier CIDs

    const host = window.location.host
    if (this.props.jsonData.profile.lieferant) {
      const lieferantId = this.props.jsonData.profile.lieferant
      // get available Newtelco CIDs based on supplier CID

      this.fetchLieferantCIDs(lieferantId)
      this.fetchMailCIDs(lieferantId)
    } else {
      const lieferantDomain = this.props.jsonData.profile.name
      // fetch id based on domain, then fetch available CIDs
      fetch(`https://${host}/api/companies/domain?id=${lieferantDomain}`, {
        method: 'get'
      })
        .then(resp => resp.json())
        .then(data => {
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

  fetchMailCIDs (lieferantId) {
    const host = window.location.host
    fetch(`https://${host}/api/customercids/${lieferantId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        data.kundenCIDsResult[0].sent = 0

        const existingKundenCids = [
          data.kundenCIDsResult[0],
          ...this.state.kundencids
        ]
        const uniqueKundenCids = this.getUnique(existingKundenCids, 'kundenCID')
        this.setState({
          kundencids: uniqueKundenCids
        })
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

  handleNotesChange (value) {
    this.setState({ notesText: value })
  }

  handleMailPreviewChange (content, delta, source, editor) {
    this.setState({ mailBodyText: editor.getContents() })
  }

  handleSelectLieferantChange = selectedOption => {
    if (selectedOption) {
      selectedOption.forEach(option => {
        this.fetchMailCIDs(option.value)
      })
      this.setState({ selectedLieferant: selectedOption })
    }
  }

  toggleReadModal () {
    if (!this.state.maintenance.incomingBody) {
      const host = window.location.host
      fetch(`https://api.${host}/mail/${this.state.maintenance.receivedmail}`, {
        method: 'get'
      })
        .then(resp => resp.json())
        .then(data => {
          // console.log(data)
          this.setState({
            openReadModal: !this.state.openReadModal,
            maintenance: {
              incomingBody: data.body,
              incomingFrom: data.from,
              incomingSubject: data.subject,
              incomingDate: data.date,
              incomingDomain: this.props.jsonData.profile.mailDomain,
              ...this.state.maintenance
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
      this.setState({
        openPreviewModal: !this.state.openPreviewModal,
        mailBodyText: HtmlBody,
        mailPreviewHeaderText: recipient || this.state.mailPreviewHeaderText,
        mailPreviewSubjectText: `Planned Work Notification - ${this.state.maintenance.id}`
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
      location
    } = this.state.maintenance

    const rescheduleText = ''
    const timeZone = 'Europe/Berlin'
    const startDateTimeDE = formatTz(utcToZonedTime(new Date(startDateTime), timeZone), 'dd.MM.yyyy HH:mm')
    const endDateTimeDE = formatTz(utcToZonedTime(new Date(endDateTime), timeZone), 'dd.MM.yyyy HH:mm')
    const tzSuffixRAW = 'CET / GMT+2:00'

    let body = `<body style="color:#666666;">${rescheduleText} Dear Colleagues,​​<p><span>We would like to inform you about planned work on the following CID(s):<br><br> <b>${customerCID}</b> <br><br>The maintenance work is with the following details:</span></p><table border="0" cellspacing="2" cellpadding="2" width="775px"><tr><td style='width: 205px;'>Maintenance ID:</td><td><b>${id}</b></td></tr><tr><td>Start date and time:</td><td><b>${startDateTimeDE} (${tzSuffixRAW})</b></td></tr><tr><td>Finish date and time:</td><td><b>${endDateTimeDE} (${tzSuffixRAW})</b></td></tr>`

    if (impact !== '') {
      body = body + '<tr><td>Impact:</td><td>' + impact + '</td></tr>'
    }

    if (location !== '') {
      body = body + '<tr><td>Location:</td><td>' + location + '</td></tr>'
    }

    if (reason !== '') {
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
            cogoToast.warning('Error Sending Mail', {
              position: 'top-right'
            })
          } else {
            this.setState({
              openPreviewModal: !this.state.openPreviewModal
            })
            cogoToast.warning('Error Sending Mail', {
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
          cogoToast.warning('Error creating Calendar Entry', data.error, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  prepareDirectSend (recipient, customerCID) {
    console.log(customerCID)
    if (!this.state.mailBodyText) {
      const HtmlBody = this.generateMail(customerCID)
      const subject = `Planned Work Notification - ${this.state.maintenance.id}`
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

  render () {
    const {
      maintenance,
      openReadModal,
      openPreviewModal
    } = this.state
    // console.log(maintenance)
    if (this.props.session.user) {
      return (
        <Layout session={this.props.session}>
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
                    {maintenance.id}
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
                      <Button>
                        <FontAwesomeIcon icon={faSave} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                      Save
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
                                <FormInput id='edited-by-input' name='edited-by' type='text' value={maintenance.bearbeitetvon} onChange={this.handleCreatedByChange} />
                              </FormGroup>
                              <FormGroup>
                                <label htmlFor='supplier'>Supplier</label>
                                <FormInput id='supplier-input' name='supplier' type='text' value={maintenance.name} />
                              </FormGroup>
                              <FormGroup>
                                <label htmlFor='start-datetime'>Start Date/Time</label>
                                <FormInput id='start-datetime' name='start-datetime' type='text' value={this.convertDateTime(maintenance.startDateTime)} />
                              </FormGroup>
                              {/* todo: Timezone after Start/End Time */}
                              <FormGroup>
                                <label htmlFor='their-cid'>Their CID</label>
                                <Select
                                  value={this.state.selectedLieferant}
                                  onChange={this.handleSelectLieferantChange}
                                  options={this.state.lieferantcids}
                                  isMulti
                                  noOptionsMessage='No CIDs for this Supplier'
                                  placeholder='Please select a CID'
                                />
                              </FormGroup>
                            </Col>
                            <Col style={{ width: '30vw' }}>
                              <FormGroup>
                                <label htmlFor='maileingang'>Mail Arrived</label>
                                <FormInput id='maileingang-input' name='maileingang' type='text' value={this.convertDateTime(maintenance.maileingang)} />
                              </FormGroup>
                              <FormGroup>
                                <label htmlFor='updated-at'>Updated At</label>
                                <FormInput id='updated-at' name='updated-at' type='text' value={this.convertDateTime(maintenance.updatedAt)} />
                              </FormGroup>
                              <FormGroup>
                                <label htmlFor='end-datetime'>End Date/Time</label>
                                <FormInput id='end-datetime' name='end-datetime' type='text' value={this.convertDateTime(maintenance.endDateTime)} />
                              </FormGroup>
                              <FormGroup>
                                <label htmlFor='updated-by'>Last Updated By</label>
                                <FormInput id='updated-by' name='updated-by' type='text' value={maintenance.updatedBy} />
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
                                    <label htmlFor='updated-by'>Impact</label>
                                    <FormInput id='updated-by' name='updated-by' type='text' value={maintenance.impact} />
                                  </FormGroup>
                                </Col>
                                <Col>
                                  <FormGroup>
                                    <label htmlFor='updated-by'>Location</label>
                                    <FormInput id='updated-by' name='updated-by' type='text' value={maintenance.location} />
                                  </FormGroup>
                                </Col>
                              </Row>
                              <FormGroup>
                                <label htmlFor='updated-by'>Reason</label>
                                <FormInput id='updated-by' name='updated-by' type='text' value={maintenance.reason} />
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
                                    <Toggle defaultChecked={maintenance.cancelled === 1} />
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
                                      defaultChecked={maintenance.emergency === 1}
                                    />
                                    <div style={{ marginTop: '10px' }}>Emergency</div>
                                  </label>
                                </Badge>
                                <Badge theme='secondary' outline>
                                  <label>
                                    <Toggle
                                      defaultChecked={maintenance.done === 1}
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
                                  init={{
                                    height: 500,
                                    menubar: false,
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
                                  onGridReady={ params => this.gridApi = params.api }
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
                      <FontAwesomeIcon icon={faSave} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                      Save
                    </Button>
                  </ButtonGroup>
                ) : (
                  <span />
                )}
            </CardFooter>
            <Modal className='mail-modal-body' animation backdrop backdropClassName='modal-backdrop' open={openReadModal} size='lg' toggle={this.toggleReadModal}>
              <ModalHeader>
                <img className='mail-icon' src={`https://besticon-demo.herokuapp.com/icon?size=40..100..360&url=${this.state.maintenance.incomingDomain}`} />
                <div className='modal-incoming-header-text'>
                  <h5 className='modal-incoming-from'>{this.state.maintenance.incomingFrom}</h5>
                  <small className='modal-incoming-subject'>{this.state.maintenance.incomingSubject}</small><br />
                  <small className='modal-incoming-datetime'>{this.state.maintenance.incomingDate}</small>
                </div>
                <Button id='translate-tooltip' style={{ padding: '0.7em 0.9em' }} onClick={this.handleTranslate.bind(this)}>
                  <FontAwesomeIcon width='1.5em' className='translate-icon' icon={faLanguage} />
                </Button>
              </ModalHeader>
              <Tooltip
                open={this.state.translateTooltipOpen}
                target='#translate-tooltip'
                toggle={this.toggleTooltip}
                placement='bottom'
                noArrow
              >
                  Translate
              </Tooltip>
              <ModalBody className='mail-body' dangerouslySetInnerHTML={{ __html: this.state.translated ? this.state.translatedBody : this.state.maintenance.incomingBody }} />
            </Modal>
            <Modal backdropClassName='modal-backdrop' animation backdrop size='lg' open={openPreviewModal} toggle={this.togglePreviewModal}>
              <ModalHeader>
                <div className='modal-preview-text-wrapper'>
                  <div className='modal-preview-to-text'>
                    To: {this.state.mailPreviewHeaderText}
                  </div>
                  <div className='modal-preview-Subject-text'>
                    Subject: {this.state.mailPreviewSubjectText}
                  </div>
                </div>
                <Button id='send-mail-btn' style={{ padding: '0.9em 1.1em' }} onClick={this.sendMail}>
                  <FontAwesomeIcon width='1.5em' style={{ fontSize: '20px' }} className='modal-preview-send-icon' icon={faPaperPlane} />
                </Button>
              </ModalHeader>
              <ModalBody>
                <TinyEditor
                  initialValue={this.state.mailBodyText}
                  apiKey='ttv2x1is9joc0fi7v6f6rzi0u98w2mpehx53mnc1277omr7s'
                  init={{
                    height: 500,
                    menubar: false,
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
            .mail-icon {
              width: 96px;
              height: 96px;
              border: 2px solid var(--primary);
              padding: 10px;
              border-radius: 5px;
              margin-right: 10px;
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
              overflow-y: scroll;
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
              :global(.col) {
                {/* padding-left: 5px;
                padding-right: 5px; */}
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
