const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  // SELECT *
  // FROM maintenancedb
  // WHERE id = ${req.query.id}
  const [profile] = await db.query(escape`
    SELECT maintenancedb.id, maintenancedb.maileingang, maintenancedb.receivedmail, companies.name, lieferantCID.derenCID, maintenancedb.bearbeitetvon, maintenancedb.betroffeneKunden, maintenancedb.startDateTime, maintenancedb.endDateTime, maintenancedb.postponed, maintenancedb.notes, maintenancedb.mailSentAt, maintenancedb.updatedAt, maintenancedb.betroffeneCIDs, maintenancedb.done, maintenancedb.cancelled, companies.mailDomain, maintenancedb.emergency FROM maintenancedb LEFT JOIN lieferantCID ON maintenancedb.derenCIDid = lieferantCID.id LEFT JOIN companies ON maintenancedb.lieferant = companies.id WHERE maintenancedb.id = ${req.query.id}
  `)
  res.status(200).json({ profile })
}
