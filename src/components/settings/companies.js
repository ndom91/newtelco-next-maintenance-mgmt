import React from 'react'
import fetch from 'isomorphic-unfetch'
import cogoToast from 'cogo-toast'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import { HotKeys } from 'react-hotkeys'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons'
import {
  CardTitle,
  Badge,
  Button,
  ButtonGroup,
  Container,
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  FormInput
} from 'shards-react'

export default class Companies extends React.Component {
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://${host}/api/settings/companies`
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
            width: 200,
            editable: false
          },
          {
            headerName: 'Domain',
            field: 'mailDomain',
            width: 200,
            sort: { direction: 'asc' }
          },
          {
            headerName: 'Company',
            field: 'name',
            width: 200
          },
          {
            headerName: 'Recipient',
            field: 'maintenanceRecipient',
            width: 200
          }
        ],
        rowSelection: 'single'
      },
      rowData: [],
      newName: '',
      newDomain: '',
      newRecipient: '',
      openCompanyModal: false,
      openConfirmDeleteModal: false
    }
    this.toggleCompanyAdd = this.toggleCompanyAdd.bind(this)
    this.handleDomainChange = this.handleDomainChange.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleRecipientChange = this.handleRecipientChange.bind(this)
    this.handleAddCompany = this.handleAddCompany.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.toggleCompanyDeleteModal = this.toggleCompanyDeleteModal.bind(this)
    this.handleCellEdit = this.handleCellEdit.bind(this)
  }

  componentDidMount () {
    const host = window.location.host
    fetch(`https://${host}/api/companies`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          rowData: data.companies
        })
      })
      .catch(err => console.error(err))
  }

  handleGridReady = params => {
    this.gridApi = params.api
    window.gridApi = params.api
    this.gridColumnApi = params.columnApi
    params.api.sizeColumnsToFit()
  };

  onFirstDataRendered (params) {
    // params.columnApi.autoSizeColumns()
    // params.columnApi.sizeColumnsToFit()
  }

  toggleCompanyAdd () {
    this.setState({
      openCompanyModal: !this.state.openCompanyModal
    })
  }

  handleDomainChange (ev) {
    this.setState({
      newDomain: ev.target.value
    })
  }

  handleNameChange (ev) {
    this.setState({
      newName: ev.target.value
    })
  }

  handleRecipientChange (ev) {
    this.setState({
      newRecipient: ev.target.value
    })
  }

  handleDelete () {
    const host = window.location.host
    const companyId = this.state.companyIdToDelete
    fetch(`https://${host}/api/settings/delete/companies?id=${companyId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.deleteCompanyQuery.affectedRows === 1) {
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

    const newRowData = this.state.rowData.filter(el => el.id !== companyId)
    this.setState({
      rowData: newRowData,
      openConfirmDeleteModal: !this.state.openConfirmDeleteModal
    })
  }

  toggleCompanyDeleteModal () {
    if (window.gridApi) {
      const row = window.gridApi.getSelectedRows()
      const companyId = row[0].id
      const companyName = row[0].name
      this.setState({
        openConfirmDeleteModal: !this.state.openConfirmDeleteModal,
        companyIdToDelete: companyId,
        companyNameToDelete: companyName
      })
    }
  }

  handleAddCompany () {
    const {
      newName,
      newDomain,
      newRecipient
    } = this.state

    const host = window.location.host
    fetch(`https://${host}/api/settings/add/companies?name=${encodeURIComponent(newName)}&domain=${encodeURIComponent(newDomain)}&recipient=${encodeURIComponent(newRecipient)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const insertId = data.insertCompanyQuery.insertId
        if (data.insertCompanyQuery.affectedRows === 1 && data.insertCompanyQuery.warningCount === 0) {
          cogoToast.success(`Company ${newName} Added`, {
            position: 'top-right'
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
        const newRowData = this.state.rowData
        newRowData.push({ id: insertId, mailDomain: newDomain, maintenanceRecipient: newRecipient, name: newName })
        this.setState({
          rowData: newRowData,
          openCompanyModal: !this.state.openCompanyModal
        })
      })
      .catch(err => console.error(err))
  }

  handleCellEdit (params) {
    const id = params.data.id
    const newName = params.data.name
    const newDomain = params.data.mailDomain
    const newRecipient = params.data.maintenanceRecipient

    const host = window.location.host
    fetch(`https://${host}/api/settings/edit/companies?id=${id}&name=${encodeURIComponent(newName)}&domain=${encodeURIComponent(newDomain)}&recipient=${encodeURIComponent(newRecipient)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        console.log(data)
        if (data.updateCompanyQuery.affectedRows === 1) {
          cogoToast.success(`Company ${newName} Updated`, {
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
      newDomain,
      newName,
      newRecipient
    } = this.state

    const keyMap = {
      DELETE_MAINT: 'alt+l'
    }

    const handlers = {
      DELETE_MAINT: this.toggleCompanyDeleteModal
    }

    return (
      <>
        <HotKeys keyMap={keyMap} handlers={handlers}>
          <CardTitle>
            <span className='section-title'>Companies</span>
            <Button onClick={this.toggleCompanyAdd} outline theme='primary'>
              <FontAwesomeIcon width='1.125em' style={{ marginRight: '10px' }} icon={faPlusCircle} />
              Add
            </Button>
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
                rowData={this.state.rowData}
                onCellEditingStopped={this.handleCellEdit}
                animateRows
                stopEditingWhenGridLosesFocus
                onFirstDataRendered={this.onFirstDataRendered.bind(this)}
              />
            </div>
          </div>
          <Modal className='modal-body' animation backdrop backdropClassName='modal-backdrop' open={this.state.openCompanyModal} size='md' toggle={this.toggleCompanyAdd}>
            <ModalHeader>
              New Company
            </ModalHeader>
            <ModalBody className='modal-body'>
              <Container className='container-border'>
                <Row>
                  <Col>
                    <FormGroup>
                      <label htmlFor='selectCompany'>
                        Name
                      </label>
                      <FormInput id='updated-by' name='updated-by' type='text' value={newName} onChange={this.handleNameChange} />
                    </FormGroup>
                    <FormGroup>
                      <label htmlFor='selectCompany'>
                        Domain
                      </label>
                      <FormInput id='updated-by' name='updated-by' type='text' value={newDomain} onChange={this.handleDomainChange} />
                    </FormGroup>
                    <FormGroup>
                      <label style={{ display: 'flex', justifyContent: 'space-between' }} htmlFor='selectCompany'>
                        Recipient <Badge outline theme='primary'>separate multiple via semicolon `;`</Badge>
                      </label>
                      <FormInput id='updated-by' name='updated-by' type='text' value={newRecipient} onChange={this.handleRecipientChange} />
                    </FormGroup>
                  </Col>
                </Row>
                <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Col>
                    <Button onClick={this.handleAddCompany} style={{ width: '100%', marginTop: '15px' }} theme='primary'>
                      Save
                    </Button>
                  </Col>
                </Row>

              </Container>
            </ModalBody>
          </Modal>
          <Modal className='delete-modal' animation backdrop backdropClassName='modal-backdrop' open={this.state.openConfirmDeleteModal} size='md' toggle={this.toggleConfirmDeleteModal}>
            <ModalHeader className='modal-delete-header'>
              Confirm Delete
            </ModalHeader>
            <ModalBody className='mail-body'>
              <Container className='container-border'>
                <Row>
                  <Col>
                    Are you sure you want to delete <b style={{ fontWeight: '900' }}> {this.state.companyNameToDelete}</b> ({this.state.companyIdToDelete})
                  </Col>
                </Row>
              </Container>
              <Row style={{ marginTop: '20px' }}>
                <Col>
                  <ButtonGroup style={{ width: '100%' }}>
                    <Button onClick={this.toggleCompanyDeleteModal} outline theme='secondary'>
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
              :global(.modal-delete-header) {
                background: var(--light);
              }
              :global(.delete-modal) {
                margin-top: 50px;
              }
              :global(.modal-title) {
                font-size: 42px;
              }
              :global(.modal-body) {
                padding: 1rem;
              }
              :global(.container-border) {
                border: 1px solid var(--light);
                border-radius: 0.325rem;
                margin: 10px 0;
                padding: 1.5rem;
              }
              :global(.modal-header) {
                background: var(--light);
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
            `}
          </style>
        </HotKeys>
      </>
    )
  }
}
