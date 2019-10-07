
const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const mailDomain = req.query.id
  const companyResults = await db.query(escape`
    SELECT 
    companies.id, companies.name 
    FROM companies 
    WHERE companies.mailDomain 
    LIKE ${mailDomain}
  `)
  // const count = await db.query(escape`
  //     SELECT COUNT(*)
  //     AS companyCount
  //     FROM lieferantCID
  //     WHERE lieferantCID.lieferant LIKE ${mailDomain}
  //   `)
  // const { companyCount } = count[0]
  res.status(200).json({ companyResults })
}
