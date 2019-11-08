const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.mid
  const calId = req.query.cid
  const updatedBy = req.query.updatedby

  const calIdUpdateQuery = await db.query(escape`
    UPDATE maintenancedb SET calendarId = ${calId} WHERE id = ${maintId}
  `)
  if (calIdUpdateQuery.affectedRows >= 1) {
    const updateHistory = await db.query(escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${updatedBy}, 'created', 'calendar entry');`)
    res.status(200).json({ statusText: 'OK', status: 200 })
  } else {
    res.status(200).json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
