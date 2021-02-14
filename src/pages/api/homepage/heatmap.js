const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintenances = await db.query(escape`
      SELECT COUNT(id) as value, DATE_FORMAT(DATE(maileingang), '%Y-%m-%d') as day
      FROM maintenancedb
      WHERE maintenancedb.maileingang >= DATE(CURDATE() - INTERVAL 18 MONTH)
      GROUP BY DATE(day)  
      ORDER BY DATE(day)
      DESC
    `)
  res.status(200).json({ maintenances })
}
