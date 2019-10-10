const db = require('../../../../../lib/db')

module.exports = async (req, res) => {
  const element = req.query.element
  const maintId = req.query.maintId
  const value = req.query.value
  const cidIdsQuery = await db.query(`UPDATE maintenancedb SET ${element} = '${value}' WHERE id = ${maintId}`)
  if (cidIdsQuery.affectedRows >= 1) {
    res.status(200).json({ statusText: 'OK', status: 200 })
  } else {
    res.status(200).json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
