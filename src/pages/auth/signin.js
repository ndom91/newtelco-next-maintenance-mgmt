import Router from "next/router"
import { getSession, providers, signin } from "next-auth/client"
import { Container, FlexboxGrid, Panel, Content, Button, Col } from "rsuite"
import "./signin.css"

const SignIn = ({ providers, session }) => {
  if (typeof window !== "undefined" && session) {
    Router.push("/")
  }
  return (
    <Container>
      <Content>
        <FlexboxGrid
          justify="center"
          align="middle"
          style={{ height: "70vh", flexDirection: "column" }}
        >
          <FlexboxGrid.Item
            componentClass={Col}
            colspan={4}
            lg={6}
            md={8}
            sm={14}
            xs={18}
          >
            <div style={{ marginBottom: "40px" }}>
              <img
                style={{ width: "70%", margin: "0 auto" }}
                src="/static/images/nt-black.png"
                alt="Newtelco Logo"
              />
            </div>
            <Panel
              header="Network Maintenance"
              bordered
              shaded
              style={{ backgroundColor: "#fff" }}
            >
              {providers &&
                Object.values(providers)
                  .filter((provider) => provider.id === "google")
                  .map((provider) => (
                    <p key={provider.name}>
                      <a
                        href={provider.signinUrl}
                        id="signin-link"
                        onClick={(e) => e.preventDefault()}
                        className="signin-link"
                      >
                        <Button
                          id="signin-btn"
                          type="submit"
                          appearance="primary"
                          onClick={() => signin(provider.id)}
                          block
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 256 262"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="xMidYMid"
                            style={{ marginRight: "15px" }}
                          >
                            <defs>
                              <filter id="grayscale">
                                <feColorMatrix
                                  type="matrix"
                                  values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"
                                />
                              </filter>
                            </defs>
                            <path
                              d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                              fill="#fff"
                            />
                            <path
                              d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                              fill="#fff"
                            />
                            <path
                              d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                              fill="#fff"
                            />
                            <path
                              d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                              fill="#fff"
                            />
                          </svg>
                          Sign in with {provider.name}
                        </Button>
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

export async function getServerSideProps(ctx) {
  return {
    props: {
      providers: await providers(ctx),
      session: await getSession(ctx),
    },
  }
}
