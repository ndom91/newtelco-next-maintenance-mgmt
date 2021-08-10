import prisma from "../../../lib/prisma"

export default async function handle(req, res) {
  const { query, body, method } = req

  if (method === "POST") {
    // POST /api/settings/suppliercids
    // const supplier = decodeURIComponent(req.query.company)
    // const supplierCid = decodeURIComponent(req.query.cid)
    const { company, cid } = body
    // const insertSupplierCidQuery = await db.query(escape`
    //   INSERT INTO lieferantCID (lieferant, derenCID) VALUES (${supplier}, ${supplierCid})
    // `)
    const supplierCircuit = await prisma.supplierCircuit.create({
      data: {
        company: {
          connect: {
            id: company,
          },
        },
        derenCID: cid,
      },
    })
    res.status(200).json(supplierCircuit)
  } else if (method === "PUT") {
    // PUT /api/settings/suppliercids
    // const id = req.query.id
    // const supplierCid = decodeURIComponent(req.query.suppliercid)
    const { id, suppliercid } = body
    // const updateSupplierCidQuery = await db.query(escape`
    //   UPDATE lieferantCID SET derenCID = ${supplierCid} WHERE id = ${id}
    // `)
    const supplierCircuit = await prisma.supplierCircuit.update({
      data: {
        derenCID: suppliercid,
      },
      where: {
        id,
      },
    })
    res.status(200).json(supplierCircuit)
  } else if (method === "DELETE") {
    // DELETE /api/settings/suppliercids
    // const supplierCidId = req.query.id
    const { id } = query
    // const deleteSupplierCidQuery = await db.query(escape`
    //   DELETE FROM lieferantCID WHERE id = ${supplierCidId}
    // `)
    const supplierCircuit = await prisma.supplierCircuit.delete({
      where: {
        id: Number(id),
      },
    })
    res.status(200).json(supplierCircuit)
  } else {
    res.setHeader("Allow", ["PUT", "POST", "DELETE"])
    res.status(405).end(`Method ${method} Not Allowed`)
  }
}
