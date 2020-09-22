const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const mailDomain = `${req.query.id.split('.')[0]}%`
  const companyResults = await db.query(escape`
    SELECT 
    companies.id, companies.name 
    FROM companies 
    WHERE companies.mailDomain 
    LIKE %${mailDomain}%
  `)
  res.status(200).json({ companyResults })
}
