
const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const cids = req.query.cids
  const maintId = req.query.maintId
  const updatedBy = req.query.updatedby

  const affectedCIDsQuery = await db.query(escape`UPDATE maintenancedb SET betroffeneCIDs = ${cids}, updatedBy = ${updatedBy} WHERE id = ${maintId}`)
  console.log(affectedCIDsQuery)
  if (affectedCIDsQuery.affectedRows >= 1) {
    res.status(200).json({ statusText: 'OK', status: 200 })
  } else {
    res.status(200).json({ statusText: 'FAIL', status: 500, err: affectedCIDsQuery })
  }
}
