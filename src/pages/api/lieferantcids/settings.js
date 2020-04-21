const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const lieferantCIDsResult = await db.query(`
    SELECT lieferantCID.id, companies.name, lieferantCID.derenCID  FROM lieferantCID LEFT JOIN companies ON lieferantCID.lieferant = companies.id ORDER BY companies.name ASC
  `)
  const count = await db.query(escape`
      SELECT COUNT(*)
      AS lieferantCIDCount
      FROM lieferantCID
    `)
  const { lieferantCIDsCount } = count[0]
  res.status(200).json({ lieferantCIDsResult, lieferantCIDsCount })
}
