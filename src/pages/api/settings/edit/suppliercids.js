const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const id = req.query.id
  const supplierCid = decodeURIComponent(req.query.suppliercid)
  const updateSupplierCidQuery = await db.query(escape`
    UPDATE lieferantCID SET derenCID = ${supplierCid} WHERE id = ${id}
  `)
  res.status(200).json({ updateSupplierCidQuery })
}
