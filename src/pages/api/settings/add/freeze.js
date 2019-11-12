
const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const companyid = decodeURIComponent(req.query.companyid)
  const startdatetime = decodeURIComponent(req.query.startdatetime)
  const enddatetime = decodeURIComponent(req.query.enddatetime)
  const notes = decodeURIComponent(req.query.notes)
  const insertFreezeQuery = await db.query(escape`
    INSERT INTO freeze (companyId, startdatetime, enddatetime, notes) VALUES (${companyid}, ${startdatetime}, ${enddatetime}, ${notes})
  `)
  res.status(200).json({ insertFreezeQuery })
}
