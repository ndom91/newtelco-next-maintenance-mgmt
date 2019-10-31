const next = require('next')
// const { join } = require('path')
const nextAuth = require('next-auth')
const nextAuthConfig = require('./next-auth.config')

require('dotenv').config({ path: './.env' })

const nextApp = next({
  dir: '.',
  dev: (process.env.NODE_ENV === 'development')
})
// const handle = nextApp.getRequestHandler()

nextApp.prepare()
  .then(async () => {
    const nextAuthOptions = await nextAuthConfig()
    const nextAuthApp = await nextAuth(nextApp, nextAuthOptions)
    // nextApp.get('*', (req, res) => {
    //   console.log(req)
    //   if (req.url.includes('/sw')) {
    //     const filePath = join(__dirname, 'static', 'workbox', 'sw.js')
    //     nextApp.serveStatic(req, res, filePath)
    //   } else if (req.url.startsWith('static/workbox/')) {
    //     nextApp.serveStatic(req, res, join(__dirname, req.url))
    //   } else {
    //     handle(req, res, req.url)
    //   }
    // })
    console.log(`Ready on http://localhost:${process.env.PORT || 3000}`)
  })
  .catch(err => {
    console.log('An error occurred, unable to start the server')
    console.log(err)
  })
