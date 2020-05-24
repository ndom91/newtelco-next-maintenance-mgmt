const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.body.mid
  const newImpact = req.body.impact
  const newStartDateTime = req.body.sdt
  const newEndDateTime = req.body.edt
  const rid = `${maintId}_${req.body.rcounter}`
  const user = req.body.user
  const reason = req.body.reason
  const insertRescheduleQuery = await db.query(escape`
    INSERT INTO reschedule (impact, sdt, edt, maintenanceid, rid, rcounter, reason, user) VALUES (${newImpact}, ${newStartDateTime}, ${newEndDateTime}, ${maintId}, ${rid}, ${req.body.rcounter}, ${reason}, ${user})
  `)
  const updateHistory = await db.query(escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${user}, 'create', 'reschedule - ${rid}');`)
  res.status(200).json({ insertRescheduleQuery })
}
