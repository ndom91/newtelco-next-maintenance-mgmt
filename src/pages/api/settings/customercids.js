import prisma from "../../../lib/prisma"

export default async function handle(req, res) {
  const { query, body, method } = req

  if (method === "POST") {
    // POST /api/settings/customercids
    const { customercid, company, protection, supplier } = body
    const customerCircuit = await prisma.customerCircuit.create({
      data: {
        kundenCID: customercid,
        protected: protection,
        lieferant: {
          connect: {
            id: supplier,
          },
        },
        kundeCompany: {
          connect: {
            id: company,
          },
        },
      },
    })
    res.status(200).json(customerCircuit)
  } else if (method === "PUT") {
    // PUT /api/settings/customercids
    const { id, customercid, protection } = body
    const customerCircuit = await prisma.customerCircuit.update({
      data: {
        kundenCID: customercid,
        protected: protection.toString(),
      },
      where: {
        id,
      },
    })
    res.status(200).json(customerCircuit)
  } else if (method === "DELETE") {
    // DELETE /api/settings/customercids
    const { id } = query
    const customerCircuit = await prisma.customerCircuit.delete({
      where: {
        id: Number(id),
      },
    })
    res.status(200).json(customerCircuit)
  } else {
    res.setHeader("Allow", ["PUT", "POST", "DELETE"])
    res.status(405).end(`Method ${method} Not Allowed`)
  }
}
