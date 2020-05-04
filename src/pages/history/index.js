import React, { useRef, useState, useEffect } from 'react'
import '../style/history.css'
import Layout from '../../components/layout'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import fetch from 'isomorphic-unfetch'
import Select from 'react-select'
import Link from 'next/link'
import moment from 'moment-timezone'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../../components/require-login'
import Footer from '../../components/cardFooter'
import EditBtn from '../../components/ag-grid/edit-btn'
import StartDateTime from '../../components/ag-grid/startdatetime'
import EndDateTime from '../../components/ag-grid/enddatetime'
import MailArrived from '../../components/ag-grid/mailarrived'
import UpdatedAt from '../../components/ag-grid/updatedat'
import Supplier from '../../components/ag-grid/supplier'
import CompleteIcon from '../../components/ag-grid/complete'
import { CSSTransition } from 'react-transition-group'
import EdittedBy from '../../components/ag-grid/edittedby'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UnreadCount from '../../components/unreadcount'
import MaintPanel from '../../components/panel'
import Notify from '../../lib/notification'
import {
  Card,
  CardHeader,
  CardBody,
  ButtonToolbar,
  // Modal,
  // ModalHeader,
  // ModalBody,
  Container,
  FormGroup,
  Col,
  Row
} from 'shards-react'
import {
  faPlusCircle,
  faTable,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons'
import {
  Icon,
  Button,
  IconButton,
  ButtonGroup,
  Modal
} from 'rsuite'

const History = props => {
  const gridOptions = {
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
          }, {
            headerName: 'ID',
            field: 'id',
            width: 100,
            pinned: 'left',
            sort: { direction: 'asc', priority: 0 }
          }, {
            headerName: 'By',
            field: 'bearbeitetvon',
            cellRenderer: 'edittedby',
            width: 100,
            cellStyle: (params) => {
              return { display: 'flex', alignItems: 'center', justifyContent: 'center' };
            }
          }, {
            headerName: 'Supplier',
            field: 'name',
            cellRenderer: 'supplier',
            cellStyle: (params) => {
              return { display: 'flex', alignItems: 'center', justifyContent: 'center' };
            }
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
          'row-completed': (params) => {
            const done = params.data.done
            if (done === 'true' || done === '1') {
              return true
            }
            return false
          },
          'row-cancelled': (params) => {
            const cancelled = params.data.cancelled
            if (cancelled === 'true' || cancelled === '1') {
              return true
            }
            return false
          },
          'row-emergency': (params) => {
            const emergency = params.data.emergency
            if (emergency === 'true' || emergency === '1') {
              return true
            }
            return false
          }
        }
      }

    const gridApi = useRef();

    const [openNewModal, setOpenNewModal] = useState(false)
    const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false)
    const [rowData, setRowData] = useState(props.jsonData.maintenances)
    const [newMaintenanceInfo, setNewMaintenanceInfo] = useState({})
    const [idToDelete, setIdToDelete] = useState('')

  const handleGridReady = params => {
    gridApi.current = params.api;  // <== this is how you save it
  }

  const onFirstDataRendered = (params) => {
    params.columnApi.autoSizeColumns()
    params.api.redrawRows()
  }

  const handleGridExport = () => {
    if (window.gridApi) {
      const params = {
        allColumns: true,
        fileName: `maintenanceExport_${moment(new Date()).format('YYYYMMDD')}`,
        columnSeparator: ','
      }
      window.gridApi.exportDataAsCsv(params)
    }
  }

  const handleToggleNewModal = () => {
    setOpenNewModal(!openNewModal)
    fetch(`/api/companies/select`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        setNewMaintenanceInfo({...newMaintenanceInfo, companies: data.companiesDomains})
      })
  }

  const handleNewCompanySelect = (selectedOption) => {
    setNewMaintenanceInfo({...newMaintenanceInfo, domain: selectedOption.value})
  }

  const handleDelete = () => {
    fetch(`/api/maintenances/delete?maintId=${idToDelete}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 200 && data.statusText === 'OK') {
          Notify('info', 'Maintenance Deleted')
        } else {
          Notify('error', 'Error Deleting Maintenance', data.err)
        }
      })
      .catch(err => console.error(err))

    const newRowData = rowData.filter(el => el.id !== maintId)
    setOpenConfirmDeleteModal(!openConfirmDeleteModal)
    setRowData(newRowData)
  }

  const deleteMaint = () => {
    if (gridApi) {
      const row = gridApi.current.getSelectedRows()
      if (row[0]) {
        const maintId = row[0].id
        setOpenConfirmDeleteModal(!openConfirmDeleteModal)
        setIdToDelete(maintId)
      } else {
        Notify('warning', 'Please select a maintenance')
      }
    }
  }

  const toggleConfirmDelete = () => {
    setOpenConfirmDeleteModal(!openConfirmDeleteModal)
  }

  const onSearchSelection = selection => {
    const newLocation = `/maintenance?id=${selection.id}`
    Router.push(newLocation)
  }

  if (props.session.user) {
    return (
      <Layout night={props.night} handleSearchSelection={onSearchSelection} unread={props.unread} session={props.session}>
        <MaintPanel 
          header='History' 
          buttons={
            <ButtonGroup>
              <IconButton appearance='default' style={{ border: '1px solid var(--grey3)', color: 'var(--grey4)' }} onClick={handleToggleNewModal} icon={<Icon icon='plus' />}>
                New
              </IconButton>
              <IconButton appearance='default' style={{ border: '1px solid var(--grey3)', color: 'var(--grey4)' }} onClick={deleteMaint} icon={<Icon icon='trash' />}>
                Delete
              </IconButton>
              <IconButton appearance='default' style={{ border: '1px solid var(--grey3)', color: 'var(--grey4)' }} onClick={handleGridExport} icon={<Icon icon='export' />}>
                Export
              </IconButton>
            </ButtonGroup>
          }
        >
          <div className='ag-theme-material' style={{ height: '700px', width: '100%' }}>
            <AgGridReact
              gridOptions={gridOptions}
              rowData={rowData}
              onGridReady={handleGridReady}
              animateRows
              pagination
              onFirstDataRendered={onFirstDataRendered}
            />
          </div>
        </MaintPanel>
        <Modal backdrop show={openConfirmDeleteModal} size='sm' onHide={deleteMaint}>
          <Modal.Header>
            Confirm Delete
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col>
                  Are you sure you want to delete maintenance <b style={{ fontWeight: '900' }}> {idToDelete}</b>
                </Col>
              </Row>
            </Container>
            <Row style={{ marginTop: '20px' }}>
              <Col>
                <ButtonGroup block>
                  <Button onClick={toggleConfirmDelete}>
                    Cancel
                  </Button>
                  <Button onClick={handleDelete}>
                    Confirm
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
        {/* <Card className='top-card-wrapper' style={{ maxWidth: '100%' }}>
          <CardHeader>
            <ButtonToolbar style={{ justifyContent: 'space-between' }}>
              <h2 style={{ marginBottom: '0px' }}>History</h2>
              <ButtonGroup size='md'>
                <Button onClick={this.handleToggleNewModal} theme='dark'>
                  <FontAwesomeIcon icon={faPlusCircle} width='1.5em' style={{ marginRight: '10px', color: 'secondary' }} />
                  New
                </Button>
                <Button onClick={this.deleteMaint} theme='dark'>
                  <FontAwesomeIcon icon={faTrashAlt} width='1.5em' style={{ marginRight: '10px', color: 'secondary' }} />
                  Delete
                </Button>
                <Button outline theme='dark' className='export-btn' onClick={this.handleGridExport}>
                  <UseAnimations animationKey='download' size={22} style={{ display: 'inline-block', fill: 'rgb(0,0,0)' }} />
                  <span style={{ marginLeft: '5px' }}>
                    Export
                  </span>
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </CardHeader>
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
                  <Button onClick={this.toggleConfirmDelete} outline theme='secondary'>
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
        </style> */}
      </Layout>
    )
  } else {
    return (
      <RequireLogin />
    )
  }
}

History.getInitialProps = async ({ req, query }) => {
  const host = req ? req.headers['x-forwarded-host'] : window.location.hostname
  const protocol = 'https:'
  if (host.indexOf('localhost') > -1) {
    protocol = 'http:'
  }
  const pageRequest = `${protocol}//${host}/api/maintenances`
  const res = await fetch(pageRequest)
  const json = await res.json()
  return {
    jsonData: json,
    // night: query.night,
    session: await NextAuth.init({ req })
  }
}

export default History
