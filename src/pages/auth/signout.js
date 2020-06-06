import React, { useEffect } from 'react'
import NextAuth, { csrfToken } from 'next-auth/client'
import Fonts from '@/newtelco/fonts'
import { Container, FlexboxGrid, Panel, Content, Button, Col } from 'rsuite'
import './signin.css'

const SignOut = ({ providers }) => {
  useEffect(() => {
    Fonts()
  }, [])
  const [session, loading] = NextAuth.useSession()

  return (
    <Container>
      <Content>
        <FlexboxGrid
          justify='center'
          align='middle'
          style={{ height: '70vh', flexDirection: 'column' }}
        >
          <FlexboxGrid.Item
            componentClass={Col}
            colspan={4}
            lg={6}
            md={8}
            sm={14}
            xs={18}
          >
            <div style={{ marginBottom: '40px' }}>
              <img style={{ width: '70%', margin: '0 auto' }} src='/static/images/nt-black.png' alt='Newtelco Logo' />
            </div>
            <Panel
              header='Network Maintenance'
              bordered
              shaded
              style={{ backgroundColor: '#fff' }}
            >
              <form action='/api/auth/signout' method='POST'>
                <input type='hidden' name='csrfToken' value={csrfToken} />
                <Button
                  id='signin-btn'
                  type='submit'
                  appearance='primary'
                  block
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Signout
                </Button>
              </form>
            </Panel>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Content>
    </Container>
  )
}

export default SignOut
