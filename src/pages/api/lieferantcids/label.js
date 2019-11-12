const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const lieferantCIDid = req.query.id
  const respArray = []
  const cidArray = lieferantCIDid.split(',')
  let cidString = ''
  cidArray.forEach(cid => {
    cidString += (`,"${cid}"`)
  })
  cidString = cidString.substr(1, cidString.length)
  cidString = `(${cidString})`
  const lieferantCIDsResult = await db.query(`
    SELECT lieferantCID.id as value, lieferantCID.derenCID as label FROM lieferantCID WHERE lieferantCID.id IN ${cidString}
  `)
  lieferantCIDsResult.forEach(cid => {
    respArray.push(cid)
  })
  // console.log(respArray)
  const count = await db.query(escape`
      SELECT COUNT(*)
      AS lieferantCIDCount
      FROM lieferantCID
      WHERE lieferantCID.id LIKE ${lieferantCIDid}
    `)
  const { lieferantCIDsCount } = count[0]
  res.status(200).json({ respArray, lieferantCIDsCount })
}
