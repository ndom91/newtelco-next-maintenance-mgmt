const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const customercid = decodeURIComponent(req.query.customercid)
  const company = decodeURIComponent(req.query.company)
  const protection = decodeURIComponent(req.query.protection)
  const supplier = decodeURIComponent(req.query.supplier)
  const insertCustomerCidQuery = await db.query(escape`
    INSERT INTO kundenCID (kundenCID, lieferantCID, kunde, protected) VALUES (${customercid}, ${supplier}, ${company}, ${protection})
  `)
  res.status(200).json({ insertCustomerCidQuery })
}
