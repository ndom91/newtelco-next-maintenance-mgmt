const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const id = req.query.id
  const customercid = decodeURIComponent(req.query.customercid)
  const protection = decodeURIComponent(req.query.protected)
  const updateCustomerCidQuery = await db.query(escape`
    UPDATE kundenCID SET kundenCID = ${customercid}, protected = ${protection} WHERE id = ${id}
  `)
  res.status(200).json({ updateCustomerCidQuery })
}
