const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.mid
  const newImpact = decodeURIComponent(req.query.impact)
  const newStartDateTime = decodeURIComponent(req.query.sdt)
  const newEndDateTime = decodeURIComponent(req.query.edt)
  const rid = `${maintId}_${req.query.rcounter}`
  const user = decodeURIComponent(req.query.user)
  const reason = decodeURIComponent(req.query.reason)
  const insertRescheduleQuery = await db.query(escape`
    INSERT INTO reschedule (impact, sdt, edt, maintenanceid, rid, rcounter, reason, user) VALUES (${newImpact}, ${newStartDateTime}, ${newEndDateTime}, ${maintId}, ${rid}, ${req.query.rcounter}, ${reason}, ${user})
  `)
  const updateHistory = await db.query(escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${user}, 'create', 'reschedule - ${rid}');`)
  res.status(200).json({ insertRescheduleQuery })
}
