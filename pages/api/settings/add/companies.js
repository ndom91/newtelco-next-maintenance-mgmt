const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const companyName = req.query.name
  const companyDomain = req.query.domain
  const companyRecipient = req.query.recipient
  const lieferantCIDsResult = await db.query(escape`
    SELECT lieferantCID.id as value, lieferantCID.derenCID as label FROM lieferantCID WHERE lieferantCID.lieferant LIKE ${lieferantId}
  `)
  res.status(200).json({ lieferantCIDsResult, lieferantCIDsCount })
}
