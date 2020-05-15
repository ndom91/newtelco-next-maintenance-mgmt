import 'dotenv/config'
import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import Adapters from 'next-auth/adapters'

const database = {
  type: 'sqlite',
  database: ':memory:',
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
}

export default (req, res) => NextAuth(req, res, options)