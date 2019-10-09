import React from 'react'
import './style/history.css'
import Layout from '../src/components/layout'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import fetch from 'isomorphic-unfetch'
import Select from 'react-select'
import Link from 'next/link'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../src/components/require-login'
import Footer from '../src/components/footer'
import EditBtn from '../src/components/ag-grid/edit-btn'
import StartDateTime from '../src/components/ag-grid/startdatetime'
import EndDateTime from '../src/components/ag-grid/enddatetime'
import MailArrived from '../src/components/ag-grid/mailarrived'
import UpdatedAt from '../src/components/ag-grid/updatedat'
import Supplier from '../src/components/ag-grid/supplier'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UseAnimations from 'react-useanimations'
import {
  Card,
  CardHeader,
  CardBody,
  ButtonToolbar,
  ButtonGroup,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Container,
  FormGroup,
  Col,
  Row,
  FormInput
} from 'shards-react'
import {
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons'

// { maintenances, page, pageCount }
export default class History extends React.Component {
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://${host}/api/maintenances`
    const res = await fetch(pageRequest)
    const json = await res.json()
    const pageRequest2 = `https://api.${host}/inbox/count`
    const res2 = await fetch(pageRequest2)
    const count = await res2.json()
    let display
    if (count === 'No unread emails') {
      display = 0
    } else {
      display = count.count
    }
    return {
      jsonData: json,
      unread: display,
      session: await NextAuth.init({ req })
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      openNewModal: false,
      newMaintenanceCompany: '',
      newCompMailDomain: '',
      newMaintCompanies: [],
      gridOptions: {
        defaultColDef: {
          resizable: true,
          sortable: true,
          filter: true,
          selectable: true
        },
        columnDefs: [
          {
            headerName: '',
            width: 80,
            sortable: false,
            filter: false,
            resizable: false,
            cellRenderer: 'editBtn',
            pinned: 'left'
          },
          {
            headerName: 'ID',
            field: 'id',
            width: 80,
            pinned: 'left',
            sort: { direction: 'asc', priority: 0 }
          }, {
            headerName: 'Edited By',
            field: 'bearbeitetvon',
            width: 100
          }, {
            headerName: 'Supplier',
            field: 'name',
            cellRenderer: 'supplier',
            width: 120
          }, {
            headerName: 'Their CID',
            field: 'derenCID',
            tooltipField: 'derenCID'
          }, {
            headerName: 'Start',
            field: 'startDateTime',
            cellRenderer: 'startdateTime',
            tooltipField: 'startDateTime'
          }, {
            headerName: 'End',
            field: 'endDateTime',
            cellRenderer: 'enddateTime',
            tooltipField: 'endDateTime'
          }, {
            headerName: 'Newtelco CIDs',
            field: 'betroffeneCIDs',
            width: 0,
            tooltipField: 'betroffeneCIDs'
          }, {
            headerName: 'Mail Arrived',
            field: 'maileingang',
            cellRenderer: 'mailArrived',
            tooltipField: 'maileingang'
          }, {
            headerName: 'Updated',
            field: 'updatedAt',
            cellRenderer: 'updatedAt'
          }
        ],
        context: { componentParent: this },
        frameworkComponents: {
          editBtn: EditBtn,
          startdateTime: StartDateTime,
          enddateTime: EndDateTime,
          mailArrived: MailArrived,
          updatedAt: UpdatedAt,
          supplier: Supplier
        },
        rowSelection: 'multiple',
        paginationPageSize: 10,
        rowClass: 'row-class',
        rowClassRules: {
          'row-completed': function (params) {
            const completed = params.data.completed
            if (completed === 'true' || completed === '1') {
              return true
            }
            return false
          },
          'row-cancelled': function (params) {
            const cancelled = params.data.cancelled
            if (cancelled === 'true' || cancelled === '1') {
              return true
            }
            return false
          },
          'row-emergency': function (params) {
            const emergency = params.data.emergency
            if (emergency === 'true' || emergency === '1') {
              return true
            }
            return false
          }
        }
      }
    }
    this.toggleNewModal = this.toggleNewModal.bind(this)
    this.handleNewCompanySelect = this.handleNewCompanySelect.bind(this)
  }

  componentDidMount () {
    this.setState({ rowData: this.props.jsonData.maintenances })
  }

  handleGridReady = params => {
    this.gridApi = params.gridApi
    this.gridColumnApi = params.gridColumnApi
    // params.columnApi.sizeColumnsToFit()
  }

  onFirstDataRendered (params) {
    // params.columnApi.autoSizeColumns()
    // params.columnApi.sizeColumnsToFit()
  }

  handleGridExport (data) {
    console.log(data)
    const params = {
      allColumns: true,
      fileName: `maintenance${new Date()}`,
      columnSeparator: ',',
      onlySelected: true
    }

    // this.state.gridOptions.api.exportDataAsCsv(params)
  }

  handleRowDoubleClick (event) {
    // this.gridApi.getDisplayedRowAtIndex(event.rowIndex).setSelected(true)
  }

  toggleNewModal () {
    this.setState({
      openNewModal: !this.state.openNewModal
    })
    const host = window.location.host
    fetch(`https://${host}/api/companies/select`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          newMaintCompanies: data.companiesDomains
        })
      })
  }

  handleNewCompanySelect (selectedOption) {
    this.setState({
      newCompMailDomain: selectedOption.value
    })
  }

  render () {
    if (this.props.session.user) {
      return (
        <Layout unread={this.props.unread} session={this.props.session}>
          <Card style={{ maxWidth: '100%' }}>
            <CardHeader>
              <ButtonToolbar style={{ justifyContent: 'space-between' }}>
                <h2 style={{ marginBottom: '0px' }}>History</h2>
                <ButtonGroup size='md'>
                  <Button disabled outline theme='dark' className='export-btn' onClick={this.handleGridExport}>
                    <UseAnimations animationKey='download' size={22} style={{ display: 'inline-block', fill: 'rgb(0,0,0)' }} />
                    <span style={{ marginLeft: '5px' }}>
                      Export
                    </span>
                  </Button>
                  <Button onClick={this.toggleNewModal} theme='dark'>
                    <FontAwesomeIcon icon={faPlusCircle} width='1.5em' style={{ marginRight: '10px', color: 'secondary' }} />
                    New
                  </Button>
                </ButtonGroup>
              </ButtonToolbar>
            </CardHeader>
            <CardBody>
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
                    rowData={this.state.rowData}
                    onGridReady={this.handleGridReady}
                    animateRows
                    pagination
                    // onRowDoubleClicked={this.handleRowDoubleClick}
                    onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                  />
                </div>
              </div>
            </CardBody>
            <Footer />
          </Card>
          <style jsx>{`
            :global(.export-btn) {
              display: flex;
              align-items: center;
            }
          `}
          </style>
          <Modal className='mail-modal-body' animation backdrop backdropClassName='modal-backdrop' open={this.state.openNewModal} size='lg' toggle={this.toggleNewModal}>
            <ModalHeader />
            <ModalBody className='mail-body'>
              <Container>
                <Row>
                  <h2>New Maintenance</h2>
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <label htmlFor='selectCompany'>
                        Company
                      </label>
                      <Select
                        value={this.state.newMaintenanceCompany || undefined}
                        onChange={this.handleNewCompanySelect}
                        options={this.state.newMaintCompanies}
                        placeholder='Please select a Company'
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Link
                    href={{
                      pathname: '/maintenance',
                      query: {
                        id: 'NEW',
                        mailId: null,
                        name: this.state.newCompMailDomain
                      }
                    }}
                    as='/maintenance/new'
                  >
                    <Button outline theme='primary'>
                      Go
                    </Button>
                  </Link>
                </Row>

              </Container>
            </ModalBody>
          </Modal>
        </Layout>
      )
    } else {
      return (
        <RequireLogin />
      )
    }
  }
}
