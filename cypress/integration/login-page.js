import { GoogleSocialLogin } from 'cypress-social-logins'

module.exports = (on, config) => {
  on('task', {
    GoogleSocialLogin: GoogleSocialLogin,
  })
}

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

describe('Login', () => {
  it('Login through Google', () => {
    const username = Cypress.env('device@newtelco.de')
    const password = Cypress.env('N3wt3lco')
    const loginUrl = Cypress.env('loginUrl')
    const cookieName = Cypress.env('cookieName')
    const socialLoginOptions = {
      username,
      password,
      loginUrl,
      headless: true,
      logs: false,
      loginSelector: '.signin-link',
      postLoginSelector: '.rs-panel',
    }

    return cy
      .task('GoogleSocialLogin', socialLoginOptions)
      .then(({ cookies }) => {
        cy.clearCookies()

        const cookie = cookies
          .filter(cookie => cookie.name === cookieName)
          .pop()
        if (cookie) {
          cy.setCookie(cookie.name, cookie.value, {
            domain: cookie.domain,
            expiry: cookie.expires,
            httpOnly: cookie.httpOnly,
            path: cookie.path,
            secure: cookie.secure,
          })

          Cypress.Cookies.defaults({
            whitelist: cookieName,
          })
        }
      })
  })
})
