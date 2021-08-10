const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const companyId = req.query.id
  const deleteCompanyQuery = await db.query(escape`
    DELETE FROM companies WHERE id = ${companyId}
  `)
  res.status(200).json({ deleteCompanyQuery })
}
