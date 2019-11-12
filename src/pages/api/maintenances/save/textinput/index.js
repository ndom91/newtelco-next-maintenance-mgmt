const db = require('../../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const element = req.query.element
  const maintId = req.query.maintId
  const value = req.query.value
  const updatedBy = req.query.updatedby
  const cidIdsQuery = await db.query(escape`UPDATE maintenancedb SET ${element} = ${value}, updatedBy = ${updatedBy} WHERE id = ${maintId}`)
  if (cidIdsQuery.affectedRows >= 1) {
    const updateHistory = await db.query(escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${updatedBy}, 'changed', ${element});`)
    res.status(200).json({ statusText: 'OK', status: 200 })
  } else {
    res.status(200).json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
