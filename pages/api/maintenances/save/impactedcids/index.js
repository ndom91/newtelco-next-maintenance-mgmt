
const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const cids = req.query.cids
  const maintId = req.query.maintId

  const affectedCIDsQuery = await db.query(escape`UPDATE maintenancedb SET betroffeneCIDs = ${cids} WHERE id = ${maintId}`)

  if (affectedCIDsQuery.affectedRows >= 1) {
    res.status(200).json({ statusText: 'OK', status: 200 })
  } else {
    res.status(200).json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
