import fetch from 'isomorphic-unfetch'
import Link from 'next/link'

Maintenance.getInitialProps = async ({ req, query }) => {
  const protocol = req
    ? `${req.headers['x-forwarded-proto']}:`
    : location.protocol
  const host = req ? req.headers['x-forwarded-host'] : location.host
  const pageRequest = `${protocol}//${host}/api/maintenances/${query.id}`
  const res = await fetch(pageRequest)
  const json = await res.json()
  return json
}

function Maintenance ({ profile }) {
  return (
    <>
      <div>
        <h1>{profile.bearbeitetvon}</h1>
        <p>{profile.updatedBy}</p>
        <p>{profile.maileingang}</p>
        <Link href='/'>
          <a>← Back to profiles</a>
        </Link>
      </div>
    </>
  )
}

export default Maintenance
