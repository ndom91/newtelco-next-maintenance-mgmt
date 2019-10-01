import React from 'react'
import Link from 'next/link'
import Fonts from './fonts'
import {
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  FormInput,
  Collapse,
  Tooltip
} from 'shards-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPowerOff,
  faSearch
} from '@fortawesome/free-solid-svg-icons'

class Header extends React.Component {
  // static async getInitialProps ({ req }) {
  //   return {
  //     session: await NextAuth.init({ req })
  //   }
  // }
  constructor (props) {
    super(props)

    this.toggleNavbar = this.toggleNavbar.bind(this)

    this.toggle = this.toggle.bind(this),
    this.state = {
      collapseOpen: false,
      open: false
    }
  }

  componentDidMount () {
    Fonts()
  }

  toggle () {
    this.setState({
      open: !this.state.open
    })
  }

  toggleNavbar () {
    this.setState({
      ...this.state,
      ...{
        collapseOpen: !this.state.collapseOpen
      }
    })
  }

  render () {
    return (
      <Navbar type='dark' theme='secondary' expand='md'>
        <NavbarBrand href='#'>

          <svg version='1.0' xmlns='http://www.w3.org/2000/svg' width='48px' height='48px' viewBox='0 0 1280 1280' preserveAspectRatio='xMidYMid meet'>
            <g id='layer101' fill='#ffffff' stroke='none'>
              <path d='M40 625 l0 -345 79 0 c73 0 81 2 98 24 10 14 52 73 93 131 41 58 92 129 113 157 l37 52 0 -183 0 -182 88 3 87 3 3 334 c2 261 -1 336 -10 343 -7 4 -45 8 -85 8 l-72 0 -33 -47 c-18 -27 -36 -52 -40 -58 -14 -17 -152 -208 -173 -240 l-20 -30 -5 185 -5 185 -77 3 -78 3 0 -346z' />
              <path d='M867 964 c-4 -4 -7 -126 -7 -271 l0 -263 -105 0 -105 0 0 -75 0 -75 298 2 297 3 0 70 0 70 -107 3 -108 3 -2 267 -3 267 -75 3 c-42 1 -79 0 -83 -4z' />
            </g>
          </svg>
        </NavbarBrand>
        <NavbarToggler onClick={this.toggleNavbar} />

        <Collapse open={this.state.collapseOpen} navbar>

          <Nav navbar>
            <NavItem>
              <Link href='/'>
                <NavLink>
                  <span className='menu-label'>Home</span>
                </NavLink>
              </Link>
            </NavItem>
            <NavItem>
              <Link href='/inbox'>
                <NavLink>
                  <span className='menu-label'>Inbox</span>
                </NavLink>
              </Link>
            </NavItem>
            <NavItem>
              <Link href='/history'>
                <NavLink>
                  <span className='menu-label'>History</span>
                </NavLink>
              </Link>
            </NavItem>
            <NavItem>
              <Link href='/settings'>
                <NavLink>
                  <span className='menu-label'>Settings</span>
                </NavLink>
              </Link>
            </NavItem>
          </Nav>
          <Nav navbar className='ml-auto'>
            <InputGroup className='search-group' style={{ alignItems: 'center' }} size='sm' seamless>
              <InputGroupAddon type='prepend'>
                <InputGroupText>
                  <FontAwesomeIcon icon={faSearch} width='1em' style={{ color: 'secondary' }} />
                </InputGroupText>
              </InputGroupAddon>
              <FormInput className='border-0' placeholder='Search...' />
            </InputGroup>
            <NavItem>
              <NavLink>
                <form id='signout' method='post' action='/auth/signout' onSubmit={this.handleSignOutSubmit}>
                  <input name='_csrf' type='hidden' value={this.props.session.csrfToken} />
                  <div className='logout-btn-wrapper'>
                    <button className='logout-btn' type='submit'>
                      <FontAwesomeIcon width='1.125em' className='menu-icon logout' icon={faPowerOff} />
                    </button>
                    <Tooltip
                      open={this.state.open}
                      target='#signout'
                      noArrow
                      toggle={this.toggle}
                    >
                      Logout
                    </Tooltip>
                  </div>
                </form>
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
        <style jsx>{`
          .menu-label {
            font-family: Poppins, Helvetica;
            font-weight: 300;
            cursor: pointer;
          }
          .search-group {
            align-items: center;
          }
          #signout {
            display: inline-block;
          }
          .lagout-btn-wrapper {
            padding: 5px;
            border: 1px solid #B22222;
            border-radius: 5px;
          }
          .logout-btn {
            cursor: pointer;
            background: none;
            border: none;
            color: #fff;
          }
          .logout {
          }
        `}
        </style>
      </Navbar>
    )
  }
}

export default Header
