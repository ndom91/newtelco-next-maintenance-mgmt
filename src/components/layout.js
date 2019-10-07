import React from 'react'
import Header from './header'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import { Container, Row, Col } from 'shards-react'

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
        <Header unread={this.props.unread} session={this.props.session} />
        <Container fluid>
          <Row style={{ height: '20px' }} />
          <Row>
            <Col className='toplevel-col' sm='12' lg='12'>
              {this.props.children}
            </Col>
          </Row>
          <style jsx>{`
            @media only screen and (min-width: 1024px) {
              :global(div.toplevel-col) {
                flex: 1;
                margin: 0 30px;
              }
            }
            @media only screen and (max-width: 1024px) {
              :global(div.toplevel-col) {
                flex: 1;
                margin: 0;
              }
            }
          `}
          </style>
        </Container>
        {/* <Footer /> */}
      </div>
    )
  }
}
