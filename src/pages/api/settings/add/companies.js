const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const companyName = decodeURIComponent(req.query.name)
  const companyDomain = decodeURIComponent(req.query.domain)
  const companyRecipient = decodeURIComponent(req.query.recipient)
  const insertCompanyQuery = await db.query(escape`
    INSERT INTO companies (name, mailDomain, maintenanceRecipient) VALUES (${companyName}, ${companyDomain}, ${companyRecipient})
  `)
  res.status(200).json({ insertCompanyQuery })
}
