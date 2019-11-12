const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const lieferantCids = await db.query(`
    SELECT lieferantCID.id as value, lieferantCID.derenCID as label FROM lieferantCID
  `)
  const lieferantCidCount = await db.query(escape`
      SELECT COUNT(*)
      AS lieferantCidCount
      FROM lieferantCID
    `)
  const { lieferantCidsCount } = lieferantCidCount[0]
  res.status(200).json({ lieferantCids, lieferantCidsCount })
}
