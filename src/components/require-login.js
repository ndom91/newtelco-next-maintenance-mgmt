import { useEffect } from "react"
import Link from "next/link"
import { Container, FlexboxGrid, Panel, Content, Button, Col } from "rsuite"
import "../pages/auth/signin.css"

if (typeof window !== "undefined") {
  const WebFontLoader = require("webfontloader")
  WebFontLoader.load({
    google: {
      families: ["Fira Sans:200,400", "Chivo:300,400,700"],
    },
  })
}

const RequireLogin = () => (
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
          <Panel
            header="Session"
            bordered
            shaded
            style={{ backgroundColor: "#fff" }}
          >
            <p style={{ margin: "20px" }}>
              You must be signed in to view this page.
            </p>
            <p>
              <Link href="/auth/signin">
                <a>
                  <Button
                    id="signin-btn"
                    type="submit"
                    appearance="primary"
                    block
                  >
                    Sign in
                  </Button>
                </a>
              </Link>
            </p>
          </Panel>
        </FlexboxGrid.Item>
      </FlexboxGrid>
    </Content>
  </Container>
)

export default RequireLogin
