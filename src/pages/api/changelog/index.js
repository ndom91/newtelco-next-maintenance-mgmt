// const db = require("../../../lib/db")
// const escape = require("sql-template-strings")

// module.exports = async (req, res) => {
//   const { mid: maintId, action, field = "", user } = req.query
//   const username = user.substring(0, user.lastIndexOf("@"))

//   await db.query(
//     escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${username}, ${action}, ${field});`
//   )
//   res.status(200).json({ statusText: "OK", status: 200 })
// }

import prisma from "../../../lib/prisma"

export default async function handle(req, res) {
  const { body, method } = req
  const { maintId, user, field, action } = body
  const username = user.substring(0, user.lastIndexOf("@"))

  if (method === "POST") {
    // Insert Changelog
    const changelogInsert = await prisma.changelog.create({
      data: {
        maintenance: {
          connect: {
            id: parseInt(maintId),
          },
        },
        user: username,
        action,
        field,
      },
    })

    res.status(200).json(changelogInsert)
  } else {
    res.setHeader("Allow", ["POST"])
    res.status(405).end(`Method ${method} Not Allowed`)
  }
}
