import Layout from '../../src/components/layout';
import { useRouter } from 'next/router';

export default () => {
  const router = useRouter();
  // console.log(router.query)
  return (
    <Layout>
      <h1>{router.query.id}</h1>
      <div className="markdown">
        {router.query.id}
      </div>
      <style jsx global>{`
        .markdown {
          font-family: 'Arial';
        }

        .markdown a {
          text-decoration: none;
          color: blue;
        }

        .markdown a:hover {
          opacity: 0.6;
        }

        .markdown h3 {
          margin: 0;
          padding: 0;
          text-transform: uppercase;
        }
      `}</style>
    </Layout>
  );
};