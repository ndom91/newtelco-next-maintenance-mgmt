import React from 'react'
import Footer from './cardFooter'
import {
  Container,
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody
} from 'shards-react'

export default class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { error: null }
  }

  componentDidCatch (error, errorInfo) {
    this.setState({ error })
  }

  render () {
    if (this.state.error) {
      return (
        <Card className='error-card'>
          <CardHeader>
            Newtelco Maintenance
          </CardHeader>
          <CardBody>
            <Container className='container-border'>
              <img style={{ marginBottom: '50px' }} width='500px' src='/static/images/error.svg' alt='error' />
              <h4>Oops — something's gone wrong.</h4>
              <p>If you would like to provide us more information, please select 'Report' below.</p>
              <ButtonGroup style={{ width: '100%' }}>
                <Button outline theme='secondary' onClick={() => console.error('TODO')}>
                  Report
                </Button>
                <Button theme='primary' onClick={() => window.location.reload(true)}>
                  Try Again
                </Button>
              </ButtonGroup>
            </Container>
          </CardBody>
          <Footer />
          <style jsx>{`
            :global(body) {
              background: none !important;
            }
            :global(.card-header) {
              background: var(--light);
              text-align: center;
              font-size: 32px;
              font-family: Poppins, Helvetica;
              font-weight: 200;
            }
            :global(.card-footer) {
              background: var(--light);
            }
            :global(.card-body) {
              background: var(--white);
            }
            :global(.error-card) {
              max-width: 800px;
              margin: 0 auto;
              margin-top: 50px;
            }
            :global(.container-border) {
              display: flex;
              flex-direction: column;
              align-items: center;
              flex-wrap: nowrap;
              border: 1px solid var(--light);
              border-radius: 0.325rem;
              margin: 10px 0;
              padding: 1.5rem;

            }
          `}
          </style>
        </Card>
      )
    } else {
      // when there's not an error, render children untouched
      return this.props.children
    }
  }
}
