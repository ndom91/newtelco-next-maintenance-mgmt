import React from 'react'
import './style/history.css'
import Layout from '../src/components/layout'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import fetch from 'isomorphic-unfetch'
import Select from 'react-select'
import cogoToast from 'cogo-toast'
import Link from 'next/link'
import moment from 'moment-timezone'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../src/components/require-login'
import Footer from '../src/components/footer'
import EditBtn from '../src/components/ag-grid/edit-btn'
import StartDateTime from '../src/components/ag-grid/startdatetime'
import EndDateTime from '../src/components/ag-grid/enddatetime'
import MailArrived from '../src/components/ag-grid/mailarrived'
import UpdatedAt from '../src/components/ag-grid/updatedat'
import Supplier from '../src/components/ag-grid/supplier'
import CompleteIcon from '../src/components/ag-grid/complete'
import EdittedBy from '../src/components/ag-grid/edittedby'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UnreadCount from '../src/components/unreadcount'
import UseAnimations from 'react-useanimations'
import { HotKeys } from 'react-hotkeys'
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
  Row
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
      night: query.night,
      session: await NextAuth.init({ req })
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      openNewModal: false,
      openConfirmDeleteModal: false,
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
            width: 100,
            pinned: 'left',
            sort: { direction: 'asc', priority: 0 }
          }, {
            headerName: 'By',
            field: 'bearbeitetvon',
            cellRenderer: 'edittedby',
            width: 100
            // tooltipField: 'bearbeitetvon'
          }, {
            headerName: 'Supplier',
            field: 'name',
            cellRenderer: 'supplier'
            // width: 120
          }, {
            headerName: 'Their CID',
            field: 'derenCID',
            tooltipField: 'derenCID'
          }, {
            headerName: 'Start',
            field: 'startDateTime',
            width: 160,
            cellRenderer: 'startdateTime'
          }, {
            headerName: 'End',
            field: 'endDateTime',
            width: 160,
            cellRenderer: 'enddateTime'
          }, {
            headerName: 'Newtelco CIDs',
            field: 'betroffeneCIDs',
            // width: 0,
            tooltipField: 'betroffeneCIDs'
          }, {
            headerName: 'Mail Arrived',
            field: 'maileingang',
            cellRenderer: 'mailArrived'
          }, {
            headerName: 'Updated',
            field: 'updatedAt',
            cellRenderer: 'updatedAt'
          }, {
            headerName: 'Complete',
            field: 'done',
            width: 140,
            pinned: 'right',
            cellRenderer: 'complete'
          }
        ],
        context: { componentParent: this },
        frameworkComponents: {
          editBtn: EditBtn,
          startdateTime: StartDateTime,
          enddateTime: EndDateTime,
          mailArrived: MailArrived,
          updatedAt: UpdatedAt,
          supplier: Supplier,
          complete: CompleteIcon,
          edittedby: EdittedBy
        },
        rowSelection: 'multiple',
        paginationPageSize: 10,
        rowClass: 'row-class',
        rowClassRules: {
          'row-completed': function (params) {
            const done = params.data.done
            if (done === 'true' || done === '1') {
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
    this.handleGridReady = this.handleGridReady.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.deleteMaint = this.deleteMaint.bind(this)
  }

  componentDidMount () {
    this.setState({ rowData: this.props.jsonData.maintenances })
  }

  handleGridReady = params => {
    window.gridApi = params.api
    this.gridColumnApi = params.columnApi
    // params.columnApi.sizeColumnsToFit()
  }

  onFirstDataRendered (params) {
    params.columnApi.autoSizeColumns()
    // params.columnApi.sizeColumnsToFit()
  }

  handleGridExport () {
    // console.log(data)
    if (window.gridApi) {
      const params = {
        allColumns: true,
        fileName: `maintenanceExport_${moment(new Date()).format('YYYYMMDD')}`,
        columnSeparator: ','
      }
      window.gridApi.exportDataAsCsv(params)
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

  handleDelete () {
    const host = window.location.host
    const maintId = this.state.maintIdtoDelete
    fetch(`https://${host}/api/maintenances/delete?maintId=${maintId}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
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

    const newRowData = this.state.rowData.filter(el => el.id !== maintId)
    this.setState({
      rowData: newRowData,
      openConfirmDeleteModal: !this.state.openConfirmDeleteModal
    })
  }

  deleteMaint () {
    if (window.gridApi) {
      const row = window.gridApi.getSelectedRows()
      const maintId = row[0].id
      this.setState({
        openConfirmDeleteModal: !this.state.openConfirmDeleteModal,
        maintIdtoDelete: maintId
      })
    }
  }

  handleSearchSelection = selection => {
    const newLocation = `/maintenance?id=${selection.id}`
    Router.push(newLocation)
    // Router.pushRoute(`/maintenance?id=${selection.id}`)
    // this.setState({ selection })
  }

  render () {
    const keyMap = {
      DELETE_MAINT: 'alt+l'
    }

    const handlers = {
      DELETE_MAINT: this.deleteMaint
    }
    if (this.props.session.user) {
      return (
        <HotKeys keyMap={keyMap} handlers={handlers}>
          <Layout night={this.props.night} handleSearchSelection={this.handleSearchSelection} unread={this.props.unread} session={this.props.session}>
            {UnreadCount()}
            <Card style={{ maxWidth: '100%' }}>
              <CardHeader>
                <ButtonToolbar style={{ justifyContent: 'space-between' }}>
                  <h2 style={{ marginBottom: '0px' }}>History</h2>
                  <ButtonGroup size='md'>
                    <Button outline theme='dark' className='export-btn' onClick={this.handleGridExport}>
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
                      // onGridReady={params => this.gridApi = params.api}
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
            <Modal className='mail-modal-body' animation backdrop backdropClassName='modal-backdrop' open={this.state.openNewModal} size='md' toggle={this.toggleNewModal}>
              <ModalHeader className='modal-delete-header'>
                New Maintenance
              </ModalHeader>
              <ModalBody className='mail-body'>
                <Container className='container-interior'>
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
                </Container>
                <Row style={{ marginTop: '30px' }}>
                  <Col>
                    <Link
                      href={{
                        pathname: '/maintenance',
                        query: {
                          id: 'NEW',
                          mailId: 'NT',
                          name: this.state.newCompMailDomain
                        }
                      }}
                      as='/maintenance/new'
                    >
                      <Button style={{ width: '100%' }} outline theme='primary'>
                        Go
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </ModalBody>
            </Modal>
            <Modal className='delete-modal' animation backdrop backdropClassName='modal-backdrop' open={this.state.openConfirmDeleteModal} size='md' toggle={this.toggleConfirmDeleteModal}>
              <ModalHeader className='modal-delete-header'>
                Confirm Delete
              </ModalHeader>
              <ModalBody className='mail-body'>
                <Container className='container-interior'>
                  <Row>
                    <Col>
                      Are you sure you want to delete maintenance <b style={{ fontWeight: '900' }}> {this.state.maintIdtoDelete}</b>
                    </Col>
                  </Row>
                </Container>
                <Row style={{ marginTop: '20px' }}>
                  <Col>
                    <ButtonGroup style={{ width: '100%' }}>
                      <Button onClick={this.toggleConfirmDeleteModal} outline theme='secondary'>
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
                :global(.export-btn:hover) {
                  background: var(--white);
                  color: var(--dark);
                  box-shadow: 0 0 5px 1px var(--secondary);
                }
                :global(.delete-modal) {
                  margin-top: 50px;
                }
                :global(.modal-title > h2) {
                  margin-bottom: 0px;
                }
                :global(.modal-delete-header) {
                  background: var(--light);
                }
                :global(.container-interior) {
                  border: 1px solid var(--light);
                  border-radius: 0.325em;
                  padding: 30px;
                }
                :global(.ag-theme-material) {
                  background-color: ${this.props.night === 'true' ? '#272727' : '#fff'} !important;
                }
                :global(.ag-root-wrapper-body.ag-layout-normal) {
                  background-color: ${this.props.night === 'true' ? '#272727' : '#fff'} !important;
                  color: ${this.props.night === 'true' ? '#fff' : ''};
                }
                :global(.ag-theme-material .ag-paging-panel) {
                  color: ${this.props.night === 'true' ? '#fff' : ''};
                }
                :global(.ag-theme-material .ag-row-hover) {
                  background-color: ${this.props.night === 'true' ? '#121212' : ''};
                }
                :global(.ag-theme-material .ag-header) {
                  background-color: ${this.props.night === 'true' ? '#272727' : '#fff'} !important;
                  color: ${this.props.night === 'true' ? '#fff' : ''};
                }
                :global(.btn-dark) {
                  color: ${this.props.night === 'true' ? '#fff' : ''};
                  border-color: ${this.props.night === 'true' ? '#fff' : ''};
                }
                :global(.btn-outline-dark) {
                  color: ${this.props.night === 'true' ? '#fff' : ''};
                  border-color: ${this.props.night === 'true' ? '#fff' : ''};
                }
                :global(.row-emergency) {
                  background: ${this.props.night === 'true' ? 'repeating-linear-gradient( 45deg, #272727, #272727 10px, #c3565f2d 10px, #c3565f2d 20px) !important' : ''};
                }
            `}
            </style>
          </Layout>
        </HotKeys>
      )
    } else {
      return (
        <RequireLogin />
      )
    }
  }
}
