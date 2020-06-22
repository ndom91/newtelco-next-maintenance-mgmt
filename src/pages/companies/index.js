import React, { useRef, useState } from 'react'
import NextAuth from 'next-auth/client'
import './companies.css'
import Layout from '@/newtelco/layout'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import moment from 'moment-timezone'
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
import { IconButton, ButtonGroup, SelectPicker } from 'rsuite'

const Companies = ({ session, suppliers }) => {
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
        sort: { direction: 'desc', priority: 0 },
      },
      {
        headerName: 'By',
        field: 'bearbeitetvon',
        cellRenderer: 'edittedby',
        width: 110,
        cellStyle: params => {
          return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
        width: 140,
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

  const [rowData, setRowData] = useState([])
  const [selectedNewCompany, setSelectedNewCompany] = useState([])

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
        fileName: `company_${selectedNewCompany.label}_${moment(
          new Date()
        ).format('YYYYMMDD')}`,
        columnSeparator: ',',
      }
      gridApi.current.exportDataAsCsv(params)
    }
  }

  const handleNewCompanySelect = selectedOption => {
    setSelectedNewCompany(selectedOption)
    fetch(`/api/companies/maintenances?id=${selectedOption}`)
      .then(resp => resp.json())
      .then(data => {
        console.log(data)
        setRowData(data.maintenances)
      })
  }

  if (session) {
    return (
      <Layout>
        <MaintPanel
          header='Company Overview'
          buttons={
            <>
              <SelectPicker
                style={{ width: 325 }}
                value={selectedNewCompany}
                onChange={handleNewCompanySelect}
                data={suppliers.companies}
                placeholder='Please select a Company'
              />
              <ButtonGroup>
                <IconButton
                  appearance='subtle'
                  onClick={handleGridExport}
                  icon={
                    <svg
                      width='20'
                      height='20'
                      fill='none'
                      stroke-linecap='round'
                      stroke-linejoin='round'
                      stroke-width='2'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      style={{ marginRight: '5px' }}
                    >
                      <path d='M8 16a5 5 0 01-.916-9.916 5.002 5.002 0 019.832 0A5.002 5.002 0 0116 16m-7 3l3 3m0 0l3-3m-3 3V10' />
                    </svg>
                  }
                  style={{
                    padding: '0 20px',
                    display: 'flex',
                    color: 'var(--grey4)',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  Export
                </IconButton>
              </ButtonGroup>
            </>
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
  const res2 = await fetch(`${protocol}//${host}/api/companies/selectmaint`)
  const suppliers = await res2.json()
  return {
    props: {
      session,
      suppliers,
    },
  }
}

export default Companies
