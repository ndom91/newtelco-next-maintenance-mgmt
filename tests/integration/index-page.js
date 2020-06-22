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
	it('should have Google Login Method', () => {
		cy.get('#signin-btn').should('have.length', 1)
	})
	it('displays the configured provider sign in buttons', () => {
		cy.findByRole('button', { name: `Sign in with Google` }).should(
			'be.visible'
		)
	})
  it("Signing in with Google", () => {
    cy.findByRole("link", { name: "Sign in with Google" }).click();

    cy.location().should((loc) => {
      expect(loc.hostname).to.eq("https://accounts.google.com");
      expect(loc.pathname).to.eq("/signin/oauth/oauthchooseaccount");
    });
  });
})
