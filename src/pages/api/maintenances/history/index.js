const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.mid
  const historyQuery = await db.query(escape`
    SELECT * FROM changelog WHERE mid LIKE ${maintId}
  `)
  res.status(200).json({ historyQuery })
}
