import getConfig from 'next/config'
const mysql = require('serverless-mysql')

const { publicRuntimeConfig } = getConfig()
console.log(publicRuntimeConfig, process.env)
const db = mysql({
  config: {
    host: publicRuntimeConfig.MYSQL_HOST || process.env.MYSQL_HOST,
    database: publicRuntimeConfig.MYSQL_DATABASE || process.env.MYSQL_DATABASE,
    user: publicRuntimeConfig.MYSQL_USER || process.env.MYSQL_USER,
    password: publicRuntimeConfig.MYSQL_PASSWORD || process.env.MYSQL_PASSWORD
  }
})

exports.query = async query => {
  try {
    const results = await db.query(query)
    await db.end()
    return results
  } catch (error) {
    return { error }
  }
}
