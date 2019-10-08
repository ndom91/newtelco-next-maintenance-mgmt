const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  // console.log('1', req)
  const cidIds = req.query.cid
  const maintId = req.query.maintId
  const cidIdsQuery = await db.query(escape`
    UPDATE maintenancedb SET derenCIDid = ${cidIds} WHERE id = ${maintId}
  `)
  if (cidIdsQuery.affectedRows >= 1) {
    res.status(200).json({ statusText: 'OK', status: 200 })
  } else {
    res.status(200).json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
