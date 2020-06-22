describe('Login page', () => {
  /*
   * Visits the page before each test
   */
  beforeEach(() => {
    cy.log(`Visiting https://maint.newtelco.dev`)
    cy.visit('/')
  })
  it('should have a logo', () => {
    cy.get('.rs-content img').should('have.length', 1)
  })
  it('Signin with Google Button', () => {
    cy.get('#signin-btn').should('have.length', 1)
    cy.findByText('Sign in with Google').should('exist')
    cy.get('.signin-link').should(
      'have.attr',
      'href',
      'https://maint.newtelco.dev/api/auth/signin/google'
    )
  })
})
