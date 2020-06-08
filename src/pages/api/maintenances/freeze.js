const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const companyIds = req.body.companys
  const startDate = req.body.startDate
  const endDate = req.body.endDate
  const freezeQuery = await db.query(escape`
    SELECT companies.name, companies.id
    FROM freeze 
    LEFT JOIN companies ON freeze.companyId = companies.id
    WHERE (${startDate} <= endDateTime AND ${endDate} >= startDateTime) 
      AND freeze.companyId IN (${companyIds})
  `)
  res.status(200).json({ freezeQuery })
}
