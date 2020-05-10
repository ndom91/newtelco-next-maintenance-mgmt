import React from 'react'
import Link from 'next/link'
import Fonts from '../../components/fonts'
import {
  Container,
  FlexboxGrid,
  Panel,
  Content,
  IconButton,
  Icon
} from 'rsuite'

export default class extends React.Component {
  static async getInitialProps ({ query }) {
    return {
      action: query.action || null,
      type: query.type || null,
      service: query.service || null
    }
  }

  render () {
    if (this.props.action === 'signin' && this.props.type === 'oauth') {
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
                  <div className='col-sm-10 mr-auto ml-auto mb-5'>
                    <p className='lead'>An account associated with your email address already exists.</p>
                    <Link href='/auth'>
                      <button className='btn btn-block btn-outline-primary col-sm-8 mb-4 ml-auto mr-auto'>
                        Sign in with email or another service
                      </button>
                    </Link>
                    <div className='text-muted'>
                      <h4 className='mb-2'>Why am I seeing this?</h4>
                      <p className='mb-3'>
                        It looks like you might have already signed up using another service to sign in.
                      </p>
                      <p className='mb-3'>
                        If you have previously signed up using another service you must link accounts before you
                        can use a different service to sign in.
                      </p>
                      <p className='mb-5'>
                        This is to prevent people from signing up to another service using your email address
                        to try and access your account.
                      </p>
                      <h4 className='mb-2'>How do I fix this?</h4>
                      <p className='mb-0'>
                        First sign in using your email address then link your account to the service you want
                        to use to sign in with in future. You only need to do this once.
                      </p>
                    </div>
                  </div>
                </Panel>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Content>
        </Container>
      )
    } else if (this.props.action === 'signin' && this.props.type === 'token-invalid') {
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
                  <h1 className='display-4 mt-5 mb-2'>Link not valid</h1>
                  <p className='lead'>This sign in link is no longer valid.</p>
                  <p className='lead'><Link href='/auth'><a>Get a new sign in link</a></Link></p>
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
                <FlexboxGrid.Item colspan={20} style={{ maxWidth: '350px' }}>
                  <img src='/static/images/nt-black.png' alt='Newtelco Maintenance' width='100%' />
                </FlexboxGrid.Item>
              </FlexboxGrid>
              <FlexboxGrid.Item componentClass={Panel} colspan={8} md={10} sm={18}>
                <Panel header='Sign in' bordered shaded style={{ backgroundColor: '#fff'  }}>
                  <h1 className='display-4 mt-5'>Error signing in</h1>
                  <p className='lead'>An error occured while trying to sign in.</p>
                  <p className='lead'><Link href='/auth'><a>Sign in with email or another service</a></Link></p>
                </Panel>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Content>
        </Container>
      )
    }
  }
}
