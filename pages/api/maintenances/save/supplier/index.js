const db = require('../../../../../lib/db')

module.exports = async (req, res) => {
  const maintId = req.query.maintId
  const value = req.query.value
  const updatedBy = req.query.updatedby
  const cidIdsQuery = await db.query(`UPDATE maintenancedb SET lieferant = '${value}', updatedBy = '${updatedBy}' WHERE id = ${maintId}`)
  if (cidIdsQuery.affectedRows >= 1) {
    res.status(200).json({ statusText: 'OK', status: 200 })
  } else {
    res.status(200).json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
