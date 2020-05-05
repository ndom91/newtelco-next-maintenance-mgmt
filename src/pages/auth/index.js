import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { NextAuth } from 'next-auth/client'
import Fonts from '../../components/fonts'
import {
  Container,
  FlexboxGrid,
  Panel,
  Content,
  IconButton,
  Icon
} from 'rsuite'

export default class App extends React.Component {
  static async getInitialProps ({ req }) {
    return {
      session: await NextAuth.init({ req }),
      linkedAccounts: await NextAuth.linked({ req }),
      providers: await NextAuth.providers({ req })
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      email: '',
      session: this.props.session
    }
  }

  componentDidMount () {
    Fonts()
  }

  handleEmailChange = (event) => {
    this.setState({
      email: event.target.value
    })
  }

  handleSignInSubmit = (event) => {
    event.preventDefault()

    if (!this.state.email) return

    NextAuth.signin(this.state.email)
      .then(() => {
        Router.push(`/auth/check-email?email=${this.state.email}`)
      })
      .catch(() => {
        Router.push(`/auth/error?action=signin&type=email&email=${this.state.email}`)
      })
  }

  render () {
    if (this.props.session.user) {
      return (
        <Container>
          <Content>
            <FlexboxGrid justify='center' align='middle' style={{ height: '70vh', flexDirection: 'column' }}>
              <FlexboxGrid justify='center' align='middle'>
                <FlexboxGrid.Item colspan={20} style={{ maxWidth: '350px' }}>
                  <img src='/static/images/nt-black.png' alt='Newtelco Maintenance' width='100%' />
                </FlexboxGrid.Item>
              </FlexboxGrid>
              <FlexboxGrid.Item componentClass={Panel} colspan={8} md={10} sm={18}>
                <Panel header='Sign in' bordered shaded style={{ backgroundColor: '#fff'  }}>
                  <LinkAccounts
                    session={this.props.session}
                    linkedAccounts={this.props.linkedAccounts}
                  />
                </Panel>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Content>
        </Container>
      )
    } else {
      return (
        <Container>
          <Content>
            <FlexboxGrid justify='center' align='middle' style={{ height: '70vh', flexDirection: 'column' }}>
              <FlexboxGrid justify='center' align='middle'>
                <FlexboxGrid.Item colspan={20} style={{ maxWidth: '350px', marginBottom: '30px' }}>
                  <img src='/static/images/nt-black.png' alt='Newtelco Maintenance' width='100%' />
                </FlexboxGrid.Item>
              </FlexboxGrid>
              <FlexboxGrid.Item colspan={8} md={10} sm={18}>
                <Panel 
                  header={
                    <div style={{ width: '100%', textAlign: 'center' }}>
                      <span 
                        style={{ 
                          fontSize: '1.5rem', 
                        }}
                      >
                        Maintenance Application
                      </span>
                    </div>
                  } 
                  bordered 
                  shaded 
                  style={{ backgroundColor: '#fff', fontFamily: 'var(--font-body)' }}
                >
                  <SignInButtons providers={this.props.providers} />
                </Panel>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Content>
        </Container>
      )
    }
  }
}

export class LinkAccounts extends React.Component {
  render () {
    return (
      <div className='card mt-4 mb-3'>
        <h4 className='card-header'>Link Accounts</h4>
        <div className='card-body pt-1 pb-0'>
          <p className='mt-1 mb-3'>You are signed in as <span className='font-weight-bold'>{this.props.session.user.email}</span>.</p>
          {
            Object.keys(this.props.linkedAccounts).map((provider, i) => {
              return <LinkAccount key={i} provider={provider} session={this.props.session} linked={this.props.linkedAccounts[provider]} />
            })
          }
          <Link href='/'>
            <button className='btn btn-block btn-primary' type='submit'>
                Back
            </button>
          </Link>
        </div>
      </div>
    )
  }
}

export class LinkAccount extends React.Component {
  render () {
    if (this.props.linked === true) {
      return (
        <form method='post' action={`/auth/oauth/${this.props.provider.toLowerCase()}/unlink`}>
          <input name='_csrf' type='hidden' value={this.props.session.csrfToken} />
          <button className='btn btn-block btn-outline-danger' type='submit'>
              Unlink from {this.props.provider}
          </button>
        </form>
      )
    } else {
      return (
        <p>
          <a className='btn btn-block btn-outline-primary' href={`/auth/oauth/${this.props.provider.toLowerCase()}`}>
            Link with {this.props.provider}
          </a>
        </p>
      )
    }
  }
}

export class SignInButtons extends React.Component {
  render () {
    return (
      <>
        {
          Object.keys(this.props.providers).map((provider, i) => {
            return (
              <IconButton
                block
                key={i}
                placement='left'
                appearance='primary'
                icon={<Icon icon='google' />}
                href={this.props.providers[provider].signin}
              >
                Login with Google
              </IconButton>
            )
          })
        }
      </>
    )
  }
}
