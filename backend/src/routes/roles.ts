import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (_req, res) => {
  const data = await prisma.role.findMany();
  res.json({ data });
});

router.post("/", async (req, res) => {
  const { name, permissions = [] } = req.body || {};
  if (!name) return res.status(400).json({ error: "الاسم مطلوب" });
  try {
    const r = await prisma.role.create({ data: { name, permissions: JSON.stringify(permissions) } });
    res.json({ role: r });
  } catch (e: any) {
    if (String(e?.code) === "P2002") return res.status(409).json({ error: "اسم الدور مستخدم بالفعل" });
    throw e;
  }
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, permissions } = req.body || {};
  const r = await prisma.role.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(permissions !== undefined && { permissions: JSON.stringify(permissions) }),
    },
  });
  res.json({ role: r });
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.role.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
