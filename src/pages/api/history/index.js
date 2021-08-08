const db = require("../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const { mid: maintId, action, field = "", user } = req.query
  const username = user.substring(0, user.lastIndexOf("@"))

  await db.query(
    escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${username}, ${action}, ${field});`
  )
  res.status(200).json({ statusText: "OK", status: 200 })
}
