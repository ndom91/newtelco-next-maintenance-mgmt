import Header from './header'

const Layout = props => (
  <div>
    <Header />
    <div className='content'>
      {props.children}
    </div>
    {/* <Footer/> */}
  </div>
)

export default Layout
