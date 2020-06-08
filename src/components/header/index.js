import React from 'react'
import NextAuth, { signout } from 'next-auth/client'
import Router from 'next/router'
import Link from 'next/link'
import Store from '@/newtelco/store'
import SearchInput from './search'
import './header.css'
import {
  Header,
  Nav,
  Navbar,
  Icon,
  Dropdown,
  Avatar,
  Badge,
  Divider,
  Toggle,
} from 'rsuite'
import Notify from '@/newtelco-utils/notification'

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
    const cur = store.get('night')
    store.set('night')(!cur)
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
            <Link href='/' as='/' passHref>
              <Nav.Item
                icon={
                  <svg
                    height='18'
                    width='18'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                    stroke='var(--grey4)'
                    style={{ marginRight: '5px' }}
                  >
                    <path d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                  </svg>
                }
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
              <Dropdown.Item panel style={{ padding: 10, textAlign: 'right' }}>
                <p>Signed in as</p>
                <strong>
                  {!loading && session.user.email.match(/^([^@]*)@/)[1]}
                </strong>
              </Dropdown.Item>
              <Dropdown.Item divider />
              <Dropdown.Item
                onSelect={(key, e) => e.preventDefault()}
                eventKey='1'
                onClick={toggleDark}
              >
                <Toggle
                  checked={night}
                  // checkedChildren={
                  //   <Icon
                  //     style={{ alignItems: 'center', color: '#fff' }}
                  //     icon='moon-o'
                  //   />
                  // }
                  // unCheckedChildren={<Icon icon='sun-o' />}
                  onChange={toggleDark}
                  size='sm'
                />
                Night
              </Dropdown.Item>
              <Dropdown.Item divider />
              <NavLink
                icon={<Icon icon='cog' />}
                href={{ pathname: '/settings', query: { tab: 'companies' } }}
              >
                Settings
              </NavLink>
              <Dropdown.Item
                eventKey='2'
                icon={<Icon icon='sign-out' />}
                href='/api/auth/signout'
              >
                Logout
              </Dropdown.Item>
            </Dropdown>
          </Nav>
        </Navbar.Body>
      </Navbar>
    </Header>
  )
}

export default MaintHeader
