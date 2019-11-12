const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const supplier = decodeURIComponent(req.query.company)
  const supplierCid = decodeURIComponent(req.query.cid)
  const insertSupplierCidQuery = await db.query(escape`
    INSERT INTO lieferantCID (lieferant, derenCID) VALUES (${supplier}, ${supplierCid})
  `)
  res.status(200).json({ insertSupplierCidQuery })
}
