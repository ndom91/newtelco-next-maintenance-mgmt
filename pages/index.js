import Layout from '../src/components/layout'
import Link from 'next/link'

const PostLink = props => (
  <li>
    <Link href='/m/[id]' as={`/m/${props.id}`}>
      <a>{props.id}</a>
    </Link>
  </li>
)

const Index = () => (
  <Layout>
    <p>Hello Next.js</p>
    <ul>
      <PostLink id='maint1' />
      <PostLink id='maint2' />
    </ul>
  </Layout>
)

export default Index
