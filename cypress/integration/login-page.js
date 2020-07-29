module.exports = (on, config) => {
	on('task', {
		GoogleSocialLogin: GoogleSocialLogin,
	})
}

describe('Login page', () => {
	before(() => {
		cy.log(`Visiting http://localhost:3000/auth/signin`)
		cy.clearCookies()
		cy.clearLocalStorage()
		cy.visit('/auth/signin')
	})
	console.log(Cypress.env('GOOGLE_USER'))
	console.log(Cypress.env('NEXTAUTH_URL'))
	it('Should have logo', () => {
		cy.get('.rs-content img').should('have.length', 1)
	})
	it('Signin with Google Button', () => {
		cy.get('#signin-btn').should('have.length', 1)
		cy.findByText('Sign in with Google').should('exist')
		cy.get('.signin-link').should(
			'have.attr',
			'href',
			`${Cypress.env('NEXTAUTH_URL')}/api/auth/signin/google`
		)
	})
	it('Login through Google', () => {
		const username = Cypress.env('GOOGLE_USER')
		const password = Cypress.env('GOOGLE_PW')
		const loginUrl = Cypress.env('NEXTAUTH_URL')
		const cookieName = Cypress.env('COOKIE_NAME')
		const socialLoginOptions = {
			username,
			password,
			loginUrl,
			headless: true,
			logs: true,
			isPopup: true,
			loginSelector: `a[href="${Cypress.env(
				'NEXTAUTH_URL'
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
