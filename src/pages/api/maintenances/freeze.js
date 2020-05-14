const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const companyId = req.body.companys
  const startDate = req.body.startDate
  const endDate = req.body.endDate
  const freezeQuery = await db.query(escape`
    SELECT * FROM freeze WHERE (${startDate} <= endDateTime AND ${endDate} >= startDateTime) AND freeze.companyId IN (${companyId})
  `)
  res.status(200).json({ freezeQuery })
}
