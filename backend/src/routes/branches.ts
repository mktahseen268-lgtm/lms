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

router.put("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  const existing = await prisma.branch.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  const { name, address, active } = req.body || {};
  const b = await prisma.branch.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(address !== undefined && { address }),
      ...(active !== undefined && { active }),
    },
  });
  res.json({ branch: b });
});

router.delete("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  const existing = await prisma.branch.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await prisma.branch.delete({ where: { id } });
  res.json({ ok: true });
});

router.post("/deliver", async (_req, res) => res.json({ ok: true }));
router.post("/receive", async (_req, res) => res.json({ ok: true }));

export default router;
