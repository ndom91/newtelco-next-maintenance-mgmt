const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.body.mid
  const rcounter = req.body.rcounter
  const user = req.body.user.substring(0, req.body.user.lastIndexOf('@'))
  const deleteRescheduleQuery = await db.query(escape`
    DELETE FROM reschedule WHERE maintenanceid = ${maintId} AND rcounter = ${rcounter}
  `)
  const updateHistory = await db.query(escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${user}, 'delete', 'reschedule - ${maintId}-${rcounter}');`)
  res.status(200).json({ deleteRescheduleQuery })
}
