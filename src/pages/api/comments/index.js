const db = require("../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const maintId = req.query.m
  const comments = await db.query(escape`
      SELECT * FROM comments WHERE maintId LIKE ${maintId}
    `)
  res.status(200).json({ comments })
}
