const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintenances = await db.query(escape`
      SELECT COUNT(id) as value, DATE(maileingang) as date, DATE_FORMAT(DATE(maileingang), '%d.%m.%Y') as format
      FROM maintenancedb
      GROUP BY DATE(maileingang)  
      ORDER BY DATE(maileingang)
      DESC
    `)
  res.status(200).json({ maintenances })
}
