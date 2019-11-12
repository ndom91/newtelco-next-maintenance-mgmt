const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const person = req.query.person
  const weekCountResults = await db.query(escape`
    select count(*) as yValue,
          str_to_date(concat(yearweek(maileingang), ' monday'), '%X%V %W') as \`xValue\`
    from maintenancedb 
    where bearbeitetvon like ${person} AND active LIKE '1' AND done LIKE '1'
    group by yearweek(maileingang)  
    ORDER BY \`xValue\` DESC
    LIMIT 10
  `)
  const count = await db.query(escape`
    select count(*) as maints
    from maintenancedb 
    where bearbeitetvon like ${person}
    `)
  const totalCount = count[0]
  res.status(200).json({ weekCountResults, totalCount })
}
