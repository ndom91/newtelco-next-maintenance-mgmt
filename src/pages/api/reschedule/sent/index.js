const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.mid
  const rcounter = req.query.rcounter
  const sent = req.query.sent
  const user = req.query.user.substring(0, req.query.user.lastIndexOf('@'))
  const editRescheduleQuery = await db.query(escape`
    UPDATE reschedule SET sent = ${sent} WHERE maintenanceid = ${maintId} AND rcounter LIKE ${rcounter}
  `)
  const updateHistory = await db.query(escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${user}, 'sent', 'reschedule - ${maintId}-${rcounter}');`)
  res.status(200).json({ editRescheduleQuery })
}
