import prisma from "../../../lib/prisma"

export default async function handle(req, res) {
  const { query, body, method } = req

  if (method === "GET" && query.maintId) {
    // const companyId = parseInt(req.query.id) || 1
    // const maintenances = await db.query(escape`
    //     SELECT maintenancedb.id, maintenancedb.senderMaintenanceId, maintenancedb.maileingang, maintenancedb.receivedmail, companies.name, lieferantCID.derenCID, maintenancedb.bearbeitetvon, maintenancedb.betroffeneKunden, DATE_FORMAT(maintenancedb.startDateTime, "%Y-%m-%d %H:%i:%S") as startDateTime, DATE_FORMAT(maintenancedb.endDateTime, "%Y-%m-%d %H:%i:%S") as endDateTime, maintenancedb.postponed, maintenancedb.notes, maintenancedb.mailSentAt, maintenancedb.updatedAt, maintenancedb.betroffeneCIDs, maintenancedb.done, maintenancedb.cancelled, companies.mailDomain, maintenancedb.emergency, maintenancedb.rescheduled FROM maintenancedb LEFT JOIN lieferantCID ON maintenancedb.derenCIDid = lieferantCID.id LEFT JOIN companies ON maintenancedb.lieferant = companies.id WHERE maintenancedb.active = 1 AND maintenancedb.lieferant LIKE ${companyId}
    //   `)
    const companies = await prisma.maintenance.findMany({
      where: {
        lieferantcompany: {
          is: {
            id: parseInt(query.maintId),
          },
        },
      },
      // include: {
      //   suppliercircuits: true,
      //   lieferantcompany: true,
      // },
      select: {
        id: true,
        sendermaintenanceid: true,
        maileingang: true,
        receivedmail: true,
        bearbeitetvon: true,
        betroffenekunden: true,
        startdatetime: true,
        enddatetime: true,
        postponed: true,
        notes: true,
        mailsentat: true,
        updatedat: true,
        betroffenecids: true,
        done: true,
        cancelled: true,
        emergency: true,
        rescheduled: true,
        lieferantcompany: {
          select: {
            maildomain: true,
            name: true,
          },
        },
      },
    })

    res.status(200).json(companies)
  } else if (method === "GET") {
    const companies = await prisma.company.findMany()

    if (query.select) {
      const selectCompanies = companies.map((company) => {
        return {
          value: company.id,
          label: company.name,
        }
      })
      res.status(200).json(selectCompanies)
      return
    }
    if (query.mail) {
      const domainCompanies = companies.map((company) => {
        return {
          value: company.maildomain,
          label: company.name,
        }
      })
      res.status(200).json(domainCompanies)
      return
    }

    res.status(200).json(companies)
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE"])
    res.status(405).end(`Method ${method} Not Allowed`)
  }
}
