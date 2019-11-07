const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.mid
  const newImpact = decodeURIComponent(req.query.impact)
  const newStartDateTime = decodeURIComponent(req.query.sdt)
  const newEndDateTime = decodeURIComponent(req.query.edt)
  const rid = req.query.rcounter
  const user = req.query.user.substring(0, req.query.user.lastIndexOf('@'))
  const editRescheduleQuery = await db.query(escape`
    UPDATE reschedule SET impact = ${newImpact}, sdt = ${newStartDateTime}, edt = ${newEndDateTime} WHERE maintenanceid = ${maintId} AND rcounter LIKE ${rid}
  `)
  const updateHistory = await db.query(escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${user}, 'edit', 'reschedule - ${rid}');`)
  res.status(200).json({ editRescheduleQuery })
}
