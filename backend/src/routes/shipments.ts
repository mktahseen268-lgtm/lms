import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const router = Router();

function nextShipmentNumber() {
  // Simple unique sequential: DE-YYYYMMDD-RAND
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = Math.floor(Math.random() * 90000 + 10000);
  return `DE-${date}-${rnd}`;
}

const IN_PROGRESS = [
  "فى انتظار التنفيذ",
  "في الطريق الى الفرع",
  "في الطريق الي منطقة التوزيع",
  "في منطقة التوزيع",
  "تم الاستلام من الراسل",
  "تحت تسليم العميل",
];

router.get("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.min(200, Number(req.query.per_page) || 30);
  const search = (req.query.search as string) || "";
  const scope = (req.query.scope as string) || "all";
  const statusesQ = (req.query.statuses as string) || "";
  const provincesQ = (req.query.provinces as string) || "";
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;

  const where: any = { companyId };
  if (search) {
    where.OR = [
      { number: { contains: search } },
      { customerName: { contains: search } },
      { customerPhone: { contains: search } },
      { senderName: { contains: search } },
    ];
  }
  if (statusesQ) where.status = { in: statusesQ.split(",") };
  if (provincesQ) where.province = { in: provincesQ.split(",") };
  if (from || to) where.createdAt = { gte: from, lte: to };
  if (scope === "progress") where.status = { in: IN_PROGRESS };
  if (scope === "return") where.type = "استرجاع";

  const [total, rows] = await Promise.all([
    prisma.shipment.count({ where }),
    prisma.shipment.findMany({
      where, take: perPage, skip: (page - 1) * perPage,
      orderBy: { createdAt: "desc" },
      include: { courier: { select: { id: true, name: true } } },
    }),
  ]);

  res.json({
    total,
    data: rows.map((s) => ({
      id: s.id, number: s.number, type: s.type, status: s.status,
      senderName: s.senderName, customerName: s.customerName, customerPhone: s.customerPhone,
      province: s.province, city: s.city, cod: s.cod, courier: s.courier, createdAt: s.createdAt,
    })),
  });
});

router.post("/", async (req, res) => {
  const schema = z.object({
    type: z.string().default("جديد"),
    clientId: z.union([z.number(), z.string(), z.literal("")]).optional(),
    province: z.string().min(1),
    city: z.string().optional(),
    customerName: z.string().min(1),
    phone: z.string().min(1),
    phoneAlt: z.string().optional(),
    address: z.string().optional(),
    prepaid: z.boolean().default(false),
    codAmount: z.number().nonnegative().default(0),
    products: z.array(z.object({ name: z.string(), qty: z.number().int().positive(), weight: z.number().nonnegative(), fragile: z.boolean() })).default([]),
    barcode: z.string().optional(),
    notes: z.string().optional(),
    allowOpen: z.boolean().default(false),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "بيانات غير صالحة" });
  const b = parsed.data;
  const companyId = req.user!.companyId!;
  const client = b.clientId ? await prisma.client.findUnique({ where: { id: Number(b.clientId) } }) : null;

  const shipment = await prisma.shipment.create({
    data: {
      number: nextShipmentNumber(),
      companyId, clientId: client?.id,
      type: b.type, province: b.province, city: b.city,
      senderName: client?.name,
      customerName: b.customerName, customerPhone: b.phone, customerPhoneAlt: b.phoneAlt,
      customerAddress: b.address,
      cod: b.codAmount, prepaid: b.prepaid,
      barcode: b.barcode, notes: b.notes, allowOpen: b.allowOpen,
      products: { create: b.products.map((p) => ({ name: p.name, qty: p.qty, weight: p.weight, fragile: p.fragile })) },
      statuses: { create: { status: "فى انتظار التنفيذ", createdBy: req.user!.id } },
    },
  });
  res.json({ shipment });
});

router.post("/check", async (req, res) => {
  const companyId = req.user!.companyId!;
  const numbers: string[] = Array.isArray(req.body.numbers) ? req.body.numbers : [];
  const found = await prisma.shipment.findMany({
    where: { companyId, number: { in: numbers } },
    select: { number: true, status: true },
  });
  const set = new Set(found.map((f) => f.number));
  res.json({ found, missing: numbers.filter((n) => !set.has(n)) });
});

// Bulk status / courier / cancel
router.post("/bulk", async (req, res) => {
  const companyId = req.user!.companyId!;
  const { action, ids, status, courierId } = req.body || {};
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: "لا توجد شحنات محددة" });
  const idsNum = ids.map(Number).filter((n) => !Number.isNaN(n));
  const where = { id: { in: idsNum }, companyId };

  if (action === "status" && status) {
    await prisma.shipment.updateMany({ where, data: { status } });
    await prisma.shipmentStatus.createMany({
      data: idsNum.map((id) => ({ shipmentId: id, status, createdBy: req.user!.id })),
    });
    return res.json({ ok: true, count: idsNum.length });
  }
  if (action === "assignCourier" && courierId) {
    await prisma.shipment.updateMany({ where, data: { courierId: Number(courierId), status: "تحت تسليم العميل" } });
    return res.json({ ok: true, count: idsNum.length });
  }
  if (action === "cancel") {
    await prisma.shipment.updateMany({ where, data: { status: "ملغيه" } });
    return res.json({ ok: true, count: idsNum.length });
  }
  return res.status(400).json({ error: "إجراء غير معروف" });
});

router.get("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(404).json({ error: "غير موجود" });
  const s = await prisma.shipment.findFirst({
    where: { id, companyId },
    include: {
      client: { select: { id: true, name: true } },
      courier: { select: { id: true, name: true, phone: true } },
      branch: { select: { id: true, name: true } },
      products: true,
      statuses: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!s) return res.status(404).json({ error: "غير موجود" });
  res.json({ shipment: s });
});

router.put("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  const existing = await prisma.shipment.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  const { status, courierId, cod, customerName, customerPhone, customerAddress, notes } = req.body || {};
  const data: any = {
    ...(status !== undefined && { status }),
    ...(courierId !== undefined && { courierId: courierId ? Number(courierId) : null }),
    ...(cod !== undefined && { cod: Number(cod) }),
    ...(customerName !== undefined && { customerName }),
    ...(customerPhone !== undefined && { customerPhone }),
    ...(customerAddress !== undefined && { customerAddress }),
    ...(notes !== undefined && { notes }),
  };
  const updated = await prisma.shipment.update({ where: { id }, data });
  if (status && status !== existing.status) {
    await prisma.shipmentStatus.create({ data: { shipmentId: id, status, createdBy: req.user!.id } });
  }
  res.json({ shipment: updated });
});

router.delete("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  const existing = await prisma.shipment.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await prisma.shipmentStatus.deleteMany({ where: { shipmentId: id } });
  await prisma.shipmentProduct.deleteMany({ where: { shipmentId: id } });
  await prisma.shipment.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
