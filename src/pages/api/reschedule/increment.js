const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.id
  const rescheduleInc = await db.query(escape`
    UPDATE maintenancedb SET rescheduled = rescheduled + 1 WHERE id LIKE ${maintId}
    `)
  res.status(200).json({ rescheduleInc })
}
