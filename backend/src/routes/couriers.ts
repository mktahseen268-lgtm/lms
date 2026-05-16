import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const rows = await prisma.courier.findMany({
    where: { companyId },
    include: { provinces: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({
    data: rows.map((c) => ({
      id: c.id, name: c.name, phone: c.phone, workType: c.workType,
      active: c.active, photo: c.photo, createdAt: c.createdAt,
      provinces: c.provinces.map((p) => p.province),
      commissions: c.provinces.map((p) => ({ province: p.province, commissionType: p.commissionType, value: p.commissionValue })),
    })),
  });
});

router.post("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const { name, phone, workType, password, photo, commissions = [], active = true } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: "الاسم والهاتف مطلوبان" });
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
  const c = await prisma.courier.create({
    data: {
      companyId, name, phone, workType, photo, active, passwordHash,
      provinces: { create: commissions.map((x: any) => ({ province: x.province, commissionType: x.commissionType, commissionValue: Number(x.value) || 0 })) },
    },
  });
  res.json({ courier: c });
});

// Static routes must come before /:id
router.get("/diaries", async (req, res) => {
  const companyId = req.user!.companyId!;
  const rows = await prisma.courierDiary.findMany({
    where: { courier: { companyId } },
    include: { courier: { select: { id: true, name: true, phone: true } } },
    orderBy: { openedAt: "desc" },
  });
  res.json({ data: rows });
});

router.post("/diaries/open", async (req, res) => {
  const { courierId } = req.body || {};
  if (!courierId) return res.status(400).json({ error: "courierId مطلوب" });
  const d = await prisma.courierDiary.create({ data: { courierId: Number(courierId) } });
  res.json({ diary: d });
});

router.post("/diaries/:id/close", async (req, res) => {
  const id = Number(req.params.id);
  const d = await prisma.courierDiary.update({ where: { id }, data: { closedAt: new Date(), status: "closed" } });
  res.json({ diary: d });
});

// Param routes
router.get("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(404).json({ error: "غير موجود" });
  const c = await prisma.courier.findFirst({ where: { id, companyId }, include: { provinces: true } });
  if (!c) return res.status(404).json({ error: "غير موجود" });
  res.json({
    courier: {
      id: c.id, name: c.name, phone: c.phone, workType: c.workType, active: c.active, photo: c.photo,
      commissions: c.provinces.map((p) => ({ province: p.province, commissionType: p.commissionType, value: p.commissionValue })),
    },
  });
});

router.put("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  const existing = await prisma.courier.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  const { name, phone, workType, photo, active, password, commissions } = req.body || {};
  const data: any = {
    ...(name !== undefined && { name }),
    ...(phone !== undefined && { phone }),
    ...(workType !== undefined && { workType }),
    ...(photo !== undefined && { photo }),
    ...(active !== undefined && { active }),
  };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);
  await prisma.courier.update({ where: { id }, data });
  if (Array.isArray(commissions)) {
    await prisma.courierProvince.deleteMany({ where: { courierId: id } });
    if (commissions.length) {
      await prisma.courierProvince.createMany({
        data: commissions.map((x: any) => ({
          courierId: id, province: x.province, commissionType: x.commissionType, commissionValue: Number(x.value) || 0,
        })),
      });
    }
  }
  res.json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  const existing = await prisma.courier.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await prisma.courierProvince.deleteMany({ where: { courierId: id } });
  await prisma.courier.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
