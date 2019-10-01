import React from 'react'
import Link from 'next/link'
import Fonts from './fonts'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCog,
  faHome,
  faHistory,
  faInbox
} from '@fortawesome/free-solid-svg-icons'

class Header extends React.Component {
  componentDidMount () {
    Fonts()
  }

  render () {
    return (
      <div className='wrapper'>
        <img src='/static/images/icons/nt-64.png' />
        <div className='menu'>
          <Link href='/'>
            <a>
              <FontAwesomeIcon width='1.125em' className='menu-icon' icon={faHome} />
              <span className='menu-label'>Home</span>
            </a>
          </Link>
          <Link href='/inbox'>
            <a>
              <FontAwesomeIcon width='1.125em' className='menu-icon' icon={faInbox} />
              <span className='menu-label'>Inbox</span>
            </a>
          </Link>
          <Link href='/history'>
            <a>
              <FontAwesomeIcon width='1.125em' className='menu-icon' icon={faHistory} />
              <span className='menu-label'>History</span>
            </a>
          </Link>
          <Link href='/settings'>
            <a>
              <FontAwesomeIcon width='1.125em' className='menu-icon' icon={faCog} />
              <span className='menu-label'>Settings</span>
            </a>
          </Link>
          <form id='signout' method='post' action='/auth/signout' onSubmit={this.handleSignOutSubmit}>
            <input name='_csrf' type='hidden' value={this.props.session.csrfToken} />
            <button type='submit' className='btn btn-outline-secondary'>Sign out</button>
          </form>
        </div>
        <style jsx>{`
          .wrapper {
            position: absolute;
            display: flex;
            top: 0;
            left: 0;
            width: 100%;
            height: 50px;
            
            background-color: #67B246;
            justify-content: space-between;
          }
          img {
            margin-left: 2rem;
            height: 50px;
          }
          .menu {
            line-height: 50px;
            margin: auto 30px auto 0px;
          }
          .menu-icon {
            font-size: 20px;
          }
          .menu-label {
            margin-left: 10px;
          }
          a {
            font-family: Lato, Helvetica;
            font-weight: 800;
            text-decoration: none;
            color: #fff; 
            margin: 0 20px;
          }
        `}
        </style>
      </div>
    )
  }
}

export default Header
