import 'dotenv/config'
import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import Adapters from 'next-auth/adapters'

const database = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true
}

const options = {
  site: process.env.SITE,
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    })
  ],
  adapter: Adapters.Default(database),
  pages: {
    signin: '/auth/signin',
    // signout: 'https://example.com/signout',
    // checkEmail: 'https://example.com/check-email',
    // error: 'https://example.com/error'
  }
}

export default (req, res) => NextAuth(req, res, options)