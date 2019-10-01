import React from 'react'
import Header from './header'
import Router from 'next/router'
import Link from 'next/link'
import { NextAuth } from 'next-auth/client'

export default class Layout extends React.Component {
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
    return (
      <div>
        <Header session={this.props.session} />
        <div className='content'>
          {this.props.children}
        </div>
        {/* <Footer/> */}
      </div>
    )
  }
}
