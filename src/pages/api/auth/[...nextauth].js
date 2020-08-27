import 'dotenv/config'
import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

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
  secret: 'tfS86sjmpEqrNuEvbYaC3rQ6bREfoVOOw2u9NmdXUjiEOPE9lmTm8lPiw6disNnY',
  session: {
    jwt: true,
  },
  jwt: {
    secret: 'aLjPYy0Xk3YJn5AGmyv9gcSYJa60nKP5Qf86i9oPpckiMTCksHNrNaCodjLauB8T',
  },
  debug: false,
}

export default (req, res) => NextAuth(req, res, options)
