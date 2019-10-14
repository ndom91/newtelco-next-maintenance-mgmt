import React from 'react'
import fetch from 'isomorphic-unfetch'
import Link from 'next/link'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import Select from 'react-select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlusCircle
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
            width: 200
          }
        ],
        rowBuffer: 0,
        rowSelection: 'multiple',
        rowModelType: 'infinite',
        paginationPageSize: 100,
        cacheOverflowSize: 2,
        maxConcurrentDatasourceRequests: 1,
        infiniteInitialRowCount: 355,
        maxBlocksInCache: 10
      }
    }
    this.toggleCompanyAdd = this.toggleCompanyAdd.bind(this)
    this.handleCustomerCidChange = this.handleCustomerCidChange.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleRecipientChange = this.handleRecipientChange.bind(this)
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

  toggleCompanyAdd () {
    this.setState({
      openCompanyModal: !this.state.openCompanyModal
    })
  }

  handleCustomerCidChange (ev) {
    console.log(ev)
    // this.setState({
    //   newDomain: value
    // })
  }

  handleSaveOnClick () {
    fetch(`https://${host}/api/settings/add/customercid`)
  }

  render () {
    return (
      <>
        <CardTitle>
          <span className='section-title'>Customer CIDs</span>
          <Button outline theme='primary'>
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
        <Modal className='modal-body' animation backdrop open={this.state.openCompanyModal} size='md' toggle={this.toggleCompanyAdd}>
          <ModalHeader>
            New Customer CID
          </ModalHeader>
          <ModalBody className='modal-body'>
            <Container className='container-border'>
              <Row>
                <Col>
                  <FormGroup>
                    <label>
                      Customer
                    </label>
                    {/* SELECT FOR COMPANY NAMES */}
                    <FormInput id='updated-by' name='updated-by' />
                  </FormGroup>
                  <FormGroup>
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      Newtelco CID<Badge outline theme='primary'>for Customer</Badge>
                    </label>
                    <FormInput id='updated-by' name='updated-by' type='text' value={newDomain} onChange={this.handleCustomerCidChange} />
                  </FormGroup>
                  <FormGroup>
                    <label>
                      Supplier CID
                    </label>
                    {/* SELECT FOR SUPPLIER CIDs */}
                    <FormInput id='updated-by' name='updated-by' type='text'/>
                  </FormGroup>
                  <FormGroup>
                    <label>
                      Protection 
                    </label>
                    {/* TOGGLE FOR PROTECTION */}
                    <FormInput id='updated-by' name='updated-by' type='text' />
                  </FormGroup>
                </Col>
              </Row>
              <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Col>
                  <Button onClick={this.handleSaveOnClick} style={{ width: '100%', marginTop: '15px' }} theme='primary'>
                    Add
                  </Button>
                </Col>
              </Row>

            </Container>
          </ModalBody>
        </Modal>
        <style jsx>{`
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
      </>
    )
  }
}
