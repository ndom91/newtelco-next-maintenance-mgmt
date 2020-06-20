import React from 'react'
import NextAuth from 'next-auth/client'
import Link from 'next/link'
import Store from '@/newtelco/store'
import SearchInput from './search'
import './header.css'
import {
  Header,
  Nav,
  Navbar,
  Dropdown,
  Avatar,
  Badge,
  Divider,
} from 'rsuite'
import Notify from '@/newtelco-utils/notification'

const NextLink = React.forwardRef((props, ref) => {
  const { href, as, external, ...rest } = props
  return (
    <Link href={external ? '' : href} as={external ? '' : as}>
      <a href={external ? href : ''} ref={ref} {...rest} />
    </Link>
  )
})

const NavLink = props => <Dropdown.Item componentClass={NextLink} {...props} />

const MaintHeader = () => {
  const [session, loading] = NextAuth.useSession()
  const store = Store.useStore()
  const count = store.get('count')
  const night = store.get('night')

  let avatarPath
  if (!loading) {
    const username = session.user.email.match(/^([^@]*)@/)[1]
    if (session.user.image) {
      avatarPath = session.user.image
    } else if (
      ['alissitsin', 'fwaleska', 'ndomino', 'kmoeller', 'nchachua'].includes(
        username
      )
    ) {
      avatarPath = `/static/images/avatars/${username}.png`
    } else {
      avatarPath = `https://api.adorable.io/avatars/128/${session.user.name}.png`
    }
  }

  const toggleDark = e => {
    e.stopPropagation()
    store.set('night')(!store.get('night'))
  }

  return (
    <Header className='header-wrapper'>
      <Navbar
        appearance='default'
        style={{ boxShadow: '0 5px 10px rgba(0,0,0,0.15)' }}
      >
        <Navbar.Header>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              marginLeft: '15px',
              marginRight: '10px',
            }}
          >
            <svg
              version='1.0'
              xmlns='http://www.w3.org/2000/svg'
              width='36px'
              height='36px'
              viewBox='0 0 1280 1280'
              preserveAspectRatio='xMidYMid meet'
            >
              <g id='layer101' fill='#a6a6a6' stroke='none'>
                <path d='M40 625 l0 -345 79 0 c73 0 81 2 98 24 10 14 52 73 93 131 41 58 92 129 113 157 l37 52 0 -183 0 -182 88 3 87 3 3 334 c2 261 -1 336 -10 343 -7 4 -45 8 -85 8 l-72 0 -33 -47 c-18 -27 -36 -52 -40 -58 -14 -17 -152 -208 -173 -240 l-20 -30 -5 185 -5 185 -77 3 -78 3 0 -346z' />
                <path d='M867 964 c-4 -4 -7 -126 -7 -271 l0 -263 -105 0 -105 0 0 -75 0 -75 298 2 297 3 0 70 0 70 -107 3 -108 3 -2 267 -3 267 -75 3 c-42 1 -79 0 -83 -4z' />
              </g>
            </svg>
          </div>
        </Navbar.Header>
        <Navbar.Body>
          <Nav>
            <Divider vertical />
            <Link href='/' passHref>
              <Nav.Item
              // icon={
              //   <svg
              //     height='18'
              //     width='18'
              //     fill='none'
              //     strokeLinecap='round'
              //     strokeLinejoin='round'
              //     strokeWidth='2'
              //     viewBox='0 0 24 24'
              //     stroke='var(--grey4)'
              //     style={{ marginRight: '5px' }}
              //   >
              //     <path d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
              //   </svg>
              // }
              >
                Home
              </Nav.Item>
            </Link>
            <Link href='/inbox' as='/inbox' passHref>
              <Nav.Item>
                <span>
                  <Badge
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '5px',
                      background: '#67B246',
                    }}
                    content={count}
                  />
                  Inbox
                </span>
              </Nav.Item>
            </Link>
            <Link href='/history' as='/history' passHref>
              <Nav.Item>
                <span>History</span>
              </Nav.Item>
            </Link>
            {/* <Link
              href='/companies'
              as='/companies'
              passHref
            > */}
            <Nav.Item
              onClick={() => Notify('warning', 'Companies', 'Coming Soon')}
            >
              <span>Companies</span>
            </Nav.Item>
            {/* </Link> */}
          </Nav>
          <Nav pullRight style={{ margin: '0px 20px' }}>
            <div
              style={{
                width: '400px',
                height: '56px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <SearchInput />
            </div>
            <Divider vertical />
            <Dropdown
              trigger='click'
              className='header-dropdown'
              noCaret
              placement='bottomEnd'
              icon={
                <Avatar
                  size='md'
                  circle
                  src={avatarPath}
                  style={{ border: '2px solid #67b246' }}
                />
              }
            >
              <Dropdown.Item
                panel
                style={{ padding: '10px', textAlign: 'right', width: '105px' }}
              >
                <p>Signed in as</p>
                <strong>
                  {!loading && session.user.email.match(/^([^@]*)@/)[1]}
                </strong>
              </Dropdown.Item>
              <Dropdown.Item divider />
              <Dropdown.Item eventKey='1'>
                <span
                  onClick={toggleDark}
                  className='night-wrapper'
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <svg
                    height='18'
                    width='18'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    style={
                      night
                        ? { visibility: 'visible' }
                        : { display: 'none', visibility: 'hidden' }
                    }
                  >
                    <path d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' />
                  </svg>
                  <svg
                    height='18'
                    width='18'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    style={
                      !night
                        ? { visibility: 'visible' }
                        : { display: 'none', visibility: 'hidden' }
                    }
                  >
                    <path d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' />
                  </svg>
                </span>
                Night
              </Dropdown.Item>
              <Dropdown.Item divider />
              <NavLink
                icon={
                  <svg
                    height='16'
                    width='16'
                    fill='none'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'></path>
                    <path d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'></path>
                  </svg>
                }
                href={{ pathname: '/settings', query: { tab: 'companies' } }}
              >
                Settings
              </NavLink>
              <NavLink
                icon={
                  <svg
                    height='16'
                    width='16'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' />
                  </svg>
                }
                href='https://newtelco.kampsite.co'
                target='_blank'
                external
              >
                Requests
              </NavLink>
              <NavLink
                eventKey='2'
                icon={
                  <svg
                    height='16'
                    width='16'
                    fill='none'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'></path>
                  </svg>
                }
                href='/api/auth/signout'
              >
                Logout
              </NavLink>
            </Dropdown>
          </Nav>
        </Navbar.Body>
      </Navbar>
    </Header>
  )
}

export default MaintHeader
