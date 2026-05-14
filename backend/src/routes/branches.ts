import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const data = await prisma.branch.findMany({ where: { companyId } });
  res.json({ data });
});

router.post("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const { name, address, active = true } = req.body || {};
  if (!name) return res.status(400).json({ error: "اسم الفرع مطلوب" });
  const b = await prisma.branch.create({ data: { companyId, name, address, active } });
  res.json({ branch: b });
});

router.post("/deliver", async (_req, res) => res.json({ ok: true }));
router.post("/receive", async (_req, res) => res.json({ ok: true }));

export default router;
