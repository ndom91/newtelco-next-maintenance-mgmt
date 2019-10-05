import React from 'react'
import './style/history.css'
import Layout from '../src/components/layout'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
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
import {
  faSave
} from '@fortawesome/free-solid-svg-icons'
import {
  Card,
  CardHeader,
  CardBody,
  ButtonToolbar,
  ButtonGroup,
  Button
} from 'shards-react'

// { maintenances, page, pageCount }
export default class About extends React.Component {
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://${host}/api/maintenances` // ?page=${query.page || 1}&limit=${query.limit || 41}`
    const res = await fetch(pageRequest)
    const json = await res.json()
    return {
      jsonData: json,
      session: await NextAuth.init({ req })
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
        rowMultiSelectWithClick: true,
        paginationPageSize: 10,
        rowClass: 'row-class',
        rowClassRules: {
          'row-completed': function (params) { return params.data.done === 1 },
          'row-cancelled': function (params) { return params.data.cancelled === 1 },
          'row-emergency': function (params) { return params.data.emergency === 1 }
        }

        // rowModelType: 'infinite',
        // cacheOverflowSize: 2,
        // maxConcurrentDatasourceRequests: 2,
        // infiniteInitialRowCount: 1

      }
    }
  }

  componentDidMount () {
    // console.log(this.props.jsonData.maintenances)
    this.setState({ rowData: this.props.jsonData.maintenances })
  }

  onGridReady = params => {
    this.gridApi = params.gridApi
    this.gridColumnApi = params.gridColumnApi
    // params.columnApi.sizeColumnsToFit()
  }

  onFirstDataRendered (params) {
    // params.columnApi.autoSizeColumns()
    // params.columnApi.sizeColumnsToFit()
  }

  exportData () {
    const params = {
      allColumns: true,
      fileName: `maintenance${new Date()}`,
      columnSeparator: ',',
      onlySelected: true
    }

    this.state.gridOptions.api.exportDataAsCsv(params)
  }

  render () {
    if (this.props.session.user) {
      return (
        <Layout session={this.props.session}>
          <Card style={{ maxWidth: '100%' }}>
            <CardHeader>
              <ButtonToolbar style={{ justifyContent: 'space-between' }}>
                <h2 style={{ marginBottom: '0px' }}>History</h2>
                <ButtonGroup size='md'>
                  <Button onClick={this.exportData}>
                    <FontAwesomeIcon icon={faSave} width='1em' style={{ marginRight: '10px', color: 'secondary' }} />
                    Export
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
                    onGridReady={this.onGridReady}
                    animateRows
                    pagination
                    onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                  />
                </div>
              </div>
            </CardBody>
            <Footer />
          </Card>
        </Layout>
      )
    } else {
      return (
        <RequireLogin />
      )
    }
  }
}
