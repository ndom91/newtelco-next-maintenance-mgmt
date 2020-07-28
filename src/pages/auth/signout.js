import React, { useEffect } from 'react'
import NextAuth, { csrfToken } from 'next-auth/client'
import { Container, FlexboxGrid, Panel, Content, Button, Col } from 'rsuite'
import './signin.css'

if (typeof window !== 'undefined') {
  const WebFontLoader = require('webfontloader')
  WebFontLoader.load({
    google: {
      families: ['Fira Sans:200,400', 'Chivo:300,400,700'],
    },
  })
}

const SignOut = ({ providers }) => {
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
              <img
                style={{ width: '70%', margin: '0 auto' }}
                src='/static/images/nt-black.png'
                alt='Newtelco Logo'
              />
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
                    justifyContent: 'center',
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
