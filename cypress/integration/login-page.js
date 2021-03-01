describe('Login page', () => {
  before(() => {
    cy.log(`Visiting ${Cypress.env('NEXTAUTH_URL')}/auth/signin`)
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/auth/signin')
  })

  it('Should have logo', () => {
    cy.get('.rs-content img').should('have.length', 1)
  })

  it('Signin with Dummy Provider should exist', () => {
    cy.get('.signin-link').should('have.length', 2)
    cy.findByText('Sign in with Credentials').should('exist')
  })

  it('Signin with Dummy Provider', () => {
    cy.visit('/auth/signin')
    cy.findByText('Sign in with Credentials').click()

    // Check for Unread Count on Home Dashbaord
    cy.get('a.unread-count', { timeout: 30000 })
  })
})
