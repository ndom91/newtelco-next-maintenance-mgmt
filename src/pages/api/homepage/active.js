const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const query = await db.query(escape`
    select distinct maintenancedb.*, maintenancedb.id as maintId, companies.*
    from maintenancedb
    left join companies on maintenancedb.lieferant = companies.id
    where DATE(NOW()) like DATE(startDateTime) 
    or NOW() between startDateTime and endDateTime
    and maintenancedb.cancelled not like 1
  `)
  res.status(200).json({ query })
}
