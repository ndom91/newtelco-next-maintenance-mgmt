import React from 'react'
import fetch from 'isomorphic-unfetch'
import cogoToast from 'cogo-toast'
import { AgGridReact } from 'ag-grid-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Select from 'react-select'
import { HotKeys } from 'react-hotkeys'
import {
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
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

export default class SupplierCIDs extends React.Component {
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://${host}/api/settings/lieferantcids`
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
            editable: false
          },
          {
            headerName: 'Company',
            field: 'name',
            width: 200
          },
          {
            headerName: 'Supplier CID',
            field: 'derenCID',
            width: 200
          }
        ],
        rowSelection: 'single'
      },
      openSupplierCidAdd: false,
      openConfirmDeleteModal: false
    }
    this.handleCompanyChange = this.handleCompanyChange.bind(this)
    this.handleSupplierCidChange = this.handleSupplierCidChange.bind(this)
    this.handleSaveOnClick = this.handleSaveOnClick.bind(this)
    this.toggleSupplierCidAdd = this.toggleSupplierCidAdd.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleAddSupplierCid = this.handleAddSupplierCid.bind(this)
    this.toggleSupplierCidDeleteModal = this.toggleSupplierCidDeleteModal.bind(this)
  }

  componentDidMount () {
    const host = window.location.host
    fetch(`https://${host}/api/lieferantcids/settings`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          rowData: data.lieferantCIDsResult
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
  }

  handleGridReady = params => {
    this.gridApi = params.api
    window.gridApi = params.api
    this.gridColumnApi = params.columnApi
    params.api.sizeColumnsToFit()
  }

  toggleSupplierCidAdd () {
    this.setState({
      openSupplierCidAdd: !this.state.openSupplierCidAdd
    })
  }

  onFirstDataRendered (params) {
    // params.columnApi.autoSizeColumns()
    // params.columnApi.sizeColumnsToFit()
  }

  handleCompanyChange (selectedOption) {
    this.setState({
      newCompanySelection: {
        value: selectedOption.value,
        label: selectedOption.label
      }
    })
  }

  handleSupplierCidChange (ev) {
    this.setState({
      newSupplierCid: ev.target.value
    })
  }

  handleSaveOnClick () {

  }

  handleDelete () {
    const host = window.location.host
    const supplierCidId = this.state.supplierCidIdToDelete
    fetch(`https://${host}/api/settings/delete/suppliercids?id=${supplierCidId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.deleteSupplierCidQuery.affectedRows === 1) {
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

    const newRowData = this.state.rowData.filter(el => el.id !== supplierCidId)
    this.setState({
      rowData: newRowData,
      openConfirmDeleteModal: !this.state.openConfirmDeleteModal
    })
  }

  toggleSupplierCidDeleteModal () {
    if (window.gridApi) {
      const row = window.gridApi.getSelectedRows()
      const supplierCidId = row[0].id
      const supplierCid = row[0].derenCID
      this.setState({
        openConfirmDeleteModal: !this.state.openConfirmDeleteModal,
        supplierCidIdToDelete: supplierCidId,
        supplierCidNameToDelete: supplierCid
      })
    }
  }

  handleAddSupplierCid () {
    const {
      newCompanySelection,
      newSupplierCid
    } = this.state

    const host = window.location.host
    fetch(`https://${host}/api/settings/add/suppliercids?cid=${encodeURIComponent(newSupplierCid)}&company=${encodeURIComponent(newCompanySelection.value)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const insertId = data.insertSupplierCidQuery.insertId
        if (data.insertSupplierCidQuery.affectedRows === 1 && data.insertSupplierCidQuery.warningCount === 0) {
          cogoToast.success(`Supplier CID ${newSupplierCid} Added`, {
            position: 'top-right'
          })
        } else {
          cogoToast.warn(`Error - ${data.err}`, {
            position: 'top-right'
          })
        }
        const newRowData = this.state.rowData
        newRowData.push({ id: insertId, derenCID: newSupplierCid, name: newCompanySelection.label })
        this.setState({
          rowData: newRowData,
          openSupplierCidAdd: !this.state.openSupplierCidAdd
        })
      })
      .catch(err => console.error(err))
  }

  render () {
    const {
      newCompanySelection,
      newSupplierCid
    } = this.state

    const keyMap = {
      DELETE_MAINT: 'alt+l'
    }

    const handlers = {
      DELETE_MAINT: this.toggleSupplierCidDeleteModal
    }

    return (
      <>
        <HotKeys keyMap={keyMap} handlers={handlers}>
          <CardTitle>
            <span className='section-title'>Newtelco CIDs</span>
            <Button onClick={this.toggleSupplierCidAdd} outline theme='primary'>
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
                animateRows
                rowData={this.state.rowData}
                stopEditingWhenGridLosesFocus
                onFirstDataRendered={this.onFirstDataRendered.bind(this)}
              />
            </div>
          </div>
          <Modal className='modal-body' animation backdrop backdropClassName='modal-backdrop' open={this.state.openSupplierCidAdd} size='md' toggle={this.toggleSupplierCidAdd}>
            <ModalHeader>
              New Supplier CID
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
                      <FormInput id='updated-by' name='updated-by' type='text' value={newSupplierCid} onChange={this.handleSupplierCidChange} />
                    </FormGroup>
                  </Col>
                </Row>
                <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Col>
                    <Button onClick={this.handleAddSupplierCid} style={{ width: '100%', marginTop: '15px' }} theme='primary'>
                      Save
                    </Button>
                  </Col>
                </Row>

              </Container>
            </ModalBody>
          </Modal>
          <Modal className='delete-modal' animation backdrop backdropClassName='modal-backdrop' open={this.state.openConfirmDeleteModal} size='md' toggle={this.toggleSupplierCidDeleteModal}>
            <ModalHeader className='modal-delete-header'>
              Confirm Delete
            </ModalHeader>
            <ModalBody className='mail-body'>
              <Container className='container-border'>
                <Row>
                  <Col>
                    Are you sure you want to delete <b style={{ fontWeight: '900' }}> {this.state.supplierCidNameToDelete}</b> ({this.state.supplierCidIdToDelete})
                  </Col>
                </Row>
              </Container>
              <Row style={{ marginTop: '20px' }}>
                <Col>
                  <ButtonGroup style={{ width: '100%' }}>
                    <Button onClick={this.toggleSupplierCidDeleteModal} outline theme='secondary'>
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
