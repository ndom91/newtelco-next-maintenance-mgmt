import React from "react"
import {
  Container,
  Content,
  FlexboxGrid,
  ButtonGroup,
  Button,
  Panel,
  Col,
} from "rsuite"

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.error) {
      return (
        <Container>
          <Content>
            <FlexboxGrid
              justify="center"
              align="middle"
              style={{
                height: "70vh",
                flexDirection: "column",
                marginTop: "30px",
              }}
            >
              <FlexboxGrid.Item
                componentClass={Col}
                colspan={10}
                lg={12}
                md={14}
                sm={18}
                xs={20}
              >
                <Panel
                  header={
                    <h4 style={{ textAlign: "center" }}>
                      Newtelco Maintenance
                    </h4>
                  }
                  bordered
                  shaded
                  style={{ backgroundColor: "#fff", padding: "20px" }}
                >
                  <Container className="container-border">
                    <img
                      style={{ marginBottom: "50px" }}
                      width="500px"
                      src="/static/images/error.svg"
                      alt="error"
                    />
                    <h4 style={{ textAlign: "center", marginBottom: "10px" }}>
                      Oops — something&lsquo;s gone wrong.
                    </h4>
                    <p>
                      If you would like to provide us more information, please
                      select &lsquo;Report&lsquo; below.
                    </p>
                    <ButtonGroup
                      justified
                      style={{ marginTop: "20px", width: "100%" }}
                    >
                      <Button
                        componentClass="a"
                        href={`mailto:ndomino@newtelco.de?subject=${encodeURIComponent(
                          "Newtelco Maintenance - Error"
                        )}&body=${encodeURIComponent(
                          this.state.error
                        )}%0D%0A%0D%0A${encodeURIComponent(
                          JSON.stringify(this.state.errorInfo)
                        )}%0D%0A%0D%0AThanks`}
                      >
                        Report
                      </Button>
                      <Button
                        appearance="primary"
                        onClick={() => window.location.reload(true)}
                      >
                        Try Again
                      </Button>
                    </ButtonGroup>
                  </Container>
                </Panel>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Content>
        </Container>
      )
    } else {
      return this.props.children
    }
  }
}
