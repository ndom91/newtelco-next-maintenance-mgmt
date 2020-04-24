const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const sqlstring = require('sqlstring')

module.exports = async (req, res) => {
  const element = req.query.element
  const maintId = req.query.maintId
  const value = req.query.value
  const updatedBy = req.query.updatedby
  const cidIdsQuery = await db.query(`UPDATE maintenancedb SET ${element} = ${sqlstring.escape(value)}, updatedBy = '${updatedBy}' WHERE id = '${maintId}'`)
  if (cidIdsQuery.affectedRows >= 1) {
    await db.query(escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${updatedBy}, 'changed', ${element});`)
    res.status(200).json({ statusText: 'OK', status: 200 })
  } else {
    res.status(200).json({ statusText: 'FAIL', status: 500, err: cidIdsQuery })
    // res.status(200).json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
