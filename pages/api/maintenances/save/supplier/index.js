const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.maintId
  const value = req.query.value
  const updatedBy = req.query.updatedby
  const cidIdsQuery = await db.query(`UPDATE maintenancedb SET lieferant = '${value}', updatedBy = '${updatedBy}' WHERE id = ${maintId}`)
  if (cidIdsQuery.affectedRows >= 1) {
    const updateHistory = await db.query(escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${updatedBy}, 'change', 'supplier');`)
    res.status(200).json({ statusText: 'OK', status: 200 })
  } else {
    res.status(200).json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
