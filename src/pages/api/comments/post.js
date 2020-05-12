const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const body = req.body.body
  const user = req.body.user
  const maintId = req.body.maintId
  const comments = await db.query(escape`
      INSERT INTO comments (maintId, body, user) VALUES (${maintId}, ${body}, ${user})
    `)
  res.status(200).json({ comments })
}
