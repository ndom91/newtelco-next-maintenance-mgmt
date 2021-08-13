// const db = require("../../../lib/db")
// const escape = require("sql-template-strings")
import prisma from "../../../lib/prisma"

export default async function handle(req, res) {
  const { query, body, method } = req
  const { id: maintenanceid } = query

  // const reschedules = await db.query(escape`
  //   SELECT reschedule.sdt as startDateTime, reschedule.edt as endDateTime, reschedule.impact, reschedule.rcounter, reschedule.reason, reschedule.sent FROM reschedule WHERE maintenanceid LIKE ${maintId}
  //   `)
  if (method === "GET") {
    const reschedules = await prisma.reschedule.findMany({
      where: {
        maintenanceid: parseInt(maintenanceid),
      },
      select: {
        sdt: true,
        edt: true,
        impact: true,
        rcounter: true,
        reason: true,
        sent: true,
      },
    })
    res.status(200).json(reschedules)
  } else if (method === "POST") {
    const { mid, impact, sdt, edt, user, rcounter, reason } = body

    const insertRescheduleQuery = await prisma.reschedule.create({
      data: {
        maintenance: {
          connect: {
            id: parseInt(mid),
          },
        },
        sdt,
        edt,
        impact,
        label: `${mid}_${rcounter}`,
        rcounter,
        reason,
        user,
      },
    })

    await prisma.changelog.create({
      data: {
        maintenance: {
          connect: {
            id: parseInt(mid),
          },
        },
        user,
        action: "create",
        field: `reschedule - ${mid}_${rcounter}`,
      },
    })
    // const insertRescheduleQuery = await db.query(escape`
    //   INSERT INTO reschedule (impact, sdt, edt, maintenanceid, rid, rcounter, reason, user) VALUES (${newImpact}, ${sdt}, ${edt}, ${maintId}, ${rid}, ${req.body.rcounter}, ${reason}, ${user})
    // `)
    // await db.query(
    //   escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${user}, 'create', 'reschedule - ${rid}');`
    // )

    res.status(200).json(insertRescheduleQuery)
  } else {
    res.setHeader("Allow", ["PUT", "GET", "POST", "DELETE"])
    res.status(405).end(`Method ${method} Not Allowed`)
  }
}
