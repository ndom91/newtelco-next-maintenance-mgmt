const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const companies = await db.query(`
    SELECT companies.id as value, companies.name as label FROM companies
  `)
  res.status(200).json({ companies })
}
