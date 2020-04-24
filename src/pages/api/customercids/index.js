const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  let page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 9
  if (page < 1) page = 1

  const customercids = await db.query(escape`
      SELECT kundenCID.id, kundenCID.kundenCID, kundenCID.protected, lieferantCID.derenCID, companies.name FROM kundenCID LEFT JOIN companies ON kundenCID.kunde = companies.id LEFT JOIN lieferantCID ON kundenCID.lieferantCID = lieferantCID.id ORDER BY companies.name ASC
    `)
  const count = await db.query(escape`
      SELECT COUNT(*)
      AS kundencidcounter
      FROM kundenCID
    `)
  const { cidsCount } = count[0]
  const cidCount = Math.ceil(cidsCount / limit)
  res.status(200).json({ customercids, cidCount, page })
}
