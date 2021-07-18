import React from 'react'
import { IconButton, Col, Container, Content, FlexboxGrid, Panel } from 'rsuite'
import Link from 'next/link'

const Maintenance404 = () => {
  return (
    <Container>
      <Content>
        <FlexboxGrid
          justify="center"
          align="middle"
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
                src="/static/images/nt-black.png"
                alt="Newtelco Logo"
              />
            </div>
            <Panel
              header="Page Not Found"
              bordered
              shaded
              style={{ backgroundColor: '#fff' }}
            >
              <p style={{ marginBottom: '25px' }}>
                Sorry, we could not find the page you were looking for. Please
                use the bottom below to return home.
              </p>
              <Link href={{ pathname: '/' }} as={'/'} passHref>
                <IconButton
                  size="md"
                  block
                  appearance="subtle"
                  style={{
                    paddingLeft: '12px',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      height="18"
                      width="18"
                      viewBox="0 0 24 24"
                      stroke="var(--primary)"
                      style={{ marginRight: '10px' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  }
                >
                  Go Back Home
                </IconButton>
              </Link>
            </Panel>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Content>
    </Container>
  )
}

export default Maintenance404
