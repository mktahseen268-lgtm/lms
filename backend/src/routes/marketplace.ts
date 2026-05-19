import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/products", async (_req, res) => {
  const data = await prisma.marketplaceProduct.findMany({ where: { active: true } });
  res.json({ data });
});

router.get("/orders", async (_req, res) => {
  const data = await prisma.marketplaceOrder.findMany({ orderBy: { createdAt: "desc" } });
  res.json({
    data: data.map((o) => {
      let items: any[] = [];
      try { items = JSON.parse(o.itemsJson || "[]"); } catch {}
      return { id: o.id, status: o.status, total: o.total, items, createdAt: o.createdAt };
    }),
  });
});

router.post("/orders", async (req, res) => {
  const { items = [], total = 0 } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "السلة فارغة" });
  const order = await prisma.marketplaceOrder.create({
    data: { itemsJson: JSON.stringify(items), total: Number(total) || 0, status: "pending" },
  });
  res.json({ order });
});

export default router;
