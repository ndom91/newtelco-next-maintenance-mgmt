const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.mid
  const rcounter = req.query.rcounter
  const user = req.query.user.substring(0, req.query.user.lastIndexOf('@'))
  const deleteRescheduleQuery = await db.query(escape`
    DELETE FROM reschedule WHERE maintenanceid = ${maintId} AND rcounter = ${rcounter}
  `)
  const updateHistory = await db.query(escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${user}, 'delete', 'reschedule - ${maintId}-${rcounter}');`)
  res.status(200).json({ deleteRescheduleQuery })
}
