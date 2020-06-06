const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.body.mid
  const newImpact = req.body.impact
  const newStartDateTime = req.body.sdt
  const newEndDateTime = req.body.edt
  const rid = req.body.rcounter
  const user = req.body.user.substring(0, req.body.user.lastIndexOf('@'))
  const editRescheduleQuery = await db.query(escape`
    UPDATE reschedule SET impact = ${newImpact}, sdt = ${newStartDateTime}, edt = ${newEndDateTime} WHERE maintenanceid = ${maintId} AND rcounter LIKE ${rid}
  `)
  const updateHistory = await db.query(
    escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${user}, 'edit', 'reschedule - ${rid}');`
  )
  res.status(200).json({ editRescheduleQuery })
}
