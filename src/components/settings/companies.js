import React from 'react'
import fetch from 'isomorphic-unfetch'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'

export default class Companies extends React.Component {
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://${host}/api/settings/companies` // ?page=${query.page || 1}&limit=${query.limit || 41}`
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
          }
        ]
      }
    }
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
    return (
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
            // rowData={this.state.rowData}
            onGridReady={this.onGridReady}
            animateRows
            pagination
            onFirstDataRendered={this.onFirstDataRendered.bind(this)}
          />
        </div>
      </div>
    )
  }
}
