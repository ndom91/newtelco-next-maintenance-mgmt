import React, { useEffect } from 'react'
import Fonts from '@/newtelco/fonts'
import {
  Container,
  FlexboxGrid,
  Panel,
  Content,
  Button,
  Col
} from 'rsuite'

const SignIn = ({ providers }) => {
  useEffect(() => {
    Fonts()
  }, [])

  console.log(providers, Object.values(providers))
  return (
    <Container>
      <Content>
        <FlexboxGrid justify='center' align='middle' style={{ height: '70vh', flexDirection: 'column' }}>
          <FlexboxGrid.Item componentClass={Col} colspan={4} lg={6} md={8} sm={14} xs={18}>
            <Panel header='Newtelco Maintenance' bordered shaded style={{ backgroundColor: '#fff' }}>
              {providers && Object.values(providers).map(provider => (
                <p key={provider.name}>
                  <a href={provider.signinUrl}>
                    <Button id='signin-btn' type='submit' appearance='primary' block>Sign in with {provider.name}</Button>
                  </a>
                </p>
              ))}
            </Panel>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Content>
    </Container>
  )
}

export default SignIn

export async function getServerSideProps ({ req }) {
  const host = req ? req.headers['x-forwarded-host'] : window.location.hostname
  let protocol = 'https:'
  if (host.indexOf('localhost') > -1) {
    protocol = 'http:'
  }
  const pageRequest = `${protocol}//${host}/api/auth/providers`
  const res = await fetch(pageRequest, {
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  })
  const providers = await res.json()

  return {
    props: {
      providers
    }
  }
}
