import Layout from '../src/components/layout'
import fetch from 'isomorphic-unfetch'
import Link from 'next/link'

Maintenance.getInitialProps = async ({ req, query }) => {
  const host = req ? req.headers['x-forwarded-host'] : location.host
  const pageRequest = `https://${host}/api/maintenances/${query.id}`
  const res = await fetch(pageRequest)
  const json = await res.json()
  console.log(json)
  return json
}

function Maintenance ({ profile }) {
  return (
    <Layout>
      <div className='maintenance-wrapper'>
        <div className='maintenance-input-group'>
          <h1>{profile.id} - {profile.name}</h1>
          <label for='maileingang'>Mail Arrived</label>
          <input id='maileingang-input' name='maileingang' type='text' value={profile.maileingang} />
          <label for='edited-by'>Edited By</label>
          <input id='edited-by-input' name='edited-by' type='text' value={profile.bearbeitetvon} />
          <label for='supplier'>Supplier</label>
          <input id='supplier-input' name='supplier' type='text' value={profile.name} />
          <label for='their-cid'>Their CID</label>
          <input id='their-cid' name='their-cid' type='text' value={profile.derenCID} />
          <label for='impacted-customers'>Impacted Customer(s)</label>
          <input id='impacted-customers' name='impacted-customers' type='text' value={profile.betroffeneKunden} />
          <label for='impacted-cids'>Impacted CID(s)</label>
          <input id='impacted-cids' name='impacted-cids' type='text' value={profile.betroffeneCIDs} />
          <label for='start-datetime'>Start Date/Time</label>
          <input id='start-datetime' name='start-datetime' type='text' value={profile.startDateTime} />
          <label for='end-datetime'>End Date/Time</label>
          <input id='end-datetime' name='end-datetime' type='text' value={profile.endDateTime} />
          <label for='notes'>Notes</label>
          <input id='notes' name='notes' type='text' value={profile.notes} />
          <label for='updated-at'>Updated At</label>
          <input id='updated-at' name='updated-at' type='text' value={profile.updatedAt} />
          <label for='updated-by'>Updated By</label>
          <input id='updated-by' name='updated-by' type='text' value={profile.updatedBy} />
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
}

export default Maintenance
