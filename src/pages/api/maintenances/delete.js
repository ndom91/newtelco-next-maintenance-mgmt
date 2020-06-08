const db = require('../../../lib/db')

module.exports = async (req, res) => {
  const maintId = req.query.maintId
  const maintDelQuery = await db.query(
    `UPDATE maintenancedb SET active = 0 WHERE id = ${maintId}`
  )
  if (maintDelQuery.affectedRows >= 1) {
    res.status(200).json({ statusText: 'OK', status: 200 })
  } else {
    res
      .status(200)
      .json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
