const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const { mid: maintId, rcounter, sent, user } = req.body
  const username = user.substring(0, user.lastIndexOf("@"))

  const editRescheduleQuery = await db.query(escape`
    UPDATE reschedule SET sent = ${sent} WHERE maintenanceid = ${maintId} AND rcounter LIKE ${rcounter}
  `)
  await db.query(
    escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${username}, 'sent', 'reschedule - ${maintId}-${rcounter}');`
  )
  res.status(200).json({ editRescheduleQuery })
}
