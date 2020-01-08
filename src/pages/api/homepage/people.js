const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const peopleQuery = await db.query(escape`
    select DISTINCT bearbeitetvon as name from maintenancedb where bearbeitetvon not like '' and active like 1;
  `)
  res.status(200).json({ peopleQuery })
}
