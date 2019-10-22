import React from 'react'
import fetch from 'isomorphic-unfetch'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import Select from 'react-select'
import cogoToast from 'cogo-toast'
import { HotKeys } from 'react-hotkeys'
import ProtectedIcon from '../ag-grid/protected'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlusCircle,
  faLock,
  faLockOpen
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

export default class CustomerCIDs extends React.Component {
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://${host}/api/settings/theircids` // ?page=${query.page || 1}&limit=${query.limit || 41}`
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
            headerName: 'Newtelco CID',
            field: 'kundenCID',
            width: 200
          },
          {
            headerName: 'Customer',
            field: 'name',
            width: 200,
            // sort: { direction: 'asc', priority: 0 },
            editable: false
          },
          {
            headerName: 'Their CID',
            field: 'derenCID',
            width: 200,
            editable: false
          },
          {
            headerName: 'Protected',
            field: 'protected',
            width: 200,
            cellRenderer: 'protectedIcon'
          }
        ],
        rowSelection: 'single',
        frameworkComponents: {
          protectedIcon: ProtectedIcon
        }
      },
      newNewtelcoCid: '',
      openCustomerCidAdd: false,
      openConfirmDeleteModal: false
    }
    this.toggleCustomerCidAdd = this.toggleCustomerCidAdd.bind(this)
    this.handleNewtelcoCidChange = this.handleNewtelcoCidChange.bind(this)
    this.handleSupplierCidChange = this.handleSupplierCidChange.bind(this)
    this.handleProtectionChange = this.handleProtectionChange.bind(this)
    this.handleCompanyChange = this.handleCompanyChange.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.toggleCustomerCidDeleteModal = this.toggleCustomerCidDeleteModal.bind(this)
    this.handleAddCustomerCid = this.handleAddCustomerCid.bind(this)
    this.handleCellEdit = this.handleCellEdit.bind(this)
  }

  componentDidMount () {
    const host = window.location.host
    fetch(`https://${host}/api/customercids`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          rowData: data.customercids
        })
      })
      .catch(err => console.error(err))
    // fill Companies Select
    fetch(`https://${host}/api/companies/selectmaint`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          companySelections: data.companies
        })
      })
      .catch(err => console.error(`Error - ${err}`))
    // fill Supplier Select
    fetch(`https://${host}/api/lieferantcids/select`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          supplierSelections: data.lieferantCids
        })
      })
      .catch(err => console.error(`Error - ${err}`))
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
    // params.api.setSortModel({ colId: 'name', sort: 'desc' })
  }

  toggleCustomerCidAdd () {
    this.setState({
      openCustomerCidAdd: !this.state.openCustomerCidAdd
    })
  }

  handleCompanyChange (selectedOption) {
    this.setState({
      newCompanySelection: {
        value: selectedOption.value,
        label: selectedOption.label
      }
    })
  }

  handleProtectionChange (ev) {
    this.setState({
      newProtection: !this.state.newProtection
    })
  }

  handleSupplierCidChange (selectedOption) {
    this.setState({
      newSupplierSelection: {
        value: selectedOption.value,
        label: selectedOption.label
      }
    })
  }

  handleNewtelcoCidChange (ev) {
    this.setState({
      newNewtelcoCid: ev.target.value
    })
  }

  handleDelete () {
    const host = window.location.host
    const customerCidId = this.state.customerCidIdToDelete
    fetch(`https://${host}/api/settings/delete/customercids?id=${customerCidId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.deleteCustomerCidQuery.affectedRows === 1) {
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

    const newRowData = this.state.rowData.filter(el => el.id !== customerCidId)
    this.setState({
      rowData: newRowData,
      openConfirmDeleteModal: !this.state.openConfirmDeleteModal
    })
  }

  toggleCustomerCidDeleteModal () {
    if (window.gridApi) {
      const row = window.gridApi.getSelectedRows()
      const customerCidId = row[0].id
      const customerCidName = row[0].kundenCID
      this.setState({
        openConfirmDeleteModal: !this.state.openConfirmDeleteModal,
        customerCidIdToDelete: customerCidId,
        customerCidNameToDelete: customerCidName
      })
    }
  }

  handleAddCustomerCid () {
    const {
      newCompanySelection,
      newNewtelcoCid,
      newProtection,
      newSupplierSelection
    } = this.state

    const host = window.location.host
    fetch(`https://${host}/api/settings/add/customercids?customercid=${encodeURIComponent(newNewtelcoCid)}&company=${encodeURIComponent(newCompanySelection.value)}&protection=${encodeURIComponent(newProtection)}&supplier=${encodeURIComponent(newSupplierSelection.value)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const insertId = data.insertCustomerCidQuery.insertId
        if (data.insertCustomerCidQuery.affectedRows === 1 && data.insertCustomerCidQuery.warningCount === 0) {
          cogoToast.success(`CID ${newNewtelcoCid} Added`, {
            position: 'top-right'
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
        const newRowData = this.state.rowData
        newRowData.push({
          id: insertId,
          derenCID: newSupplierSelection.label,
          kundenCID: newNewtelcoCid,
          name: newCompanySelection.label,
          protected: newProtection
        })
        this.setState({
          rowData: newRowData,
          openCustomerCidAdd: !this.state.openCustomerCidAdd
        })
      })
      .catch(err => console.error(err))
  }

  handleCellEdit (params) {
    const id = params.data.id
    const newCustomerCid = params.data.kundenCID
    const newProtected = params.data.protected

    const host = window.location.host
    fetch(`https://${host}/api/settings/edit/customercids?id=${id}&customercid=${encodeURIComponent(newCustomerCid)}&protected=${encodeURIComponent(newProtected)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        console.log(data)
        if (data.updateCustomerCidQuery.affectedRows === 1) {
          cogoToast.success(`Customer CID ${newCustomerCid} Updated`, {
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
      newNewtelcoCid,
      newCompanySelection,
      newSupplierSelection,
      newProtection
    } = this.state

    const keyMap = {
      DELETE_MAINT: 'alt+l'
    }

    const handlers = {
      DELETE_MAINT: this.toggleCustomerCidDeleteModal
    }

    return (
      <>
        <HotKeys keyMap={keyMap} handlers={handlers}>
          <CardTitle>
            <span className='section-title'>Customer CIDs</span>
            <Button onClick={this.toggleCustomerCidAdd} outline theme='primary'>
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
          <Modal className='modal-body' animation backdrop backdropClassName='modal-backdrop' open={this.state.openCustomerCidAdd} size='md' toggle={this.toggleCustomerCidAdd}>
            <ModalHeader>
              New Customer CID
            </ModalHeader>
            <ModalBody className='modal-body'>
              <Container className='container-border'>
                <Row>
                  <Col>
                    <FormGroup>
                      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                        Newtelco CID<Badge outline theme='primary'>for Customer</Badge>
                      </label>
                      <FormInput id='updated-by' name='updated-by' type='text' value={newNewtelcoCid} onChange={this.handleNewtelcoCidChange} />
                    </FormGroup>
                    <FormGroup>
                      <label>
                        Customer
                      </label>
                      <Select
                        value={newCompanySelection}
                        onChange={this.handleCompanyChange}
                        options={this.state.companySelections}
                        noOptionsMessage={() => 'No Companies Available'}
                        placeholder='Please Select a Company'
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>
                        Supplier CID
                      </label>
                      <Select
                        value={newSupplierSelection}
                        onChange={this.handleSupplierCidChange}
                        options={this.state.supplierSelections}
                        noOptionsMessage={() => 'No Supplier CIDs Available'}
                        placeholder='Please Select a Supplier CID'
                      />
                    </FormGroup>
                    <FormGroup className='protection-group'>
                      <label>
                        Protection
                      </label>
                      <Toggle
                        icons={{
                          checked: <FontAwesomeIcon icon={faLock} width='0.7em' style={{ left: '10px', top: '-12px', color: '#fff' }} />,
                          unchecked: <FontAwesomeIcon icon={faLockOpen} width='0.9em' style={{ right: '12px', top: '-12px', color: '#fff' }} />
                        }}
                        checked={newProtection}
                        onChange={(event) => this.handleProtectionChange(event)}
                        className='add-protection-toggle'
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Container>
              <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Col>
                  <Button onClick={this.handleAddCustomerCid} style={{ width: '100%', marginTop: '15px' }} theme='primary'>
                    Save
                  </Button>
                </Col>
              </Row>
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
                    Are you sure you want to delete <b style={{ fontWeight: '900' }}> {this.state.customerCidNameToDelete}</b> ({this.state.customerCidIdToDelete})
                  </Col>
                </Row>
              </Container>
              <Row style={{ marginTop: '20px' }}>
                <Col>
                  <ButtonGroup style={{ width: '100%' }}>
                    <Button onClick={this.toggleCustomerCidDeleteModal} outline theme='secondary'>
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
              :global(.add-protection-toggle > .react-toggle-track > div) {
                top: -12px; 
              }
              :global(.protection-group) {
                display: flex;
                justify-content: space-between;
                margin-top: 25px;
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
            `}
          </style>
        </HotKeys>
      </>
    )
  }
}
