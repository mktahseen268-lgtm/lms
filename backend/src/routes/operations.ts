import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.post("/assign-courier", async (req, res) => {
  const { shipmentIds = [], courierId } = req.body || {};
  if (!courierId || !Array.isArray(shipmentIds)) return res.status(400).json({ error: "بيانات ناقصة" });
  await prisma.shipment.updateMany({
    where: { id: { in: shipmentIds.map(Number) }, companyId: req.user!.companyId! },
    data: { courierId: Number(courierId), status: "تحت تسليم العميل" },
  });
  res.json({ ok: true });
});

router.post("/return-to-merchant", async (req, res) => {
  const { shipmentIds = [] } = req.body || {};
  await prisma.shipment.updateMany({
    where: { id: { in: shipmentIds.map(Number) }, companyId: req.user!.companyId! },
    data: { status: "مرتجع في مخزن الشركه" },
  });
  res.json({ ok: true });
});

export default router;
