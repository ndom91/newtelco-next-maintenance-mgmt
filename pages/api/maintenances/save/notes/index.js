
const db = require('../../../../../lib/db')

module.exports = async (req, res) => {
  const maintId = req.query.maintId
  const value = req.query.value
  const cidIdsQuery = await db.query(`UPDATE maintenancedb SET notes = '${value}' WHERE id = ${maintId}`)
  console.log(cidIdsQuery)
  if (cidIdsQuery.affectedRows >= 1) {
    res.status(200).json({ statusText: 'OK', status: 200 })
  } else {
    res.status(200).json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
