import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "بيانات غير صالحة" });

  const user = await prisma.user.findUnique({ where: { email: body.data.email }, include: { company: true } });
  if (!user || !user.active) return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });

  const ok = await bcrypt.compare(body.data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });

  const token = signToken({ id: user.id, email: user.email, role: user.role, companyId: user.companyId });
  res.json({
    token,
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role,
      company: user.company ? { id: user.company.id, name: user.company.name, logo: user.company.logo } : null,
    },
  });
});

router.post("/logout", (_req, res) => res.json({ ok: true }));

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { company: true } });
  if (!user) return res.status(404).json({ error: "غير موجود" });
  res.json({
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role,
      company: user.company ? { id: user.company.id, name: user.company.name, logo: user.company.logo } : null,
    },
  });
});

export default router;
