const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const lieferantId = req.query.id
  const kundenCIDsResult = await db.query(escape`
    SELECT kundenCID.kundenCID, kundenCID.protected, companies.name, kundenCID.kunde, companies.maintenanceRecipient, kundenCID.lieferantCID FROM kundenCID LEFT JOIN companies ON kundenCID.kunde = companies.id LEFT JOIN lieferantCID ON lieferantCID.id = kundenCID.lieferantCID WHERE lieferantCID.id LIKE ${lieferantId}
  `)
  const count = await db.query(escape`
      SELECT COUNT(*)
      AS kundenCIDsCount
      FROM kundenCID
      WHERE kundenCID.lieferantCID LIKE ${lieferantId}
    `)
  const { kundenCIDsCount } = count[0]
  res.status(200).json({ kundenCIDsResult, kundenCIDsCount })
}
