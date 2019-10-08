const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const lieferantCIDid = req.query.id
  console.log('1', lieferantCIDid)
  const respArray = []
  const cidArray = lieferantCIDid.split(',')
  const lieferantCIDsResult = await db.query(escape`
    SELECT lieferantCID.derenCID as label FROM lieferantCID WHERE lieferantCID.id IN ${lieferantCIDid}
  `)
  console.log('2', lieferantCIDsResult)
  await cidArray.forEach(id => {
    lieferantCIDsResult.then(data => {
      respArray.push({ value: id, label: data })
    })
  })
  console.log(respArray)
  const count = await db.query(escape`
      SELECT COUNT(*)
      AS lieferantCIDCount
      FROM lieferantCID
      WHERE lieferantCID.id LIKE ${lieferantCIDid}
    `)
  const { lieferantCIDsCount } = count[0]
  res.status(200).json({ label: lieferantCIDsResult[0], lieferantCIDsCount })
}
