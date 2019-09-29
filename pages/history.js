import React from 'react'
import Layout from '../src/components/layout'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham.css'

// { maintenances, page, pageCount }
export default class About extends React.Component {
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://${host}/api/maintenances?page=${query.page ||
      1}&limit=${query.limit || 9}`
    const res = await fetch(pageRequest)
    const json = await res.json()
    return { jsonData: json }
  }

  constructor (props) {
    super(props)
    this.state = {
      columnDefs: [{
        headerName: 'id', field: 'id', sortable: true, filter: true
      }, {
        headerName: 'Bearbeitet Von', field: 'bearbeitetvon', sortable: true, filter: true
      }, {
        headerName: 'betroffeneCIDs', field: 'betroffeneCIDs', sortable: true, filter: true
      }, {
        headerName: 'derenCIDid', field: 'derenCIDid', sortable: true, filter: true
      }, {
        headerName: 'done', field: 'done', sortable: true, filter: true
      }, {
        headerName: 'emergency', field: 'emergency', sortable: true, filter: true
      }, {
        headerName: 'endDateTime', field: 'endDateTime', sortable: true, filter: true
      }, {
        headerName: 'inBearbeitung', field: 'inBearbeitung', sortable: true, filter: true
      }, {
        headerName: 'lieferant', field: 'lieferant', sortable: true, filter: true
      }, {
        headerName: 'mailSentAt', field: 'mailSentAt', sortable: true, filter: true
      }, {
        headerName: 'maileingang', field: 'maileingang', sortable: true, filter: true
      }, {
        headerName: 'notes', field: 'notes', sortable: true, filter: true
      }, {
        headerName: 'postponed', field: 'postponed', sortable: true, filter: true
      }, {
        headerName: 'receivedmail', field: 'receivedmail', sortable: true, filter: true
      }, {
        headerName: 'startDateTime', field: 'startDateTime', sortable: true, filter: true
      }, {
        headerName: 'updatedAt', field: 'updatedAt', sortable: true, filter: true
      }, {
        headerName: 'updatedBy', field: 'updatedBy', sortable: true, filter: true
      }]
    }
  }

  componentDidMount () {
    console.log(this.props.jsonData.maintenances)
    this.setState({ rowData: this.props.jsonData.maintenances })
  }

  render () {
    return (
      <Layout>
        <div
          className='ag-theme-balham'
          style={{
            height: '500px',
            width: '600px'
          }}
        >
          <AgGridReact
            columnDefs={this.state.columnDefs}
            rowData={this.state.rowData}
          />
        </div>
        {/* <nav>
          {page > 1 && (
            <Link href={`/history?page=${page - 1}&limit=9`}>
              <a>Previous</a>
            </Link>
          )}
          {page < pageCount && (
            <Link href={`/history?page=${page + 1}&limit=9`}>
              <a className='next'>Next</a>
            </Link>
          )}
        </nav> */}
      </Layout>
    )
  }
}

// About.getInitialProps = async () => {
//   const response = await fetch('http://localhost:3000/api/maintenances')
//   const maintenances = await response.json()

//   return { maintenances }
// }
