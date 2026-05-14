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
  const u = await prisma.user.create({ data: { name, email, phone, role, passwordHash, active, companyId } });
  res.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } });
});

export default router;
