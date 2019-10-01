import React from 'react'
import Link from 'next/link'
import Fonts from './fonts'
import { NextAuth } from 'next-auth/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCog,
  faHome,
  faHistory,
  faPowerOff,
  faInbox
} from '@fortawesome/free-solid-svg-icons'

class Header extends React.Component {
  // static async getInitialProps ({ req }) {
  //   return {
  //     session: await NextAuth.init({ req })
  //   }
  // }

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
            <div className='logout-btn-wrapper'>
              <FontAwesomeIcon width='1.125em' className='menu-icon logout' icon={faPowerOff} />
            </div>
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
          #signout {
            display: inline-block;
          }
          .lagout-btn-wrapper {
            padding: 5px;
            border: 1px solid #B22222;
            border-radius: 5px;
          }
          .logout {
            color: #B22222;
            fill: #B22222;
          }
        `}
        </style>
      </div>
    )
  }
}

export default Header
