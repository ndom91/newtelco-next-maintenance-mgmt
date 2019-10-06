import React from 'react'
import Layout from '../src/components/layout'
import fetch from 'isomorphic-unfetch'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import RequireLogin from '../src/components/require-login'
import { NextAuth } from 'next-auth/client'
import Toggle from 'react-toggle'
import './style/maintenance.css'
import Select from 'react-select'
import Router from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'react-quill/dist/quill.snow.css'
import { format, isValid } from 'date-fns'
import {
  faSave,
  faCalendarAlt,
  faArrowLeft,
  faEnvelopeOpenText,
  faLanguage,
  faFirstAid
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
  Tooltip,
  ListGroup,
  ListGroupItem
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
      maintenance: {},
      open: false,
      translateTooltipOpen: false,
      translated: false,
      translatedBody: '',
      notesText: props.jsonData.profile.notes,
      lieferantcids: {},
      kundencids: [],
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
            resizable: false
            // cellRenderer: 'sendMailBtn',
          }, {
            headerName: 'CID',
            field: 'kundenCID',
            width: 100,
            sort: { direction: 'asc', priority: 0 }
          }, {
            headerName: 'Customer',
            field: 'name'
          }, {
            headerName: 'Protected',
            field: 'protected',
            width: 130
          }, {
            headerName: 'Recipient',
            field: 'maintenanceRecipient',
            // cellRenderer: 'supplier',
            width: 150
          }
        ],
        context: { componentParent: this },
        // frameworkComponents: {
        //   sendMailBtn: sendMailBtn,
        // },
        // rowSelection: 'multiple',
        // rowMultiSelectWithClick: true,
        paginationPageSize: 10,
        rowClass: 'row-class'
      }
    }
    this.toggle = this.toggle.bind(this)
    this.toggleTooltip = this.toggleTooltip.bind(this)
    this.handleNotesChange = this.handleNotesChange.bind(this)
    if (document) {
      this.quill = require('react-quill')
      this.reactQuillRef = null
    }
  }

  handleTranslate () {
    const {
      body
    } = this.props.jsonData.profile

    if (this.state.translated) {
      this.setState({
        translatedBody: '',
        translated: !this.state.translated
      })
    } else {
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
            originalModalBody: this.props.jsonData.profile.body,
            translatedBody: text,
            translated: !this.state.translated
          })
        })
        .catch(err => console.error(`Error - ${err}`))
    }
  }

  componentDidMount () {
    this.attachQuillRefs()
    const editor = this.reactQuillRef.getEditor()
    const unprivilegedEditor = this.reactQuillRef.makeUnprivilegedEditor(editor)
    const quillContents = unprivilegedEditor.getContents()
    if (this.props.jsonData.profile.id === 'NEW') {
      const {
        email
      } = this.props.session.user
      const username = email.substr(0, email.indexOf('@'))
      const maintenance = {
        ...this.props.jsonData.profile,
        bearbeitetvon: username,
        updatedAt: format(new Date(), 'MM.dd.yyyy HH:mm') //, { locale: de })
      }
      this.setState({
        maintenance: maintenance,
        width: window.innerWidth,
        notesText: quillContents
      })
    } else {
      this.setState({
        maintenance: this.props.jsonData.profile,
        width: window.innerWidth
      })
    }
    // get available supplier CIDs
    let lieferantId

    if (this.props.jsonData.profile.lieferant) {
      lieferantId = this.props.jsonData.profile.lieferant
    } else {
      const lieferantDomain = this.props.jsonData.profile.name
    }
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
    // get available Newtelco CIDs based on supplier CID
    this.fetchMailCIDs(lieferantId)
  }

  getUnique (arr, comp) {
    const unique = arr
      .map(e => e[comp])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter(e => arr[e]).map(e => arr[e]);
    return unique;
  }

  fetchMailCIDs (lieferantId) {
    const host = window.location.host
    fetch(`https://${host}/api/customercids/${lieferantId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        console.log(data)
        const existingKundenCids = [
          data.kundenCIDsResult[0],
          ...this.state.kundencids
        ]
        const uniqueKundenCids = this.getUnique(existingKundenCids, 'kundenCID')
        this.setState({
          kundencids: uniqueKundenCids
        })
        console.log(this.state.kundencids)
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  componentDidUpdate () {
    this.attachQuillRefs()
  }

  attachQuillRefs = () => {
    if (typeof this.reactQuillRef.getEditor !== 'function') return
    this.quillRef = this.reactQuillRef.getEditor()
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

  handleNotesChange (content, delta, source, editor) {
    this.setState({ notesText: editor.getContents() })
  }

  handleSelectLieferantChange = selectedOption => {
    console.log(selectedOption)
    selectedOption.forEach(option => {
      this.fetchMailCIDs(option.value)
    })
    this.setState({ selectedLieferant: selectedOption })
  }

  toggle () {
    this.setState({
      open: !this.state.open
    })
  }

  toggleTooltip () {
    this.setState({
      translateTooltipOpen: !this.state.translateTooltipOpen
    })
  }

  onGridReady = params => {
    this.gridApi = params.gridApi
    this.gridColumnApi = params.gridColumnApi
    // params.columnApi.sizeColumnsToFit()
    params.columnApi.autoSizeColumns()
  }

  onFirstDataRendered (params) {
    // params.columnApi.autoSizeColumns()
    // params.columnApi.sizeColumnsToFit()
  }

  render () {
    const {
      maintenance,
      open
    } = this.state
    console.log(maintenance)
    const Quill = this.quill
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
                                <FormInput id='edited-by-input' name='edited-by' type='text' value={maintenance.bearbeitetvon} />
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
                                <Badge theme='secondary' outline>
                                  <label>
                                    <Toggle defaultChecked={maintenance.cancelled === 1} />
                                    <div style={{ marginTop: '10px' }}>Cancelled</div>
                                  </label>
                                </Badge>
                                <Badge theme='secondary' outline>
                                  <label>
                                    <Toggle
                                      icons={{
                                        checked: <FontAwesomeIcon icon={faFirstAid} width='0.5em' style={{ color: '#fff' }} />,
                                        unchecked: null
                                      }}
                                      checked={maintenance.emergency === 1}
                                    />
                                    <div style={{ marginTop: '10px' }}>Emergency</div>
                                  </label>
                                </Badge>
                                <Badge theme='secondary'>
                                  <label>
                                    <Toggle
                                      checked={maintenance.done === 1}
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
                                {document
                                  ? <Quill
                                    value={this.state.notesText}
                                    ref={(el) => { this.reactQuillRef = el }}
                                    style={{ borderRadius: '5px' }}
                                    onChange={this.handleNotesChange}
                                    theme='snow'
                                    />
                                  : <textarea value={this.state.notesText} />}
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
                                  onGridReady={this.onGridReady}
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
            <Modal className='mail-modal-body' animation backdrop backdropClassName='modal-backdrop' open={open} size='lg' toggle={this.toggle}>
              <ModalHeader>
                <div className='modal-header-text'>
                  {this.props.jsonData.profile.from} <br />
                  <small className='mail-subject'>{this.props.jsonData.profile.subject}</small>
                </div>
                <Button id='translate-tooltip' style={{ padding: '1em' }} onClick={this.handleTranslate.bind(this)}>
                  <FontAwesomeIcon width='1.5em' className='translate-icon' icon={faLanguage} />
                </Button>
              </ModalHeader>
              <Tooltip
                open={this.state.translateTooltipOpen}
                target='#translate-tooltip'
                toggle={this.toggleTooltip}
              >
                  Translate
              </Tooltip>
              <ModalBody className='mail-body' dangerouslySetInnerHTML={{ __html: this.state.translatedBody || this.props.jsonData.profile.body }} />
            </Modal>
          </Card>
          <style jsx>{`
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
              justify-content: space-between;
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
            .modal-header-text {
              flex-grow: 1;
            }
            :global(.modal-title) {
              display: flex;
              justify-content: space-between;
              width: 100%;
              align-items: center;
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
