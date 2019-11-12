const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintenances = await db.query(escape`
      SELECT COUNT(id) as value, DATE(updatedAt) as date, DATE_FORMAT(DATE(updatedAt), '%d.%m.%Y') as format
      FROM maintenancedb
      GROUP BY DATE(updatedAt)  
      ORDER BY DATE(updatedAt)
      DESC
    `)
  res.status(200).json({ maintenances })
}
