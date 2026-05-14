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
  const r = await prisma.role.create({ data: { name, permissions: JSON.stringify(permissions) } });
  res.json({ role: r });
});

export default router;
