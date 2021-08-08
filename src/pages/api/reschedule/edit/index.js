const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const {
    mid: maintId,
    impact: newImpact,
    sdt: newStartDateTime,
    edt: newEndDateTime,
    rcounter: rid,
    user,
  } = req.body
  const username = user.substring(0, user.lastIndexOf("@"))
  const editRescheduleQuery = await db.query(escape`
    UPDATE reschedule SET impact = ${newImpact}, sdt = ${newStartDateTime}, edt = ${newEndDateTime} WHERE maintenanceid = ${maintId} AND rcounter LIKE ${rid}
  `)
  await db.query(
    escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${username}, 'edit', 'reschedule - ${rid}');`
  )
  res.status(200).json({ editRescheduleQuery })
}
