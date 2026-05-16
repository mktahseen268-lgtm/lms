import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

async function resolveShipmentIds(companyId: number, numbers: string[]) {
  if (!numbers.length) return [];
  const found = await prisma.shipment.findMany({
    where: { companyId, number: { in: numbers } },
    select: { id: true, number: true },
  });
  return found;
}

router.post("/assign-courier", async (req, res) => {
  const companyId = req.user!.companyId!;
  const { shipmentIds, shipmentNumbers, courierId } = req.body || {};
  if (!courierId) return res.status(400).json({ error: "اختر مندوباً" });
  let ids: number[] = [];
  if (Array.isArray(shipmentIds) && shipmentIds.length) ids = shipmentIds.map(Number);
  else if (Array.isArray(shipmentNumbers) && shipmentNumbers.length) {
    const rows = await resolveShipmentIds(companyId, shipmentNumbers);
    ids = rows.map((r) => r.id);
  }
  if (!ids.length) return res.status(400).json({ error: "لا توجد شحنات صالحة" });
  const r = await prisma.shipment.updateMany({
    where: { id: { in: ids }, companyId },
    data: { courierId: Number(courierId), status: "تحت تسليم العميل" },
  });
  await prisma.shipmentStatus.createMany({
    data: ids.map((id) => ({ shipmentId: id, status: "تحت تسليم العميل", createdBy: req.user!.id })),
  });
  res.json({ ok: true, count: r.count });
});

router.post("/return-to-merchant", async (req, res) => {
  const companyId = req.user!.companyId!;
  const { shipmentIds, shipmentNumbers } = req.body || {};
  let ids: number[] = [];
  if (Array.isArray(shipmentIds) && shipmentIds.length) ids = shipmentIds.map(Number);
  else if (Array.isArray(shipmentNumbers) && shipmentNumbers.length) {
    const rows = await resolveShipmentIds(companyId, shipmentNumbers);
    ids = rows.map((r) => r.id);
  }
  if (!ids.length) return res.status(400).json({ error: "لا توجد شحنات صالحة" });
  const r = await prisma.shipment.updateMany({
    where: { id: { in: ids }, companyId },
    data: { status: "مرتجع في مخزن الشركه" },
  });
  await prisma.shipmentStatus.createMany({
    data: ids.map((id) => ({ shipmentId: id, status: "مرتجع في مخزن الشركه", createdBy: req.user!.id })),
  });
  res.json({ ok: true, count: r.count });
});

router.post("/deliver-to-branch", async (req, res) => {
  const companyId = req.user!.companyId!;
  const { branchId, shipmentNumbers } = req.body || {};
  if (!branchId) return res.status(400).json({ error: "اختر الفرع" });
  if (!Array.isArray(shipmentNumbers) || !shipmentNumbers.length) return res.status(400).json({ error: "أدخل أرقام الشحنات" });
  const rows = await resolveShipmentIds(companyId, shipmentNumbers);
  const ids = rows.map((r) => r.id);
  if (!ids.length) return res.status(400).json({ error: "لا توجد شحنات صالحة" });
  await prisma.shipment.updateMany({
    where: { id: { in: ids }, companyId },
    data: { branchId: Number(branchId), status: "في الطريق الى الفرع" },
  });
  await prisma.shipmentStatus.createMany({
    data: ids.map((id) => ({ shipmentId: id, status: "في الطريق الى الفرع", createdBy: req.user!.id })),
  });
  res.json({ ok: true, count: ids.length });
});

router.post("/receive-from-branch", async (req, res) => {
  const companyId = req.user!.companyId!;
  const { shipmentNumbers } = req.body || {};
  if (!Array.isArray(shipmentNumbers) || !shipmentNumbers.length) return res.status(400).json({ error: "أدخل أرقام الشحنات" });
  const rows = await resolveShipmentIds(companyId, shipmentNumbers);
  const ids = rows.map((r) => r.id);
  if (!ids.length) return res.status(400).json({ error: "لا توجد شحنات صالحة" });
  await prisma.shipment.updateMany({
    where: { id: { in: ids }, companyId },
    data: { status: "في المركز الرئيسي" },
  });
  await prisma.shipmentStatus.createMany({
    data: ids.map((id) => ({ shipmentId: id, status: "في المركز الرئيسي", createdBy: req.user!.id })),
  });
  res.json({ ok: true, count: ids.length });
});

export default router;
