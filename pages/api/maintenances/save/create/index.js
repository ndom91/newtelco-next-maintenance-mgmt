const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const bearbeitetvon = req.query.bearbeitetvon
  // const incomingDate = req.query.incomingDate
  const lieferant = req.query.lieferant
  const mailId = req.query.mailId
  const updatedAt = req.query.updatedAt

  const insertQuery = await db.query(escape`INSERT INTO maintenancedb (bearbeitetvon, receivedmail, lieferant, updatedAt) VALUES (${bearbeitetvon}, ${mailId}, ${lieferant}, ${updatedAt});`)
  console.log(insertQuery)
  const getLastInsertedID = await db.query('SELECT LAST_INSERT_ID();')
  console.log(getLastInsertedID[0])
  const newId = getLastInsertedID[0]

  if (insertQuery.affectedRows >= 1) {
    res.status(200).json({ statusText: 'OK', status: 200, newId: newId })
  } else {
    res.status(200).json({ statusText: 'FAIL', status: 500, err: 'Save Failed' })
  }
}
