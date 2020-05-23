const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const maintId = req.body.id
  const values = req.body.values
  const user = req.body.user
  const field = req.body.field
  const save = await db.query(escape`
    UPDATE maintenancedb 
    SET
      cancelled = ${values.cancelled},
      done = ${values.done},
      emergency = ${values.emergency},
      startDateTime = ${values.startDateTime},
      endDateTime = ${values.endDateTime},
      impact = ${values.impact},
      location = ${values.location},
      reason = ${values.reason},
      maintNote = ${values.maintNote},
      lieferant = ${values.supplier},
      derenCIDid = ${values.supplierCids.join(',')},
      timezone = ${values.timezone}
    WHERE id LIKE ${maintId}
  `)
  fieldName = {
    cancelled: 'cancelled',
    done: 'done',
    emergency: 'emergency',
    startDateTime: 'start date/time',
    endDateTime: 'end date/time',
    impact: 'impact',
    location: 'location',
    reason: 'reason',
    maintNote: 'notes',
    supplier: 'supplier',
    supplierCids: 'supplier cids',
    timezone: 'timezone'
  }
  let updateHistory
  if (field) {
    updateHistory = await db.query(escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${user}, 'changed', ${fieldName[field]});`)
  }
  res.status(200).json({
    saved: save.affectedRows === 1,
    insertHistory: updateHistory.affectedRows === 1,
    maintId,
    values
  })
}
