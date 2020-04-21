const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const companyId = req.query.companyid
  const startDate = req.query.startDate
  const endDate = req.query.endDate
  const freezeQuery = await db.query(escape`
    SELECT * FROM freeze WHERE (${startDate} <= endDateTime AND ${endDate} >= startDateTime) AND freeze.companyId LIKE ${companyId}
  `)
  res.status(200).json({ freezeQuery })
}
