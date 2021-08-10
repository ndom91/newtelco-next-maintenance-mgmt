const db = require("../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const [profile] = await db.query(escape`
    SELECT maintenancedb.id, maintenancedb.senderMaintenanceId, maintenancedb.maileingang, maintenancedb.lieferant, maintenancedb.receivedmail, maintenancedb.timezone, maintenancedb.timezoneLabel, companies.name, maintenancedb.derenCIDid, lieferantCID.derenCID, maintenancedb.bearbeitetvon, maintenancedb.betroffeneKunden, DATE_FORMAT(maintenancedb.startDateTime, "%Y-%m-%d %H:%i:%S") as startDateTime, DATE_FORMAT(maintenancedb.endDateTime, "%Y-%m-%d %H:%i:%S") as endDateTime, maintenancedb.postponed, maintenancedb.notes, maintenancedb.mailSentAt, maintenancedb.updatedAt, maintenancedb.betroffeneCIDs, maintenancedb.done, maintenancedb.cancelled, companies.mailDomain, maintenancedb.emergency, maintenancedb.reason, maintenancedb.impact, maintenancedb.location, maintenancedb.updatedBy, maintenancedb.maintNote, maintenancedb.calendarId FROM maintenancedb LEFT JOIN lieferantCID ON maintenancedb.derenCIDid = lieferantCID.id LEFT JOIN companies ON maintenancedb.lieferant = companies.id WHERE maintenancedb.id = ${req.query.id}
  `)
  res.status(200).json({ profile })
}
