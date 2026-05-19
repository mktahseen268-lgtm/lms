import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const data = await prisma.client.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } });
  res.json({ data });
});

router.post("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const { name, email, phone, city, integrationCode, active = true } = req.body || {};
  if (!name) return res.status(400).json({ error: "الاسم مطلوب" });
  const c = await prisma.client.create({ data: { companyId, name, email, phone, city, integrationCode, active } });
  res.json({ client: c });
});

router.put("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  const existing = await prisma.client.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  const { name, email, phone, city, integrationCode, active } = req.body || {};
  const c = await prisma.client.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(city !== undefined && { city }),
      ...(integrationCode !== undefined && { integrationCode }),
      ...(active !== undefined && { active }),
    },
  });
  res.json({ client: c });
});

router.delete("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  const existing = await prisma.client.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await prisma.client.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
