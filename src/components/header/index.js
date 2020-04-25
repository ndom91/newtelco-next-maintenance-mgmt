import React from 'react'
import Link from 'next/link'
import Store from '../store'
// import DarkmodeSwitch from '../darkmode'
import SearchInput from './search'
import './header.css'

import {
  Header,
  Nav,
  Navbar,
  Icon,
  Dropdown,
  Avatar,
  Badge
} from 'rsuite'

const NextLink = React.forwardRef((props, ref) => {
  const { href, as, ...rest } = props
  return (
    <Link href={href} as={as}>
      <a ref={ref} {...rest} />
    </Link>
  )
})

const NavLink = props => <Dropdown.Item componentClass={NextLink} {...props} />

const MaintHeader = props => {
  const store = Store.useStore()
  const count = store.get('count')
  const session = store.get('session')

  const r = Math.floor(Math.random() * 6) + 1
  let avatarPath = `/static/images/avatars/avatar${r}.svg`
  if (session.user) {
    const username = session.user.email.match(/^([^@]*)@/)[1]
    if (username !== '') {
      avatarPath = `/static/images/avatars/${username}.png`
    }
  }

  return (
    <Header>
      <Navbar appearance='default' style={{ boxShadow: '0 5px 10px rgba(0,0,0,0.15)' }}>
        <Navbar.Header>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', marginLeft: '15px', marginRight: '10px' }}>
            <svg version='1.0' xmlns='http://www.w3.org/2000/svg' width='36px' height='36px' viewBox='0 0 1280 1280' preserveAspectRatio='xMidYMid meet'>
              <g id='layer101' fill='#a6a6a6' stroke='none'>
                <path d='M40 625 l0 -345 79 0 c73 0 81 2 98 24 10 14 52 73 93 131 41 58 92 129 113 157 l37 52 0 -183 0 -182 88 3 87 3 3 334 c2 261 -1 336 -10 343 -7 4 -45 8 -85 8 l-72 0 -33 -47 c-18 -27 -36 -52 -40 -58 -14 -17 -152 -208 -173 -240 l-20 -30 -5 185 -5 185 -77 3 -78 3 0 -346z' />
                <path d='M867 964 c-4 -4 -7 -126 -7 -271 l0 -263 -105 0 -105 0 0 -75 0 -75 298 2 297 3 0 70 0 70 -107 3 -108 3 -2 267 -3 267 -75 3 c-42 1 -79 0 -83 -4z' />
              </g>
            </svg>
          </div>
        </Navbar.Header>
        <Navbar.Body>
          <Nav>
            <Link
              href={{
                pathname: '/',
                query: {
                  night: props.night
                }
              }}
              as='/'
              passHref
            >
              <Nav.Item icon={<Icon icon='home' />}>
                <span>Home</span>
              </Nav.Item>
            </Link>
            <Link
              href={{
                pathname: '/inbox',
                query: {
                  night: props.night
                }
              }}
              as='/inbox'
              passHref
            >
              <Nav.Item>
                <span>
                  <Badge style={{ position: 'absolute', top: '10px', right: '5px', background: '#67B246' }} content={count} />
                  Inbox
                </span>
              </Nav.Item>
            </Link>
            <Link
              href={{
                pathname: '/history',
                query: {
                  night: props.night
                }
              }}
              as='/history'
              passHref
            >
              <Nav.Item>
                <span>History</span>
              </Nav.Item>
            </Link>
            <Link
              href={{
                pathname: '/companies',
                query: {
                  night: props.night
                }
              }}
              as='/companies'
              passHref
            >
              <Nav.Item>
                <span>Companies</span>
              </Nav.Item>
            </Link>
          </Nav>
          <Nav pullRight style={{ margin: '0px 20px' }}>
            <div style={{ width: '400px', height: '56px', display: 'inline-flex', alignItems: 'center' }}>
              <SearchInput />
            </div>
            <Dropdown
              className='header-dropdown'
              placement='bottomEnd'
              icon={<Avatar size='md' circle src={avatarPath} style={{ border: '2px solid #67b246' }} />}
            >
              <NavLink icon={<Icon icon='cog' />} href='/settings'>Settings</NavLink>
              <Dropdown.Item icon={<Icon icon='sign-out' />} onClick={(e) => props.signOut(e)}>Logout</Dropdown.Item>
            </Dropdown>
          </Nav>
        </Navbar.Body>
      </Navbar>
    </Header>
  )
}

export default MaintHeader
