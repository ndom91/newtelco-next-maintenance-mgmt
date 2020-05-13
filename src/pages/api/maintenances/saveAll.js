const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.body.id
  const values = req.body.values
  // const save = await db.query(escape`
  //   UPDATE maintenancedb SET () VALUES () WHERE id LIKE ${maintId}
  // `)
  // res.status(200).json({ save })
  res.status(200).json({ maintId, values })
}
