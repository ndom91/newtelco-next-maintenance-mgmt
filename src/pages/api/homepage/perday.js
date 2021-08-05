const db = require("../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const days = req.query.d || 31
  const query = await db.query(escape`
    select DAY(maintenancedb.maileingang) as 'day', maintenancedb.maileingang, count(maintenancedb.id) as 'count'
    from maintenancedb
    WHERE maintenancedb.maileingang BETWEEN DATE(CURDATE()) - INTERVAL ${days} DAY AND DATE(CURDATE())
    AND maintenancedb.active = 1
    group by DAY(maintenancedb.maileingang)
  `)
  res.status(200).json({ query })
}
