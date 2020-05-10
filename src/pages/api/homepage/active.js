const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const query = await db.query(escape`
    select maintenancedb.*, maintenancedb.id as maintId, companies.*
    from maintenancedb
    left join companies on maintenancedb.lieferant = companies.id
    where NOW() between startDateTime and endDateTime
  `)
  res.status(200).json({ query })
}
