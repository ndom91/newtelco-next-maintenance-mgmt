// const db = require("../../../lib/db")
// const escape = require("sql-template-strings")
import prisma from "../../../lib/prisma"

module.exports = async (req, res) => {
  const { query, body, method } = req

  if (method === "POST") {
    const { name, domain, recipient } = body
    //   const insertCompanyQuery = await db.query(escape`
    //   INSERT INTO companies (name, mailDomain, maintenanceRecipient) VALUES (${name}, ${domain}, ${recipient})
    // `)
    // res.status(200).json({ insertCompanyQuery })
    console.log(name, domain, recipient)
    console.log({
      data: {
        name,
        mailDomain: domain,
        maintenanceRecipient: recipient,
      },
    })
    const company = await prisma.companies.create({
      data: {
        name,
        mailDomain: domain,
        maintenanceRecipient: recipient,
      },
    })
    res.status(200).json(company)
    // } else if (method === "PUT") {
    //   const { id, name, domain, recipient } = body
    //   console.log(req.query.name)
    //   console.log(id, name, domain, recipient)
    //   const updateCompanyQuery = await db.query(escape`
    //   UPDATE companies SET name = ${name}, mailDomain = ${domain}, maintenanceRecipient = ${recipient} WHERE id = ${id}
    // `)
    //   res.status(200).json({ updateCompanyQuery })
    // } else if (method === "DELETE") {
    //   const { id } = query
    //   const deleteCompanyQuery = await db.query(escape`
    //   DELETE FROM companies WHERE id = ${id}
    // `)
    //   res.status(200).json({ deleteCompanyQuery })
  } else {
    res.setHeader("Allow", ["PUT", "POST", "DELETE"])
    res.status(405).end(`Method ${method} Not Allowed`)
  }
}
