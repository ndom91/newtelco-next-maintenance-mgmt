import React from 'react'
import Layout from '../src/components/layout'
// import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../src/components/require-login'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham.css'
import EditBtn from '../src/components/ag-grid/edit-btn'
import './style/history.css'
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter
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
          filter: true
        },
        columnDefs: [
          {
            headerName: '',
            width: 40,
            sortable: false,
            filter: false,
            resizable: false,
            cellRenderer: 'editBtn'
          },
          {
            headerName: 'ID',
            field: 'id',
            width: 60,
            sort: { direction: 'asc', priority: 0 }
          }, {
            headerName: 'Edited By',
            field: 'bearbeitetvon',
            width: 100
          }, {
            headerName: 'Their CID',
            field: 'derenCID',
            tooltipField: 'derenCID'
            // width: 100
          }, {
            headerName: 'Start',
            field: 'startDateTime',
            width: 100,
            tooltipField: 'startDateTime'
          }, {
            headerName: 'End',
            field: 'endDateTime',
            width: 100,
            tooltipField: 'endDateTime'
          }, {
            headerName: 'Newtelco CIDs',
            field: 'betroffeneCIDs',
            width: 120,
            tooltipField: 'betroffeneCIDs'
          }, {
            headerName: 'Supplier',
            field: 'name',
            width: 100
          }, {
            headerName: 'Mail Arrived',
            field: 'maileingang',
            width: 100,
            tooltipField: 'maileingang'
          }, {
            headerName: 'Postponed',
            field: 'postponed',
            width: 50
          }, {
            headerName: 'Updated',
            field: 'updatedAt'
            // width: 100
          }
        ],
        context: { componentParent: this },
        frameworkComponents: {
          editBtn: EditBtn
        },
        paginationPageSize: 20,
        rowHeight: 30,
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

  render () {
    if (this.props.session.user) {
      return (
        <Layout session={this.props.session}>
          <Card style={{ maxWidth: '100%' }}>
            <CardHeader><h2>History</h2></CardHeader>
            <CardBody>
              <div className='table-wrapper'>
                <div
                  className='ag-theme-balham'
                  style={{
                    height: '700px',
                    width: '100%',
                    border: '1px solid #ececec'
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
            <CardFooter>Card footer</CardFooter>
          </Card>
          <style jsx>{`
          .table-wrapper { 
            width: 100%;
          }
        `}
          </style>
        </Layout>
      )
    } else {
      return (
        <RequireLogin />
      )
    }
  }
}
