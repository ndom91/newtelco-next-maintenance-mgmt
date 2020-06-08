const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const commentId = req.body.id
  const comments = await db.query(escape`
      DELETE FROM comments WHERE id LIKE ${commentId}
    `)
  res.status(200).json({ comments })
}
