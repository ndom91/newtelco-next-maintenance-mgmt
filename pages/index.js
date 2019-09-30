import Layout from '../src/components/layout'
// import Link from 'next/link'

export default function Blog () {
  return (
    <Layout>
      <h1>Newtelco Maintenance</h1>
      <style jsx>{`
        h1,
        a {
          font-family: 'Arial';
        }

        ul {
          padding: 0;
        }

        li {
          list-style: none;
          margin: 5px 0;
        }

        a {
          text-decoration: none;
          color: blue;
        }

        a:hover {
          opacity: 0.6;
        }
      `}
      </style>
    </Layout>
  )
}
