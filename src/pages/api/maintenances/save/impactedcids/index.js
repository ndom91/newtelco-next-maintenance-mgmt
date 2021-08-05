const db = require("../../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const cids = req.body.cids
  const maintId = req.body.maintId
  const updatedBy = req.body.updatedBy

  const affectedCIDsQuery = await db.query(
    escape`UPDATE maintenancedb SET betroffeneCIDs = ${cids}, updatedBy = ${updatedBy} WHERE id = ${maintId}`
  )
  if (affectedCIDsQuery.affectedRows >= 1) {
    res.status(200).json({ statusText: "OK", status: 200 })
  } else {
    res
      .status(200)
      .json({ statusText: "FAIL", status: 500, err: affectedCIDsQuery })
  }
}
