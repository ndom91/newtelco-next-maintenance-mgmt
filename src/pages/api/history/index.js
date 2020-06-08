const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.query.mid
  const action = req.query.action
  const field = req.query.field || ''
  const user = req.query.user.substring(0, req.query.user.lastIndexOf('@'))

  const updateHistory = await db.query(
    escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${user}, ${action}, ${field});`
  )
  res.status(200).json({ statusText: 'OK', status: 200 })
}
