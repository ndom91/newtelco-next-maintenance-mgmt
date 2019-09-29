import Layout from '../src/components/layout'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'

About.getInitialProps = async ({ req, query }) => {
  const protocol = req
    ? `${req.headers['x-forwarded-proto']}:`
    : location.protocol
  const host = req ? req.headers['x-forwarded-host'] : location.host
  const pageRequest = `${protocol}//${host}/api/maintenances?page=${query.page ||
    1}&limit=${query.limit || 9}`
  const res = await fetch(pageRequest)
  const json = await res.json()
  return json
}

export default function About ({ maintenances, page, pageCount }) {
  return (
    <Layout>
      <ul>
        {maintenances.map(m => (
          <li className='profile' key={m.id}>
            <Link href={`/m/${m.id}`}>
              <a>
                <span>{m.bearbeitetvon}</span>
              </a>
            </Link>
          </li>
        ))}
      </ul>
      <nav>
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
      </nav>
    </Layout>
  )
}

// About.getInitialProps = async () => {
//   const response = await fetch('http://localhost:3000/api/maintenances')
//   const maintenances = await response.json()

//   return { maintenances }
// }
