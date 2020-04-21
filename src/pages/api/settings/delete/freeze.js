const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const freezeId = req.query.id
  const deleteFreezeQuery = await db.query(escape`
    DELETE FROM freeze WHERE id = ${freezeId}
  `)
  res.status(200).json({ deleteFreezeQuery })
}
