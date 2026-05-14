import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/products", async (_req, res) => {
  const data = await prisma.marketplaceProduct.findMany({ where: { active: true } });
  res.json({ data });
});

router.post("/orders", async (req, res) => {
  const { items = [], total = 0 } = req.body || {};
  const order = await prisma.marketplaceOrder.create({
    data: { itemsJson: JSON.stringify(items), total: Number(total) || 0 },
  });
  res.json({ order });
});

export default router;
