const db = require("../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const query = await db.query(escape`
    select count(maintenancedb.id) as value, maintenancedb.bearbeitetvon as person
    from maintenancedb
    where maintenancedb.active = 1 and maintenancedb.bearbeitetvon not like ''
    group by maintenancedb.bearbeitetvon
  `)
  res.status(200).json({ query })
}
