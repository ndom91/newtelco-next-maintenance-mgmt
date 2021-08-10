const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const customerCidId = req.query.id
  const deleteCustomerCidQuery = await db.query(escape`
    DELETE FROM kundenCID WHERE id = ${customerCidId}
  `)
  res.status(200).json({ deleteCustomerCidQuery })
}
