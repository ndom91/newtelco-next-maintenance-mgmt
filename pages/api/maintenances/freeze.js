
const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const companyId = req.query.companyid
  const freezeQuery = await db.query(escape`
    SELECT * FROM freeze WHERE NOW() BETWEEN startDateTime AND endDateTime AND freeze.companyId LIKE ${companyId}
  `)
  res.status(200).json({ freezeQuery })
}
