const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const {
    mid: maintId,
    impact: newImpact,
    sdt: newStartDateTime,
    edt: newEndDateTime,
    user,
    rcounter,
    reason,
  } = req.body
  const rid = `${maintId}_${rcounter}`

  const insertRescheduleQuery = await db.query(escape`
    INSERT INTO reschedule (impact, sdt, edt, maintenanceid, rid, rcounter, reason, user) VALUES (${newImpact}, ${newStartDateTime}, ${newEndDateTime}, ${maintId}, ${rid}, ${req.body.rcounter}, ${reason}, ${user})
  `)
  await db.query(
    escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${user}, 'create', 'reschedule - ${rid}');`
  )
  res.status(200).json({ insertRescheduleQuery })
}
