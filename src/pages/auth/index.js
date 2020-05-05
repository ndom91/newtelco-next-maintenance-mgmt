import React, { useEffect } from 'react'
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

const App = ({ session, linkedAccounts, providers }) => {
  useEffect(() => {
    Fonts()
  }, [])

  if (session.user) {
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
                  session={session}
                  linkedAccounts={linkedAccounts}
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
                <SignInButtons providers={providers} />
              </Panel>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Content>
      </Container>
    )
  }
}

const LinkAccounts = ({ session, linkedAccounts }) => {
  return (
    <div className='card mt-4 mb-3'>
      <h4 className='card-header'>Link Accounts</h4>
      <div className='card-body pt-1 pb-0'>
        <p className='mt-1 mb-3'>You are signed in as <span className='font-weight-bold'>{session.user.email}</span>.</p>
        {
          Object.keys(linkedAccounts).map((provider, i) => {
            return <LinkAccount key={i} provider={provider} session={session} linked={linkedAccounts[provider]} />
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

const LinkAccount = ({ linked, provider, session }) => {
  if (linked === true) {
    return (
      <form method='post' action={`/auth/oauth/${provider.toLowerCase()}/unlink`}>
        <input name='_csrf' type='hidden' value={session.csrfToken} />
        <button className='btn btn-block btn-outline-danger' type='submit'>
            Unlink from {provider}
        </button>
      </form>
    )
  } else {
    return (
      <p>
        <a className='btn btn-block btn-outline-primary' href={`/auth/oauth/${provider.toLowerCase()}`}>
          Link with {provider}
        </a>
      </p>
    )
  }
}

const SignInButtons = ({providers}) => {
  return (
    <>
      {
        Object.keys(providers).map((provider, i) => {
          return (
            <IconButton
              block
              key={i}
              placement='left'
              appearance='primary'
              icon={<Icon icon='google' />}
              href={providers[provider].signin}
            >
              Login with Google
            </IconButton>
          )
        })
      }
    </>
  )
}

App.getInitialProps = async ({ req }) => {
  return {
    session: await NextAuth.init({ req }),
    linkedAccounts: await NextAuth.linked({ req }),
    providers: await NextAuth.providers({ req })
  }
}

export default App