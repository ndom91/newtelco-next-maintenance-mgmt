const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.mid
  const newImpact = decodeURIComponent(req.query.impact)
  const newStartDateTime = decodeURIComponent(req.query.sdt)
  const newEndDateTime = decodeURIComponent(req.query.edt)
  const rid = req.query.rcounter
  const editRescheduleQuery = await db.query(escape`
    UPDATE reschedule SET impact = ${newImpact}, sdt = ${newStartDateTime}, edt = ${newEndDateTime} WHERE maintenanceid = ${maintId} AND rcounter LIKE ${rid}
  `)
  res.status(200).json({ editRescheduleQuery })
}
