import React, { useEffect } from 'react'
import Link from 'next/link'
import Fonts from './fonts'
import {
  Container,
  FlexboxGrid,
  Panel,
  Content,
  Button,
  Col
} from 'rsuite'

const RequireLogin = () => {
  useEffect(() => {
    Fonts()
  }, [])

  return (
    <Container>
      <Content>
        <FlexboxGrid justify='center' align='middle' style={{ height: '70vh', flexDirection: 'column' }}>
          <FlexboxGrid.Item componentClass={Col} colspan={4} lg={6} md={8} sm={14} xs={18}>
            <Panel header='Sign in' bordered shaded style={{ backgroundColor: '#fff'  }}>
              <p style={{ margin: '20px' }}>
                  You must be signed-in to view this content.
              </p>
              <p>
                <Link href='/api/auth/signin'>
                  <Button id='signin-btn' type='submit' appearance='primary' block>Sign in</Button>
                </Link>
              </p>
            </Panel>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Content>
    </Container>
  )
}

export default RequireLogin

