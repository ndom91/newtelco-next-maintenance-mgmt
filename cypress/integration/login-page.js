module.exports = (on, config) => {
  on('task', {
    GoogleSocialLogin: GoogleSocialLogin,
  })
}

describe('Login page', () => {
  /*
   * Visits the page before each test
   */
  before(() => {
    cy.log(`Visiting https://maint.newtelco.dev`)
    cy.clearCookies()
    cy.clearLocalStorage()
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
    const username = Cypress.env('GOOGLE_USER')
    const password = Cypress.env('GOOGLE_PW')
    const loginUrl = Cypress.env('SITE_NAME')
    const cookieName = Cypress.env('COOKIE_NAME')
    const socialLoginOptions = {
      username,
      password,
      loginUrl,
      headless: true,
      logs: true,
      isPopup: true,
      loginSelector: `a[href="${Cypress.env(
        'SITE_NAME'
      )}/api/auth/signin/google"]`,
      postLoginSelector: '.unread-count',
      getAllBrowserCookies: true,
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
          cy.visit('/api/auth/signout')
          cy.get('form').submit()
          cy.clearCookies()
          cy.clearLocalStorage()
        }
      })
  })
})
