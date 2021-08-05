const db = require("../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const companiesDomains = await db.query(`
    SELECT companies.mailDomain as value, companies.name as label FROM companies
  `)
  const count = await db.query(escape`
      SELECT COUNT(*)
      AS companiesCount
      FROM companies
    `)
  const { companiesCount } = count[0]
  res.status(200).json({ companiesDomains, companiesCount })
}
