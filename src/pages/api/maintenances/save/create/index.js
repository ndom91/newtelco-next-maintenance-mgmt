const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const bearbeitetvon = req.body.bearbeitetvon
  const lieferant = req.body.lieferant
  const mailId = req.body.mailId
  const updatedAt = req.body.updatedAt
  const incomingMailDate = req.body.maileingang

  const insertQuery = await db.query(
    escape`INSERT INTO maintenancedb (bearbeitetvon, receivedmail, lieferant, updatedAt, maileingang) VALUES (${bearbeitetvon}, ${mailId}, ${lieferant}, ${updatedAt}, ${incomingMailDate});`
  )
  const getLastInsertedID = await db.query('SELECT LAST_INSERT_ID();')
  const newId = getLastInsertedID[0]

  if (insertQuery.affectedRows >= 1) {
    const updateHistory = await db.query(
      escape`INSERT INTO changelog (mid, user, action) VALUES (${newId['LAST_INSERT_ID()']}, ${bearbeitetvon}, 'created');`
    )
    res.status(200).json({
      statusText: 'OK',
      status: 200,
      newId: newId,
      update: updateHistory,
    })
  } else {
    res
      .status(200)
      .json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
