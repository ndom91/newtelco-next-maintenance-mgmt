const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const supplierCidId = req.query.id
  const deleteSupplierCidQuery = await db.query(escape`
    DELETE FROM lieferantCID WHERE id = ${supplierCidId}
  `)
  res.status(200).json({ deleteSupplierCidQuery })
}
