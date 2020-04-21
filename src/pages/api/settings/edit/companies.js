const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const id = req.query.id
  const companyName = decodeURIComponent(req.query.name)
  const companyDomain = decodeURIComponent(req.query.domain)
  const companyRecipient = decodeURIComponent(req.query.recipient)
  const updateCompanyQuery = await db.query(escape`
    UPDATE companies SET name = ${companyName}, mailDomain = ${companyDomain}, maintenanceRecipient = ${companyRecipient} WHERE id = ${id}
  `)
  res.status(200).json({ updateCompanyQuery })
}
