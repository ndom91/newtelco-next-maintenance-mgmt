import React from 'react'
import fetch from 'isomorphic-unfetch'
import { AgGridReact } from 'ag-grid-react'
import { CardTitle, Button } from 'shards-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'

export default class SupplierCIDs extends React.Component {
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://${host}/api/settings/lieferantcids`
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
          selectable: true,
          editable: true
        },
        columnDefs: [
          {
            headerName: 'ID',
            field: 'id',
            width: 80,
            editable: false
          },
          {
            headerName: 'Company',
            field: 'name',
            width: 200
          },
          {
            headerName: 'Supplier CID',
            field: 'derenCID',
            width: 200,
          }
        ],
        rowBuffer: 0,
        rowSelection: 'multiple',
        rowModelType: 'infinite',
        paginationPageSize: 100,
        cacheOverflowSize: 2,
        maxConcurrentDatasourceRequests: 1,
        infiniteInitialRowCount: 154,
        maxBlocksInCache: 10
      }
    }
  }

  handleGridReady = params => {
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
    params.api.sizeColumnsToFit()

    const host = window.location.host

    const httpRequest = new XMLHttpRequest()
    const updateData = data => {
      const companies = data.lieferantCIDsResult
      var dataSource = {
        rowCount: null,
        getRows: function (params) {
          var rowsThisPage = companies.slice(params.startRow, params.endRow)
          var lastRow = -1
          if (companies.length <= params.endRow) {
            lastRow = companies.length
          }
          params.successCallback(rowsThisPage, lastRow)
        }
      }
      params.api.setDatasource(dataSource)
    }

    httpRequest.open(
      'GET',
      `https://${host}/api/lieferantcids/settings`
    )
    httpRequest.send()
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        updateData(JSON.parse(httpRequest.responseText))
      }
    }
  };

  onFirstDataRendered (params) {
    // params.columnApi.autoSizeColumns()
    // params.columnApi.sizeColumnsToFit()
  }

  render () {
    return (
      <>
        <CardTitle>
          <span className='section-title'>Newtelco CIDs</span>
          <Button outline theme='primary'>Add</Button>
        </CardTitle>
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
              onGridReady={this.handleGridReady}
              animateRows
              stopEditingWhenGridLosesFocus
              onFirstDataRendered={this.onFirstDataRendered.bind(this)}
            />
          </div>
        </div>
        <style jsx>{`
            :global(.card-title) {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            :global(.ag-cell.ag-cell-inline-editing) {
              padding: 10px !important;
              height: inherit !important;
            }
          `}
        </style>
      </>
    )
  }
}
