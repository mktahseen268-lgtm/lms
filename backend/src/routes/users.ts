import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const data = await prisma.user.findMany({
    where: { companyId },
    select: { id: true, name: true, email: true, phone: true, role: true, active: true, photo: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ data });
});

router.post("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const { name, email, phone, role = "DATA_ENTRY", password, active = true } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "بيانات ناقصة" });
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const u = await prisma.user.create({ data: { name, email, phone, role, passwordHash, active, companyId } });
    res.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch (e: any) {
    if (String(e?.code) === "P2002") return res.status(409).json({ error: "البريد مستخدم بالفعل" });
    throw e;
  }
});

router.put("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  const existing = await prisma.user.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  const { name, email, phone, role, active, password } = req.body || {};
  const data: any = {
    ...(name !== undefined && { name }),
    ...(email !== undefined && { email }),
    ...(phone !== undefined && { phone }),
    ...(role !== undefined && { role }),
    ...(active !== undefined && { active }),
  };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);
  try {
    const u = await prisma.user.update({ where: { id }, data });
    res.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role, active: u.active } });
  } catch (e: any) {
    if (String(e?.code) === "P2002") return res.status(409).json({ error: "البريد مستخدم بالفعل" });
    throw e;
  }
});

router.delete("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  if (id === req.user!.id) return res.status(400).json({ error: "لا يمكن حذف حسابك الحالي" });
  const existing = await prisma.user.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await prisma.user.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
