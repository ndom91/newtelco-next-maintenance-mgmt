const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.mid
  const newImpact = decodeURIComponent(req.query.impact)
  const newStartDateTime = decodeURIComponent(req.query.sdt)
  const newEndDateTime = decodeURIComponent(req.query.edt)
  const rid = `${maintId}_${req.query.rcounter}`
  const user = decodeURIComponent(req.query.user)
  const insertRescheduleQuery = await db.query(escape`
    INSERT INTO reschedule (impact, sdt, edt, maintenanceid, rid, rcounter, user) VALUES (${newImpact}, ${newStartDateTime}, ${newEndDateTime}, ${maintId}, ${rid}, ${req.query.rcounter}, ${user})
  `)
  res.status(200).json({ insertRescheduleQuery })
}
