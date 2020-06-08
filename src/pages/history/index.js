import React, { useRef, useState } from 'react'
import NextAuth from 'next-auth/client'
import './history.css'
import Layout from '@/newtelco/layout'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import moment from 'moment-timezone'
import Router from 'next/router'
import RequireLogin from '@/newtelco/require-login'
import EditBtn from '@/newtelco/ag-grid/edit-btn'
import StartDateTime from '@/newtelco/ag-grid/startdatetime'
import EndDateTime from '@/newtelco/ag-grid/enddatetime'
import MailArrived from '@/newtelco/ag-grid/mailarrived'
import UpdatedAt from '@/newtelco/ag-grid/updatedat'
import Supplier from '@/newtelco/ag-grid/supplier'
import RescheduledIcon from '@/newtelco/ag-grid/rescheduled'
import CompleteIcon from '@/newtelco/ag-grid/complete'
import EdittedBy from '@/newtelco/ag-grid/edittedby'
import MaintPanel from '@/newtelco/panel'
import Notify from '@/newtelco-utils/notification'
import ConfirmModal from '@/newtelco/confirmmodal'
import {
  Icon,
  IconButton,
  ButtonGroup,
  FlexboxGrid,
  SelectPicker,
  Loader,
} from 'rsuite'

const History = ({ session, data }) => {
  const gridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      selectable: true,
    },
    columnDefs: [
      {
        headerName: '',
        width: 80,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: 'editBtn',
        pinned: 'left',
      },
      {
        headerName: 'ID',
        field: 'id',
        width: 100,
        pinned: 'left',
        sort: { direction: 'asc', priority: 0 },
      },
      {
        headerName: 'By',
        field: 'bearbeitetvon',
        cellRenderer: 'edittedby',
        width: 100,
        cellStyle: params => {
          return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }
        },
      },
      {
        headerName: 'Supplier',
        field: 'name',
        cellRenderer: 'supplier',
        cellStyle: params => {
          return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'start',
          }
        },
      },
      {
        headerName: 'Their CID',
        field: 'derenCID',
        tooltipField: 'derenCID',
      },
      {
        headerName: 'Start',
        field: 'startDateTime',
        width: 160,
        cellRenderer: 'startdateTime',
      },
      {
        headerName: 'End',
        field: 'endDateTime',
        width: 160,
        cellRenderer: 'enddateTime',
      },
      {
        headerName: 'Newtelco CIDs',
        field: 'betroffeneCIDs',
        tooltipField: 'betroffeneCIDs',
      },
      {
        headerName: 'Mail Arrived',
        field: 'maileingang',
        cellRenderer: 'mailArrived',
      },
      {
        headerName: 'Updated',
        field: 'updatedAt',
        cellRenderer: 'updatedAt',
      },
      {
        headerName: 'Rescheduled',
        field: 'rescheduled',
        width: 150,
        cellRenderer: 'rescheduledIcon',
        cellStyle: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        },
      },
      {
        headerName: 'Complete',
        field: 'done',
        width: 100,
        pinned: 'right',
        cellRenderer: 'complete',
      },
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
      edittedby: EdittedBy,
      rescheduledIcon: RescheduledIcon,
    },
    rowSelection: 'multiple',
    paginationPageSize: 10,
    rowClass: 'row-class',
    rowClassRules: {
      'row-completed': params => {
        const done = params.data.done
        if (done === 'true' || done === '1') {
          return true
        }
        return false
      },
      'row-cancelled': params => {
        const cancelled = params.data.cancelled
        if (cancelled === 'true' || cancelled === '1') {
          return true
        }
        return false
      },
      'row-emergency': params => {
        const emergency = params.data.emergency
        if (emergency === 'true' || emergency === '1') {
          return true
        }
        return false
      },
    },
  }

  const gridApi = useRef()

  const [openNewModal, setOpenNewModal] = useState(false)
  const [selectedNewCompany, setSelectedNewCompany] = useState('')
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false)
  const [rowData, setRowData] = useState(data.maintenances)
  const [newMaintenanceInfo, setNewMaintenanceInfo] = useState([])
  const [idToDelete, setIdToDelete] = useState('')

  const handleGridReady = params => {
    gridApi.current = params.api
  }

  const onFirstDataRendered = params => {
    params.columnApi.autoSizeColumns()
    params.api.redrawRows()
  }

  const handleGridExport = () => {
    if (gridApi.current) {
      const params = {
        allColumns: true,
        fileName: `maintenanceExport_${moment(new Date()).format('YYYYMMDD')}`,
        columnSeparator: ',',
      }
      gridApi.current.exportDataAsCsv(params)
    }
  }

  const handleToggleNewModal = () => {
    setOpenNewModal(!openNewModal)
  }

  const handleNewCompanySelect = selectedOption => {
    setSelectedNewCompany(selectedOption)
  }

  const handleDelete = () => {
    fetch(`/api/maintenances/delete?maintId=${idToDelete}`, {
      method: 'get',
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

    const newRowData = rowData.filter(el => el.id !== idToDelete)
    setOpenConfirmDeleteModal(!openConfirmDeleteModal)
    setRowData(newRowData)
  }

  const handleDeleteMaintOpen = () => {
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

  const handleSelectOpen = () => {
    if (newMaintenanceInfo.length === 0) {
      fetch('/api/companies/select', {
        method: 'get',
      })
        .then(resp => resp.json())
        .then(data => {
          setNewMaintenanceInfo(data.companiesDomains)
        })
    }
  }

  const createNewMaintenance = newCompanyDomain => {
    Router.push({
      pathname: '/maintenance',
      query: {
        id: 'NEW',
        mailId: 'NT',
        name: newCompanyDomain,
      },
      asPath: '/maintenance/new',
    })
  }

  const NewMaintenanceSelect = () => {
    return (
      <FlexboxGrid
        justify='center'
        align='middle'
        style={{ fontSize: '1.0rem', width: '200px' }}
      >
        <FlexboxGrid.Item>
          <label>Select a Company to create a Maintenance for</label>
          <br />
          <SelectPicker
            style={{ width: 325 }}
            value={selectedNewCompany || undefined}
            onChange={handleNewCompanySelect}
            onOpen={handleSelectOpen}
            onSearch={handleSelectOpen}
            data={newMaintenanceInfo}
            placeholder='Please select a Company'
            renderMenu={menu => {
              if (newMaintenanceInfo.length === 0) {
                return (
                  <div style={{ marginTop: '100px' }}>
                    <Loader center />
                  </div>
                )
              } else {
                return menu
              }
            }}
          />
        </FlexboxGrid.Item>
      </FlexboxGrid>
    )
  }

  if (session) {
    return (
      <Layout>
        <MaintPanel
          header='History'
          buttons={
            <ButtonGroup>
              <IconButton
                appearance='default'
                style={{
                  border: '1px solid var(--grey3)',
                  color: 'var(--grey4)',
                }}
                onClick={handleToggleNewModal}
                icon={<Icon icon='plus' />}
              >
                New
              </IconButton>
              <IconButton
                appearance='default'
                style={{
                  border: '1px solid var(--grey3)',
                  color: 'var(--grey4)',
                }}
                onClick={handleDeleteMaintOpen}
                icon={<Icon icon='trash' />}
              >
                Delete
              </IconButton>
              <IconButton
                appearance='default'
                style={{
                  border: '1px solid var(--grey3)',
                  color: 'var(--grey4)',
                }}
                onClick={handleGridExport}
                icon={<Icon icon='export' />}
              >
                Export
              </IconButton>
            </ButtonGroup>
          }
        >
          <div
            className='ag-theme-material'
            style={{ height: '700px', width: '100%' }}
          >
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
        {openConfirmDeleteModal && (
          <ConfirmModal
            header='Confirm Delete'
            content={`Are you sure you want to delete maintenance #${idToDelete}`}
            show={openConfirmDeleteModal}
            onHide={toggleConfirmDelete}
            cancelAction={toggleConfirmDelete}
            confirmAction={handleDelete}
          />
        )}
        {openNewModal && (
          <ConfirmModal
            header='New Maintenance'
            content={<NewMaintenanceSelect />}
            show={openNewModal}
            onHide={handleToggleNewModal}
            cancelAction={handleToggleNewModal}
            confirmAction={() => createNewMaintenance(selectedNewCompany)}
          />
        )}
      </Layout>
    )
  } else {
    return <RequireLogin />
  }
}

export async function getServerSideProps({ req }) {
  const session = await NextAuth.session({ req })
  const host = req ? req.headers['x-forwarded-host'] : window.location.hostname
  let protocol = 'https:'
  if (host.indexOf('localhost') > -1) {
    protocol = 'http:'
  }
  const pageRequest = `${protocol}//${host}/api/maintenances`
  const res = await fetch(pageRequest)
  const data = await res.json()
  return {
    props: {
      data,
      session,
    },
  }
}

export default History
