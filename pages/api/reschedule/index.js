const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.id
  const reschedules = await db.query(escape`
    SELECT reschedule.sdt as startDateTime, reschedule.edt as endDateTime, reschedule.impact, reschedule.rcounter, reschedule.reason, reschedule.sent FROM reschedule WHERE maintenanceid LIKE ${maintId}
    `)
  res.status(200).json({ reschedules })
}
