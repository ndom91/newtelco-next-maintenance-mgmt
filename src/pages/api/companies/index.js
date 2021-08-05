const db = require("../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  let page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 9
  if (page < 1) page = 1
  const companies = await db.query(escape`
      SELECT * FROM companies
    `)
  const count = await db.query(escape`
      SELECT COUNT(*)
      AS companiesCount
      FROM companies
    `)
  const { companiesCount } = count[0]
  const companyCount = Math.ceil(companiesCount / limit)
  res.status(200).json({ companies, companyCount, page })
}
