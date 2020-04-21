const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  let page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 9
  if (page < 1) page = 1

  const freezeQuery = await db.query(escape`
      SELECT freeze.id, freeze.companyId, freeze.startDateTime, freeze.endDateTime, companies.name, freeze.notes FROM freeze LEFT JOIN companies ON freeze.companyId = companies.id ORDER BY companies.name ASC
    `)
  const count = await db.query(escape`
      SELECT COUNT(*)
      AS freezecounter
      FROM freeze
    `)
  const { freezeCount } = count[0]
  const freezesCount = Math.ceil(freezeCount / limit)
  res.status(200).json({ freezeQuery, freezesCount, page })
}
