import 'dotenv/config'
import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

const database = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
}

const options = {
  site: process.env.SITE,
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  pages: {
    signin: '/auth/signin',
  },
  session: {
    jwt: true,
  },
  debug: false,
}

export default (req, res) => NextAuth(req, res, options)
