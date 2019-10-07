const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const person = req.query.person
  const weekCountResults = await db.query(escape`
    select count(*) as value,
          str_to_date(concat(yearweek(maileingang), ' monday'), '%X%V %W') as \`argument\`
    from maintenancedb 
    where bearbeitetvon like ${person}
    group by yearweek(maileingang)  
    ORDER BY \`argument\` DESC
    LIMIT 5
  `)
  const count = await db.query(escape`
    select count(*) as maints
    from maintenancedb 
    where bearbeitetvon like ${person}
    `)
  const totalCount = count[0]
  res.status(200).json({ weekCountResults, totalCount })
}
