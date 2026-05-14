import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const all = await prisma.shipment.findMany({ where: { companyId }, select: { status: true, cod: true } });
  const total = all.length;
  const pending = all.filter((s) => s.status === "فى انتظار التنفيذ").length;
  const delivered = all.filter((s) => s.status === "تسليم ناجح").length;
  const problems = all.filter((s) => ["مشكلة تسليم", "ملغيه", "رفض و رفض دفع تكلفة"].includes(s.status)).length;
  const inProgress = total - delivered - problems;

  const codTotal = all.reduce((s, x) => s + x.cod, 0);
  const codCollected = all.filter((s) => s.status === "تسليم ناجح").reduce((s, x) => s + x.cod, 0);
  const activeCouriers = await prisma.courier.count({ where: { companyId, active: true } });
  const activeClients = await prisma.client.count({ where: { companyId, active: true } });

  res.json({
    shipments: { total, pending, inProgress, delivered, problems },
    cod: { total: codTotal, collected: codCollected },
    couriers: { active: activeCouriers },
    clients: { active: activeClients },
  });
});

export default router;
