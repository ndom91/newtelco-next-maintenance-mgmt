import React from 'react'
import fetch from 'isomorphic-unfetch'
import Link from 'next/link'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import Select from 'react-select'
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
            sort: { direction: 'asc', priority: 0 }
          },
          {
            headerName: 'Their CID',
            field: 'derenCID',
            width: 200
          },
          {
            headerName: 'Protected',
            field: 'protected',
            width: 200,
            cellRenderer: 'protectedIcon'
          }
        ],
        rowBuffer: 0,
        rowSelection: 'multiple',
        rowModelType: 'infinite',
        paginationPageSize: 100,
        cacheOverflowSize: 2,
        maxConcurrentDatasourceRequests: 1,
        infiniteInitialRowCount: 355,
        maxBlocksInCache: 10,
        frameworkComponents: {
          protectedIcon: ProtectedIcon
        }
      },
      newNewtelcoCid: '',
      openCustomerCidAdd: false
    }
    this.toggleCustomerCidAdd = this.toggleCustomerCidAdd.bind(this)
    this.handleNewtelcoCidChange = this.handleNewtelcoCidChange.bind(this)
    this.handleSupplierCidChange = this.handleSupplierCidChange.bind(this)
    this.handleProtectionChange = this.handleProtectionChange.bind(this)
    this.handleCompanyChange = this.handleCompanyChange.bind(this)
    this.handleSaveOnClick = this.handleSaveOnClick.bind(this)
  }

  componentDidMount () {
    const host = window.location.host
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
    this.gridColumnApi = params.columnApi
    params.api.sizeColumnsToFit()

    const host = window.location.host

    const httpRequest = new XMLHttpRequest()
    const updateData = data => {
      const companies = data.customercids
      var dataSource = {
        rowCount: null,
        getRows: function (params) {
          var rowsThisPage = companies.slice(params.startRow, params.endRow)
          var lastRow = -1
          if (companies.length <= params.endRow) {
            lastRow = companies.length
          }
          params.successCallback(rowsThisPage, lastRow)
        }
      }
      params.api.setDatasource(dataSource)
    }

    httpRequest.open(
      'GET',
      `https://${host}/api/customercids`
    )
    httpRequest.send()
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        updateData(JSON.parse(httpRequest.responseText))
      }
    }
  };

  onFirstDataRendered (params) {
    // params.columnApi.autoSizeColumns()
    // params.columnApi.sizeColumnsToFit()
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
    console.log(ev)
    // this.setState({
    //   newDomain: value
    // })
  }

  handleSaveOnClick () {
    fetch(`https://${host}/api/settings/add/customercid`)
  }

  render () {
    const {
      newNewtelcoCid,
      newCompanySelection,
      newSupplierSelection,
      newProtection
    } = this.state

    return (
      <>
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
              animateRows
              stopEditingWhenGridLosesFocus
              onFirstDataRendered={this.onFirstDataRendered.bind(this)}
            />
          </div>
        </div>
        <Modal className='modal-body' animation backdrop open={this.state.openCustomerCidAdd} size='md' toggle={this.toggleCustomerCidAdd}>
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
                    <FormInput id='updated-by' name='updated-by' type='text' value={newNewtelcoCid} onChange={this.handleCustomerCidChange} />
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
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Col>
                  <Button onClick={this.handleSaveOnClick} style={{ width: '100%', marginTop: '15px' }} theme='primary'>
                    Save
                  </Button>
                </Col>
              </Row>

            </Container>
          </ModalBody>
        </Modal>
        <style jsx>{`
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
      </>
    )
  }
}
