const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const query = await db.query(escape`
    select WEEK(maintenancedb.maileingang) as 'week', YEAR(maintenancedb.maileingang) as 'year',  maintenancedb.bearbeitetvon as 'user', count(maintenancedb.id) as 'count', DATE(maintenancedb.maileingang) as 'date'
      from maintenancedb
      where maintenancedb.maileingang BETWEEN CURDATE() - INTERVAL 6 MONTH AND CURDATE()
      and maintenancedb.active = 1
      group by maintenancedb.bearbeitetvon, WEEK(maintenancedb.maileingang)
  `)
  res.status(200).json({ query })
}
