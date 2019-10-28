const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.mid
  const rcounter = req.query.rcounter
  const sent = req.query.sent
  const editRescheduleQuery = await db.query(escape`
    UPDATE reschedule SET sent = ${sent} WHERE maintenanceid = ${maintId} AND rcounter LIKE ${rcounter}
  `)
  res.status(200).json({ editRescheduleQuery })
}
