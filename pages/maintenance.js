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
      <div>
        <h1>{profile.bearbeitetvon || 'John'}</h1>
        <p>{profile.notes || 'Note'}</p>
        <p>{profile.maileingang || 'Today'}</p>
        <Link href='/history'>
          <a>← Back to history</a>
        </Link>
      </div>
      <style jsx>{`
        * {
          font-family: Lato, Helvetica;
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
