const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintenances = await db.query(escape`
      SELECT COUNT(id) as value, DATE_FORMAT(DATE(maileingang), '%Y-%m-%d') as day
      FROM maintenancedb
      WHERE maintenancedb.maileingang >= DATE(CURDATE() - INTERVAL 1 YEAR)
      GROUP BY DATE(maileingang)  
      ORDER BY DATE(maileingang)
      DESC
    `)
  res.status(200).json({ maintenances })
}
