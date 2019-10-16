import React from 'react'
import fetch from 'isomorphic-unfetch'
import { AgGridReact } from 'ag-grid-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Select from 'react-select'
import {
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
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
        rowBuffer: 0,
        rowSelection: 'multiple',
        rowModelType: 'infinite',
        paginationPageSize: 100,
        cacheOverflowSize: 2,
        maxConcurrentDatasourceRequests: 1,
        infiniteInitialRowCount: 154,
        maxBlocksInCache: 10
      },
      openSupplierCidAdd: false
    }
    this.handleCompanyChange = this.handleCompanyChange.bind(this)
    this.handleSupplierCidChange = this.handleSupplierCidChange.bind(this)
    this.handleSaveOnClick = this.handleSaveOnClick.bind(this)
    this.toggleSupplierCidAdd = this.toggleSupplierCidAdd.bind(this)
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
  }

  handleGridReady = params => {
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
    params.api.sizeColumnsToFit()

    const host = window.location.host

    const httpRequest = new XMLHttpRequest()
    const updateData = data => {
      const companies = data.lieferantCIDsResult
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
      `https://${host}/api/lieferantcids/settings`
    )
    httpRequest.send()
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        updateData(JSON.parse(httpRequest.responseText))
      }
    }
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

  render () {
    const {
      newCompanySelection,
      newSupplierCid
    } = this.state

    return (
      <>
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
                  <Button onClick={this.handleSaveOnClick} style={{ width: '100%', marginTop: '15px' }} theme='primary'>
                    Save
                  </Button>
                </Col>
              </Row>

            </Container>
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
      </>
    )
  }
}
