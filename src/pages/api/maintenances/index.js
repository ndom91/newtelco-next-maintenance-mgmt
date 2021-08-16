import prisma from "../../../lib/prisma"

export default async function handle(req, res) {
  const { query, body, method } = req
  const { mid } = query

  if (method === "GET" && mid) {
    const maintenances = await prisma.maintenance.findUnique({
      where: {
        id: parseInt(mid),
      },
      include: {
        suppliercompany: {
          select: {
            name: true,
            maildomain: true,
          },
        },
      },
    })

    res.status(200).json(maintenances)
  } else if (method === "GET") {
    const maintenances = await prisma.maintenance.findMany({
      include: {
        suppliercompany: {
          select: {
            name: true,
            maildomain: true,
          },
        },
      },
    })

    res.status(200).json(maintenances)
  } else if (method === "DELETE") {
    const { maintId } = query
    const maintenanceInactive = await prisma.maintenance.update({
      data: {
        active: false,
      },
      where: {
        id: parseInt(maintId),
      },
    })
    res.status(200).json(maintenanceInactive)
  } else if (method === "PUT") {
    // const maintId = req.body.id
    // const values = req.body.values
    // const user = req.body.user
    // const field = req.body.field
    // const save = await db.query(escape`
    //   UPDATE maintenancedb
    //   SET
    //     cancelled = ${values.cancelled},
    //     senderMaintenanceId = ${values.senderMaintenanceId},
    //     done = ${values.done},
    //     emergency = ${values.emergency},
    //     startDateTime = ${values.startDateTime},
    //     endDateTime = ${values.endDateTime},
    //     impact = ${values.impact || ""},
    //     location = ${values.location || ""},
    //     reason = ${values.reason || ""},
    //     maintNote = ${values.maintNote || ""},
    //     lieferant = ${values.supplier || ""},
    //     derenCIDid = ${values.supplierCids ? values.supplierCids.join(",") : ""},
    //     timezone = ${values.timezone || ""}
    //   WHERE id LIKE ${maintId}
    // `)
    // const fieldName = {
    //   cancelled: "cancelled",
    //   done: "done",
    //   emergency: "emergency",
    //   startDateTime: "start date/time",
    //   endDateTime: "end date/time",
    //   impact: "impact",
    //   location: "location",
    //   reason: "reason",
    //   maintNote: "notes",
    //   supplier: "supplier",
    //   supplierCids: "supplier cids",
    //   timezone: "timezone",
    //   senderMaintenanceId: "sender maintenance id",
    // }
    // let updateHistory
    // if (field) {
    //   updateHistory = await db.query(
    //     escape`INSERT INTO changelog (mid, user, action, field) VALUES (${maintId}, ${user}, 'changed', ${fieldName[field]});`
    //   )
    // }
    // res.status(200).json({
    //   saved: save.affectedRows === 1 ? true : save,
    //   insertHistory: updateHistory?.affectedRows === 1,
    //   maintId,
    //   values,
    // })
    const { id, values, user, field } = body
    const {
      cancelled,
      sendermaintenanceid,
      done,
      emergency,
      startdatetime,
      enddatetime,
      impact,
      location,
      reason,
      maintnote,
      supplier,
      suppliercids,
      timezone,
    } = values

    const maintenanceSave = await prisma.maintenance.update({
      data: {
        cancelled,
        sendermaintenanceid,
        done,
        emergency,
        startdatetime,
        enddatetime,
        impact,
        location,
        reason,
        maintnote,
        supplier,
        derencidid: suppliercids,
        timezone,
      },
      where: {
        id: parseInt(id),
      },
    })

    const fieldName = {
      cancelled: "cancelled",
      done: "done",
      emergency: "emergency",
      startDateTime: "start date/time",
      endDateTime: "end date/time",
      impact: "impact",
      location: "location",
      reason: "reason",
      maintNote: "notes",
      supplier: "supplier",
      supplierCids: "supplier cids",
      timezone: "timezone",
      senderMaintenanceId: "sender maintenance id",
    }

    // Insert Changelog
    await prisma.changelog.create({
      data: {
        maintenance: {
          connect: {
            id: parseInt(mid),
          },
        },
        user,
        action: "changed",
        field: fieldName[field],
      },
    })

    res.status(200).json(maintenanceSave)
  } else {
    res.setHeader("Allow", ["GET", "PUT", "POST", "DELETE"])
    res.status(405).end(`Method ${method} Not Allowed`)
  }
}
