import React from 'react'
import './style/history.css'
import Layout from '../components/layout'
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
import RequireLogin from '../components/require-login'
import Footer from '../components/footer'
import EditBtn from '../components/ag-grid/edit-btn'
import StartDateTime from '../components/ag-grid/startdatetime'
import EndDateTime from '../components/ag-grid/enddatetime'
import MailArrived from '../components/ag-grid/mailarrived'
import UpdatedAt from '../components/ag-grid/updatedat'
import Supplier from '../components/ag-grid/supplier'
import CompleteIcon from '../components/ag-grid/complete'
import { CSSTransition } from 'react-transition-group'
import EdittedBy from '../components/ag-grid/edittedby'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UnreadCount from '../components/unreadcount'
import InfiniteHistory from '../components/infinitehistory'
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
  faPlusCircle,
  faTable
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
    let tableViewBool
    if (typeof window !== 'undefined') {
      tableViewBool = window.localStorage.getItem('tableView')
      if (tableViewBool === null) {
        tableViewBool = true
      }
    }
    const pinned = dir => {
      if (typeof window !== 'undefined' && window.outerWidth < '500') {
        return 'none'
      } else {
        if (dir === 'left') {
          return 'left'
        } else {
          return 'right'
        }
      }
    }
    this.state = {
      openNewModal: false,
      openConfirmDeleteModal: false,
      newMaintenanceCompany: '',
      newCompMailDomain: '',
      openTableView: tableViewBool,
      newMaintCompanies: [],
      rowData: [],
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
            pinned: pinned('left')
          }, {
            headerName: 'ID',
            field: 'id',
            width: 100,
            pinned: pinned('left'),
            sort: { direction: 'asc', priority: 0 }
          }, {
            headerName: 'By',
            field: 'bearbeitetvon',
            cellRenderer: 'edittedby',
            width: 100
          }, {
            headerName: 'Supplier',
            field: 'name',
            cellRenderer: 'supplier'
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
            headerName: 'Rescheduled',
            field: 'rescheduled',
            width: 150,
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }, {
            headerName: 'Complete',
            field: 'done',
            width: 100,
            pinned: pinned('right'),
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
    this.handleToggleNewModal = this.handleToggleNewModal.bind(this)
    this.handleNewCompanySelect = this.handleNewCompanySelect.bind(this)
    this.handleGridReady = this.handleGridReady.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.deleteMaint = this.deleteMaint.bind(this)
  }

  componentDidMount () {
    if (this.state.openTableView && window.gridApi) {
      window.gridApi.refreshCells()
      window.gridApi.redrawRows()
    }
    this.setState({
      rowData: this.props.jsonData.maintenances
    })
  }

  handleGridReady = params => {
    window.gridApi = params.api
    this.gridColumnApi = params.columnApi
  }

  onFirstDataRendered (params) {
    params.columnApi.autoSizeColumns()
    params.api.redrawRows()
  }

  handleGridExport () {
    if (window.gridApi) {
      const params = {
        allColumns: true,
        fileName: `maintenanceExport_${moment(new Date()).format('YYYYMMDD')}`,
        columnSeparator: ','
      }
      window.gridApi.exportDataAsCsv(params)
    }
  }

  handleToggleNewModal () {
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

  handleToggleView = () => {
    if (this.state.openTableView === true || this.state.openTableView === false) {
      let tableViewBool
      if (typeof this.state.openTableView === 'string') {
        tableViewBool = this.state.openTableView === 'true'
      } else {
        tableViewBool = this.state.openTableView
      }
      window.localStorage.setItem('tableView', !tableViewBool)
    }
    this.setState({
      openTableView: !this.state.openTableView
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

  onSearchSelection = selection => {
    const newLocation = `/maintenance?id=${selection.id}`
    Router.push(newLocation)
  }

  render () {
    const keyMap = {
      DELETE_MAINT: 'alt+l'
    }

    const handlers = {
      DELETE_MAINT: this.deleteMaint
    }

    const {
      openTableView,
      openNewModal,
      openConfirmDeleteModal,
      maintIdtoDelete,
      gridOptions,
      rowData,
      newMaintCompanies,
      newMaintenanceCompany,
      newCompMailDomain
    } = this.state

    if (this.props.session.user) {
      return (
        <HotKeys keyMap={keyMap} handlers={handlers}>
          <Layout night={this.props.night} handleSearchSelection={this.onSearchSelection} unread={this.props.unread} session={this.props.session}>
            {UnreadCount()}
            <Card className='top-card-wrapper' style={{ maxWidth: '100%' }}>
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
                    <Button onClick={this.handleToggleView} theme='dark'>
                      <FontAwesomeIcon icon={faTable} width='1.5em' style={{ marginRight: '10px', color: 'secondary' }} />
                      View
                    </Button>
                    <Button onClick={this.handleToggleNewModal} theme='dark'>
                      <FontAwesomeIcon icon={faPlusCircle} width='1.5em' style={{ marginRight: '10px', color: 'secondary' }} />
                      New
                    </Button>
                  </ButtonGroup>
                </ButtonToolbar>
              </CardHeader>
              {openTableView
                ? (
                  <CSSTransition
                    timeout={500}
                    classNames='flip-transition'
                    in={this.state.openTableView}
                  >
                    <CardBody>
                      <div className='table-wrapper'>
                        <div
                          className={`ag-theme-material ${this.props.night === 'true' ? 'darkmode-aggrid' : ''}`}
                          style={{
                            height: '700px',
                            width: '100%'
                          }}
                        >
                          <AgGridReact
                            gridOptions={gridOptions}
                            rowData={rowData}
                            onGridReady={this.handleGridReady}
                            animateRows
                            pagination
                            onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                          />
                        </div>
                      </div>
                    </CardBody>
                  </CSSTransition>
                ) : (
                  <CSSTransition
                    timeout={500}
                    classNames='flip-transition'
                    in={this.state.openTableView}
                  >
                    <CardBody>
                      <InfiniteHistory length={this.state.rowData.length} />
                    </CardBody>
                  </CSSTransition>
                )}
              <Footer />
            </Card>
            <Modal className='mail-modal-body' animation backdrop backdropClassName='modal-backdrop' open={openNewModal} size='md' toggle={this.handleToggleNewModal}>
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
                          value={newMaintenanceCompany || undefined}
                          onChange={this.handleNewCompanySelect}
                          options={newMaintCompanies}
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
                          name: newCompMailDomain
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
            <Modal className='delete-modal' animation backdrop backdropClassName='modal-backdrop' open={openConfirmDeleteModal} size='md' toggle={this.deleteMaint}>
              <ModalHeader className='modal-delete-header'>
                Confirm Delete
              </ModalHeader>
              <ModalBody className='mail-body'>
                <Container className='container-interior'>
                  <Row>
                    <Col>
                      Are you sure you want to delete maintenance <b style={{ fontWeight: '900' }}> {maintIdtoDelete}</b>
                    </Col>
                  </Row>
                </Container>
                <Row style={{ marginTop: '20px' }}>
                  <Col>
                    <ButtonGroup style={{ width: '100%' }}>
                      <Button onClick={this.deleteMaint} outline theme='secondary'>
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
                :global(.export-btn) {
                  display: flex;
                  align-items: center;
                }
                :global(.export-btn:hover) {
                  background: var(--white);
                  color: var(--dark);
                  box-shadow: 0 0 5px 1px var(--secondary);
                  border-color: #fff;
                }
                :global(.delete-modal) {
                  margin-top: 50px;
                }
                :global(.card-header > .btn-toolbar > h2) {
                  color: var(--font-color);
                  font-weight: 100 !important;
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
                :global(.export-btn:hover path){
                  stroke: ${this.props.night === 'true' ? 'var(--inv-font-color)' : '#000'};
                }
                :global(.export-btn path){
                  stroke: var(--font-color);
                }
                :global(.btn-dark) {
                  color: ${this.props.night === 'true' ? '#fff' : ''};
                  border-color: ${this.props.night === 'true' ? '#fff' : ''};
                }
                :global(.btn-outline-dark) {
                  color: ${this.props.night === 'true' ? '#fff' : ''};
                  border-color: ${this.props.night === 'true' ? '#fff' : ''};
                }
                :global(.btn-dark:hover) {
                  box-shadow: ${this.props.night === 'true' ? '0 0 5px 1px var(--secondary)' : ''};
                  border: ${this.props.night === 'true' ? '1px solid #fff' : '1px solid #16181b'};
                }
                :global(.ag-horizontal-right-spacer::-webkit-scrollbar) {
                  width: 0px;
                  height: 0px;
                  background: transparent;
                }
                :global(.ag-horizontal-left-spacer::-webkit-scrollbar) {
                  width: 0px;
                  height: 0px;
                  background: transparent;
                }
                :global(::-webkit-scrollbar) {
                  height: 8px;
                  background: rgba(0,0,0,0.2);
                }
                :global(.flip-transition-enter) {
                  opacity: 0;
                }
                :global(.flip-transition-enter-active) {
                  opacity: 1;
                  transform: translateX(0);
                  transition: opacity 0.9s, transform 0.9s;
                }
                :global(.flip-transition-exit) {
                  opacity: 0;
                }
                :global(.flip-transition-exit-active) {
                  opacity: 1;
                  transform: translateX(0);
                  transition: opacity 0.9s, transform 0.9s;
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
