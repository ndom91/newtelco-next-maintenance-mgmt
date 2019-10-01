import React from 'react'
import Layout from '../src/components/layout'
import fetch from 'isomorphic-unfetch'
import RequireLogin from '../src/components/require-login'
import { NextAuth } from 'next-auth/client'
import Link from 'next/link'

export default class Maintenance extends React.Component {
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const pageRequest = `https://${host}/api/maintenances/${query.id}`
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
      maintenance: {}
    }
  }

  componentDidMount () {
    this.setState({ maintenance: this.props.jsonData.profile })
  }

  render () {
    const {
      maintenance
    } = this.state
    if (this.props.session.user) {
      return (
        <Layout session={this.props.session}>
          <div className='maintenance-wrapper'>
            <div className='maintenance-input-group'>
              <h1>{maintenance.id} - {maintenance.name}</h1>
              <label htmlFor='maileingang'>Mail Arrived</label>
              <input id='maileingang-input' name='maileingang' type='text' value={maintenance.maileingang} />
              <label htmlFor='edited-by'>Edited By</label>
              <input id='edited-by-input' name='edited-by' type='text' value={maintenance.bearbeitetvon} />
              <label htmlFor='supplier'>Supplier</label>
              <input id='supplier-input' name='supplier' type='text' value={maintenance.name} />
              <label htmlFor='their-cid'>Their CID</label>
              <input id='their-cid' name='their-cid' type='text' value={maintenance.derenCID} />
              <label htmlFor='impacted-customers'>Impacted Customer(s)</label>
              <input id='impacted-customers' name='impacted-customers' type='text' value={maintenance.betroffeneKunden} />
              <label htmlFor='impacted-cids'>Impacted CID(s)</label>
              <input id='impacted-cids' name='impacted-cids' type='text' value={maintenance.betroffeneCIDs} />
              <label htmlFor='start-datetime'>Start Date/Time</label>
              <input id='start-datetime' name='start-datetime' type='text' value={maintenance.startDateTime} />
              <label htmlFor='end-datetime'>End Date/Time</label>
              <input id='end-datetime' name='end-datetime' type='text' value={maintenance.endDateTime} />
              <label htmlFor='notes'>Notes</label>
              <input id='notes' name='notes' type='text' value={maintenance.notes} />
              <label htmlFor='updated-at'>Updated At</label>
              <input id='updated-at' name='updated-at' type='text' value={maintenance.updatedAt} />
              <label htmlFor='updated-by'>Updated By</label>
              <input id='updated-by' name='updated-by' type='text' value={maintenance.updatedBy} />
            </div>
            <div className='link-wrapper'>
              <Link href='/history'>
                <a>Back to History</a>
              </Link>
            </div>
          </div>
          <style jsx>{`
          * {
            font-family: Lato, Helvetica;
          } 

          .maintenance-wrapper {
            display: flex;
            flex-direction: column;
            height: 600px;
          }

          .maintenance-input-group {
            display: block;
            flex-grow: 1;
          }

          input {
            display: block;
          }

          label {
            margin: 15px;
          }

          .link-wrapper {

          }

          a {
            font-family: Lato, Helvetica;
            font-weight: 700;
            padding: 9px;
            margin-top: 10px;
            background: #fff;

            border: 1px solid #67B246;
            border-radius: 5px;

            text-decoration: none;
            color: #67B246;
          } 
        `}
          </style>
        </Layout>
      )
    } else {
      return <RequireLogin />
    }
  }
}
