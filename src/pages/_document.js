import Document, { Html, Head, Main, NextScript } from 'next/document'
class MyDocument extends Document {
  static async getInitialProps (ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render () {
    return (
      <Html data-theme=''>
        <Head />
        <body id='scrolltarget'>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
