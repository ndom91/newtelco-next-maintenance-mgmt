import React from 'react'
import ProtectedIcon from '../ag-grid/protected'
import SentIcon from '../ag-grid/sent'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPaperPlane,
  faSearch
} from '@fortawesome/free-solid-svg-icons'
import {
  Button,
  ButtonGroup
} from 'shards-react'

class EmailTable extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      kundencids: this.props.kundencids,
      gridOptions: {
        defaultColDef: {
          resizable: true,
          sortable: true,
          filter: true,
          selectable: true
        },
        columnDefs: [
          {
            headerName: 'Mail',
            width: 80,
            sortable: false,
            filter: false,
            resizable: false,
            cellRenderer: 'sendMailBtn',
            cellStyle: { 'padding-right': '0px', 'padding-left': '10px' }
          }, {
            headerName: 'CID',
            field: 'kundenCID',
            width: 100,
            sort: { direction: 'asc', priority: 0 }
          }, {
            headerName: 'Customer',
            field: 'name',
            width: 170
          }, {
            headerName: 'Protection',
            field: 'protected',
            filter: false,
            cellRenderer: 'protectedIcon',
            width: 120,
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }, {
            headerName: 'Recipient',
            field: 'maintenanceRecipient',
            width: 150
          }, {
            headerName: 'Sent',
            field: 'sent',
            cellRenderer: 'sentIcon',
            width: 100,
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }
        ],
        context: { componentParent: this },
        frameworkComponents: {
          sendMailBtn: this.sendMailBtns,
          protectedIcon: ProtectedIcon,
          sentIcon: SentIcon
        },
        paginationPageSize: 10,
        rowClass: 'row-class'
      }
    }
  }

  componentDidMount () {
    this.props.onRef(this)
  }

  componentWillUnmount () {
    this.props.onRef(undefined)
  }

  sendMailBtns = (row) => {
    return (
      <ButtonGroup>
        <Button onClick={() => this.props.prepareDirectSend(row.data.maintenanceRecipient, row.data.kundenCID)} style={{ padding: '0.7em' }} size='sm' outline>
          <FontAwesomeIcon width='1.325em' icon={faPaperPlane} />
        </Button>
        <Button onClick={() => this.props.togglePreviewModal(row.data.maintenanceRecipient, row.data.kundenCID)} style={{ padding: '0.7em' }} size='sm' outline>
          <FontAwesomeIcon width='1.325em' icon={faSearch} />
        </Button>
      </ButtonGroup>
    )
  }

  handleGridReady = params => {
    this.gridApi = params.gridApi
    this.gridColumnApi = params.gridColumnApi
    // params.columnApi.autoSizeColumns()
  }

  refreshCells () {
    this.gridApi.refreshCells()
  }

  onFirstDataRendered (params) {
    // params.columnApi.autoSizeColumns()
    // params.columnApi.sizeColumnsToFit()
  }

  static getDerivedStateFromProps (props, state) {
    if (props.kundencids.length !== state.kundencids.length) {
      return {
        kundencids: props.kundencids
      }
    }
    return null
  }

  render () {
    return (
      <div
        className='ag-theme-material'
        style={{
          height: '100%',
          width: '100%'
        }}
      >
        <AgGridReact
          gridOptions={this.state.gridOptions}
          rowData={this.state.kundencids}
          // onGridReady={this.handleGridReady}
          onGridReady={params => this.gridApi = params.api}
          animateRows
          pagination
          onFirstDataRendered={this.onFirstDataRendered.bind(this)}
        />
      </div>
    )
  }
}

export default EmailTable
