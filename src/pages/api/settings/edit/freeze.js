const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const id = req.query.id
  const startDate = decodeURIComponent(req.query.startdate)
  const endDate = decodeURIComponent(req.query.enddate)
  const notes = decodeURIComponent(req.query.notes)
  const updateFreezeQuery = await db.query(escape`
    UPDATE freeze SET startDateTime = ${startDate}, endDateTime = ${endDate}, notes = ${notes} WHERE id = ${id}
  `)
  res.status(200).json({ updateFreezeQuery })
}
