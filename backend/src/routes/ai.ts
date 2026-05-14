import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/analysis", async (req, res) => {
  const companyId = req.user!.companyId!;
  const period = String(req.query.period || "week");
  const days = period === "day" ? 1 : period === "30days" ? 30 : 7;
  const since = new Date(Date.now() - days * 86400000);

  const all = await prisma.shipment.findMany({ where: { companyId, createdAt: { gte: since } }, select: { status: true, province: true } });
  const success = all.filter((s) => s.status === "تسليم ناجح").length;
  const byProvince: Record<string, number> = {};
  for (const s of all) byProvince[s.province] = (byProvince[s.province] || 0) + 1;
  res.json({
    totals: { all: all.length, success, successRate: all.length ? Math.round((success / all.length) * 100) : 0 },
    byProvince: Object.entries(byProvince).map(([p, v]) => ({ province: p, count: v })),
  });
});

export default router;
