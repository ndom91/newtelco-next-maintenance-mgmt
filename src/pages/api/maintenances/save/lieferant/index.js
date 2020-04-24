const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const cidIds = req.query.cid
  const maintId = req.query.maintId
  const updatedBy = req.query.updatedby
  const cidIdsQuery = await db.query(escape`
    UPDATE maintenancedb SET derenCIDid = ${cidIds}, updatedBy = ${updatedBy} WHERE id = ${maintId}
  `)
  if (cidIdsQuery.affectedRows >= 1) {
    const updateHistory = await db.query(escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${updatedBy}, 'changed', 'supplier cid');`)
    res.status(200).json({ statusText: 'OK', status: 200 })
  } else {
    res.status(200).json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
