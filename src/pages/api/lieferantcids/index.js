const db = require("../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const lieferantId = req.query.id
  const lieferantCIDsResult = await db.query(`
    SELECT lieferantCID.id as value, lieferantCID.derenCID as label FROM lieferantCID WHERE lieferantCID.lieferant LIKE ${lieferantId}
  `)
  const count = await db.query(escape`
      SELECT COUNT(*)
      AS lieferantCIDCount
      FROM lieferantCID
      WHERE lieferantCID.lieferant LIKE ${lieferantId}
    `)
  const { lieferantCIDsCount } = count[0]
  res.status(200).json({ lieferantCIDsResult, lieferantCIDsCount })
}
