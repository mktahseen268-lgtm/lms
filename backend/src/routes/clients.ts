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

export default router;
