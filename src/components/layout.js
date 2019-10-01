import React from 'react'
import Header from './header'
import Router from 'next/router'
import Link from 'next/link'
import { NextAuth } from 'next-auth/client'

export default class Layout extends React.Component {
  static async getInitialProps ({ req }) {
    return {
      session: await NextAuth.init({ req })
    }
  }

  constructor (props) {
    super(props)
    this.handleSignOutSubmit = this.handleSignOutSubmit.bind(this)
  }

  handleSignOutSubmit (event) {
    event.preventDefault()
    NextAuth.signout()
      .then(() => {
        Router.push('/auth/callback')
      })
      .catch(err => {
        process.env.NODE_ENV === 'development' && console.err(err)
        Router.push('/auth/error?action=signout')
      })
  }

  render () {
    if (this.props.session.user) {
      return (
        <div>
          <Header />
          <div className='content'>
            {this.props.children}
          </div>
          {/* <Footer/> */}
        </div>
      )
    } else {
      return (
        <>
          <p><Link href='/auth'><a className='btn btn-primary'>Sign in</a></Link></p>
        </>
      )
    }
  }
}
