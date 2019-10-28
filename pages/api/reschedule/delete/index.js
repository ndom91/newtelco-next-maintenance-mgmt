const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const companyId = req.query.mid
  const rcounter = req.query.rcounter
  const deleteRescheduleQuery = await db.query(escape`
    DELETE FROM reschedule WHERE maintenanceid = ${companyId} AND rcounter = ${rcounter}
  `)
  res.status(200).json({ deleteRescheduleQuery })
}
