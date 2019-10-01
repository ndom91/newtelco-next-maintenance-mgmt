const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  let page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 9
  if (page < 1) page = 1
  // SELECT *
  // FROM maintenancedb
  // ORDER BY id
  // LIMIT ${(page - 1) * limit}, ${limit}
  const maintenances = await db.query(escape`
      SELECT maintenancedb.id, maintenancedb.maileingang, maintenancedb.receivedmail, companies.name, lieferantCID.derenCID, maintenancedb.bearbeitetvon, maintenancedb.betroffeneKunden, maintenancedb.startDateTime, maintenancedb.endDateTime, maintenancedb.postponed, maintenancedb.notes, maintenancedb.mailSentAt, maintenancedb.updatedAt, maintenancedb.betroffeneCIDs, maintenancedb.done, maintenancedb.cancelled, companies.mailDomain, maintenancedb.emergency FROM maintenancedb LEFT JOIN lieferantCID ON maintenancedb.derenCIDid = lieferantCID.id LEFT JOIN companies ON maintenancedb.lieferant = companies.id WHERE maintenancedb.active = 1
    `)
  const count = await db.query(escape`
      SELECT COUNT(*)
      AS maintenanceCount
      FROM maintenancedb
    `)
  const { maintenancesCount } = count[0]
  const maintenanceCount = Math.ceil(maintenancesCount / limit)
  // console.log(db)
  res.status(200).json({ maintenances, maintenanceCount, page })
}
