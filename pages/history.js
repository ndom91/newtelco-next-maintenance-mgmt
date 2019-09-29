import React from 'react'
import Layout from '../src/components/layout'
// import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham.css'
import EditBtn from '../src/components/ag-grid/edit-btn'

// { maintenances, page, pageCount }
export default class About extends React.Component {
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://${host}/api/maintenances?page=${query.page ||
      1}&limit=${query.limit || 21}`
    const res = await fetch(pageRequest)
    const json = await res.json()
    return { jsonData: json }
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
            width: 70,
            sortable: false,
            filter: false,
            resizable: false,
            cellRenderer: 'editBtn'
          },
          {
            headerName: 'ID',
            field: 'id',
            width: 50
          }, {
            headerName: 'Edited By',
            field: 'bearbeitetvon',
            width: 150
          }, {
            headerName: 'Their CID',
            field: 'derenCIDid',
            width: 100
          }, {
            headerName: 'Start',
            field: 'startDateTime',
            width: 100
          }, {
            headerName: 'End',
            field: 'endDateTime',
            width: 100
          }, {
            headerName: 'CIDs',
            field: 'betroffeneCIDs',
            width: 75
          }, {
            headerName: 'Supplier',
            field: 'lieferant',
            width: 100
          }, {
            headerName: 'Mail Sent',
            field: 'mailSentAt',
            width: 100
          }, {
            headerName: 'Mail Arrived',
            field: 'maileingang',
            width: 100
          }, {
            headerName: 'Notes',
            field: 'notes',
            width: 100
          }, {
            headerName: 'Postponed',
            field: 'postponed',
            width: 50
          }, {
            headerName: 'Updated',
            field: 'updatedAt',
            width: 100
          }, {
            headerName: 'Last Updated By',
            field: 'updatedBy',
            width: 75
          }, {
            headerName: 'Complete',
            field: 'done',
            width: 50
          }
        ],
        context: { componentParent: this },
        frameworkComponents: {
          editBtn: EditBtn
        }
        // rowModelType: 'infinite',
        // cacheOverflowSize: 2,
        // maxConcurrentDatasourceRequests: 2,
        // infiniteInitialRowCount: 1

      }
    }
  }

  componentDidMount () {
    console.log(this.props.jsonData.maintenances)
    this.setState({ rowData: this.props.jsonData.maintenances })
  }

  onGridReady = params => {
    this.gridApi = params.gridApi
    this.gridColumnApi = params.gridColumnApi
  }

  onFirstDataRendered (params) {
    params.columnApi.autoSizeColumns()
  }

  render () {
    return (
      <Layout>
        <div className='table-wrapper'>
          <div
            className='ag-theme-balham'
            style={{
              height: '600px',
              width: '100%',
              border: '1px solid #ececec'
            }}
          >
            <AgGridReact
              gridOptions={this.state.gridOptions}
              rowData={this.state.rowData}
              onGridReady={this.onGridReady}
              onFirstDataRendered={this.onFirstDataRendered.bind(this)}

            />
          </div>
        </div>
        <style jsx>{`
          .table-wrapper { 
            width: 100%;
          }
        `}
        </style>
      </Layout>
    )
  }
}
