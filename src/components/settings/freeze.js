import React from 'react'
import fetch from 'isomorphic-unfetch'
import cogoToast from 'cogo-toast'
import { AgGridReact } from 'ag-grid-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Select from 'react-select'
import { HotKeys } from 'react-hotkeys'
import StartDateTime from '../ag-grid/startdatetime'
import EndDateTime from '../ag-grid/enddatetime'
import Flatpickr from 'react-flatpickr'
import moment from 'moment-timezone'
import 'flatpickr/dist/themes/material_blue.css'
import {
  faPlusCircle,
  faTrash
} from '@fortawesome/free-solid-svg-icons'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import {
  CardTitle,
  Button,
  ButtonGroup,
  Container,
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  FormTextarea
} from 'shards-react'

export default class Freeze extends React.Component {
  static async getInitialProps ({ req, query }) {
    const pageRequest = `/api/settings/freeze`
    const res = await fetch(pageRequest)
    const json = await res.json()
    return {
      jsonData: json
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      gridOptions: {
        defaultColDef: {
          resizable: true,
          sortable: true,
          filter: true,
          selectable: true,
          editable: true
        },
        columnDefs: [
          {
            headerName: 'ID',
            field: 'id',
            width: 80,
            editable: false,
            sort: { direction: 'asc', priority: 1 }
          },
          {
            headerName: 'Company',
            field: 'name',
            width: 200,
            editable: false
          },
          {
            headerName: 'Start Date',
            field: 'startDateTime',
            width: 200,
            cellRenderer: 'startdateTime'
          },
          {
            headerName: 'End Date',
            field: 'endDateTime',
            width: 200,
            cellRenderer: 'enddateTime'
          },
          {
            headerName: 'Notes',
            field: 'notes',
            width: 300
          }
        ],
        rowSelection: 'single',
        frameworkComponents: {
          startdateTime: StartDateTime,
          enddateTime: EndDateTime
        }
      },
      openFreezeAdd: false,
      openConfirmDeleteModal: false
    }
    this.handleCompanyChange = this.handleCompanyChange.bind(this)
    // this.handleSupplierCidChange = this.handleSupplierCidChange.bind(this)
    this.handleSaveOnClick = this.handleSaveOnClick.bind(this)
    this.toggleFreezeAddModal = this.toggleFreezeAddModal.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleFreezeAdd = this.handleFreezeAdd.bind(this)
    this.toggleFreezeDeleteModal = this.toggleFreezeDeleteModal.bind(this)
    this.handleCellEdit = this.handleCellEdit.bind(this)
  }

  componentDidMount () {
    fetch(`/api/freeze`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          rowData: data.freezeQuery
        })
      })
      .catch(err => console.error(err))
    // fill Companies Select
    fetch(`/api/companies/selectmaint`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          companySelections: data.companies
        })
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  handleGridReady = params => {
    this.gridApi = params.api
    window.gridApi = params.api
    this.gridColumnApi = params.columnApi
    params.api.sizeColumnsToFit()
  }

  toggleFreezeAddModal () {
    this.setState({
      openFreezeAdd: !this.state.openFreezeAdd
    })
  }

  onFirstDataRendered (params) {
    // params.columnApi.autoSizeColumns()
    // params.columnApi.sizeColumnsToFit()
  }

  handleCompanyChange (selectedOption) {
    this.setState({
      newCompany: {
        value: selectedOption.value,
        label: selectedOption.label
      }
    })
  }

  handleNotesChange = (event) => {
    this.setState({
      newNotes: event.target.value
    })
  }

  handleNewStartChange = (date) => {
    const startDate = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')
    console.log(date)
    this.setState({
      newStartDateTime: startDate
    })
  }

  handleNewEndChange = (date) => {
    const endDate = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')
    console.log(date)
    this.setState({
      newEndDateTime: endDate
    })
  }

  // handleSupplierCidChange (ev) {
  //   this.setState({
  //     newSupplierCid: ev.target.value
  //   })
  // }

  handleSaveOnClick () {

  }

  handleDelete () {
    const freezeId = this.state.freezeIdToDelete
    fetch(`/api/settings/delete/freeze?id=${freezeId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.deleteFreezeQuery.affectedRows === 1) {
          cogoToast.success('Delete Success', {
            position: 'top-right'
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
      })
      .catch(err => console.error(err))

    const newRowData = this.state.rowData.filter(el => el.id !== freezeId)
    this.setState({
      rowData: newRowData,
      openConfirmDeleteModal: !this.state.openConfirmDeleteModal
    })
  }

  toggleFreezeDeleteModal () {
    if (window.gridApi) {
      const row = window.gridApi.getSelectedRows()
      const freezeId = row[0].id
      const freezeCompany = row[0].name
      this.setState({
        openConfirmDeleteModal: !this.state.openConfirmDeleteModal,
        freezeIdToDelete: freezeId,
        freezeCompanyToDelete: freezeCompany
      })
    }
  }

  handleFreezeAdd () {
    const {
      newCompany,
      newStartDateTime,
      newEndDateTime,
      newNotes
    } = this.state

    fetch(`/api/settings/add/freeze?companyid=${encodeURIComponent(newCompany.value)}&startdatetime=${encodeURIComponent(newStartDateTime)}&enddatetime=${encodeURIComponent(newEndDateTime)}&notes=${encodeURIComponent(newNotes)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const insertId = data.insertFreezeQuery.insertId
        const newCompanyName = this.state.newCompany.label
        if (data.insertFreezeQuery.affectedRows === 1 && data.insertFreezeQuery.warningCount === 0) {
          cogoToast.success(`Freeze for ${newCompanyName} Added`, {
            position: 'top-right'
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
        const newRowData = this.state.rowData
        newRowData.push({ id: insertId, name: newCompany.label, companyId: newCompany.value, startDateTime: newStartDateTime, endDateTime: newEndDateTime, notes: newNotes })
        this.setState({
          rowData: newRowData,
          openFreezeAdd: !this.state.openFreezeAdd
        })
        window.gridApi.setRowData(newRowData)
      })
      .catch(err => console.error(err))
  }

  handleCellEdit (params) {
    console.log(params.data)
    const id = params.data.id
    const startdate = moment(params.data.startDateTime).format('YYYY.MM.DD HH:mm:ss')
    const enddate = moment(params.data.endDateTime).format('YYYY.MM.DD HH:mm:ss')
    const notes = params.data.notes

    fetch(`/api/settings/edit/freeze?id=${id}&startdate=${encodeURIComponent(startdate)}&enddate=${encodeURIComponent(enddate)}&notes=${encodeURIComponent(notes)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.updateFreezeQuery.affectedRows === 1) {
          cogoToast.success(`Freeze ${id} Updated`, {
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

  render () {
    const {
      newCompany
    } = this.state

    const keyMap = {
      DELETE_MAINT: 'alt+l'
    }

    const handlers = {
      DELETE_MAINT: this.toggleFreezeDeleteModal
    }

    return (
      <>
        <HotKeys keyMap={keyMap} handlers={handlers}>
          <CardTitle>
            <span className='section-title'>Network Freezes</span>
            <ButtonGroup>
              <Button onClick={this.toggleFreezeAddModal} outline theme='primary'>
                <FontAwesomeIcon width='1.125em' style={{ marginRight: '10px' }} icon={faPlusCircle} />
                Add
              </Button>
              <Button onClick={this.toggleFreezeDeleteModal} theme='primary'>
                <FontAwesomeIcon width='1.125em' style={{ marginRight: '10px' }} icon={faTrash} />
                Delete
              </Button>
            </ButtonGroup>
          </CardTitle>
          <div className='table-wrapper'>
            <div
              className='ag-theme-material'
              style={{
                height: '700px',
                width: '100%'
              }}
            >
              <AgGridReact
                gridOptions={this.state.gridOptions}
                onGridReady={this.handleGridReady}
                animateRows
                onCellEditingStopped={this.handleCellEdit}
                rowData={this.state.rowData}
                stopEditingWhenGridLosesFocus
                deltaRowDataMode
                getRowNodeId={(data) => {
                  return data.id
                }}
                onFirstDataRendered={this.onFirstDataRendered.bind(this)}
              />
            </div>
          </div>
          <Modal className='' animation backdrop backdropClassName='modal-backdrop' open={this.state.openFreezeAdd} size='md' toggle={this.toggleFreezeAddModal}>
            <ModalHeader>
              New Freeze
            </ModalHeader>
            <ModalBody className='modal-body'>
              <Container className='container-border'>
                <Row>
                  <Col>
                    <FormGroup>
                      <label>
                        Customer
                      </label>
                      <Select
                        value={newCompany}
                        className='company-select'
                        onChange={this.handleCompanyChange}
                        options={this.state.companySelections}
                        noOptionsMessage={() => 'No Companies Available'}
                        placeholder='Please Select a Company'
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>
                        Start Date/Time (in GMT)
                      </label>
                      <Flatpickr
                        data-enable-time
                        options={{ time_24hr: 'true', allow_input: 'true' }}
                        className='flatpickr end-date-time'
                        value={this.state.newStartDateTime || null}
                        onChange={date => this.handleNewStartChange(date)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>
                        End Date/Time (in GMT)
                      </label>
                      <Flatpickr
                        data-enable-time
                        options={{ time_24hr: 'true', allow_input: 'true' }}
                        className='flatpickr end-date-time'
                        value={this.state.newEndDateTime || null}
                        onChange={date => this.handleNewEndChange(date)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>
                        Notes
                      </label>
                      <FormTextarea onChange={this.handleNotesChange} />
                    </FormGroup>
                  </Col>
                </Row>
              </Container>
              <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Col>
                  <Button onClick={this.handleFreezeAdd} style={{ width: '100%', marginTop: '15px' }} theme='primary'>
                      Save
                  </Button>
                </Col>
              </Row>
            </ModalBody>
          </Modal>
          <Modal className='delete-modal' animation backdrop backdropClassName='modal-backdrop' open={this.state.openConfirmDeleteModal} size='md' toggle={this.toggleFreezeDeleteModal}>
            <ModalHeader className='modal-delete-header'>
              Confirm Delete
            </ModalHeader>
            <ModalBody className='modal-body'>
              <Container className='container-border'>
                <Row>
                  <Col>
                    Are you sure you want to delete <b style={{ fontWeight: '900' }}> {this.state.freezeCompanyToDelete}</b> ({this.state.freezeIdToDelete})
                  </Col>
                </Row>
              </Container>
              <Row style={{ marginTop: '20px' }}>
                <Col>
                  <ButtonGroup style={{ width: '100%' }}>
                    <Button onClick={this.toggleFreezeDeleteModal} outline theme='secondary'>
                      Cancel
                    </Button>
                    <Button onClick={this.handleDelete} theme='danger'>
                      Confirm
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </ModalBody>
          </Modal>
          <style jsx>{`
              :global(.container-border) {
                border: 1px solid var(--light);
                border-radius: 0.325rem;
                margin: 10px 0;
                padding: 1.5rem;
              }
              :global(.modal-body) {
                background-color: var(--primary-bg);
                color: var(--font-color);
              }
              :global(.modal-header) {
                background: var(--secondary-bg);
                color: var(--font-color);
                display: flex;
                justify-content: flex-start;
                align-content: center;
              }
              :global(.card-title) {
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              :global(.ag-cell.ag-cell-inline-editing) {
                padding: 10px !important;
                height: inherit !important;
              }
              :global(.flatpickr) {
                height: auto;
                width: 100%;
                padding: .5rem 1rem;
                font-size: .95rem;
                line-height: 1.5;
                color: #495057;
                background-color: var(--white);
                border: 1px solid #becad6;
                font-weight: 300;
                will-change: border-color,box-shadow;
                border-radius: .375rem;
                box-shadow: none;
                transition: box-shadow 250ms cubic-bezier(.27,.01,.38,1.06),border 250ms cubic-bezier(.27,.01,.38,1.06);
              }
              :global(.company-select [class$='-placeholder']) {
                color: var(--border-color) !important;
              }
              :global(.company-select *) {
                background-color: var(--input);
                color: var(--font-color) !important;
              }
              :global(.company-select div[class$="-multiValue"]) {
                background-color: var(--input);
                color: var(--font-color);
              }
              :global(.company-select div[class$="-singleValue"]) {
                background-color: var(--input);
                color: var(--font-color);
              }
              :global(.form-group textarea:focus) {
                background-color: var(--primary-bg);
                color: var(--font-color);
              }
              :global(.form-group textarea) {
                background-color: var(--primary-bg);
                color: var(--font-color);
              }
              :global(.form-group label) {
                color: var(--font-color);
              }
              :global(.form-group input) {
                background-color: var(--primary-bg);
                color: var(--font-color);
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
            `}
          </style>
        </HotKeys>
      </>
    )
  }
}
