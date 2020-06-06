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
    signout: '/auth/signout',
    // error: 'https://example.com/error'
  },
  secret: 'pdBV/+G4RPeeOfJlg800QA8My1AWbngPkehniml9tRY=',
  jwt: true,
  jwtSecret: 'euTOBIsBEbyML9QzV+XklZr4nfj5a+cqjHCSzadQdlQ=',
}

export default (req, res) => NextAuth(req, res, options)