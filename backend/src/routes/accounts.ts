import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/company-wallet", async (req, res) => {
  const companyId = req.user!.companyId!;
  const tx = await prisma.transaction.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const all = await prisma.shipment.findMany({ where: { companyId }, select: { cod: true, status: true } });
  const codTotal = all.reduce((s, x) => s + x.cod, 0);
  const codCollected = all.filter((s) => s.status === "تسليم ناجح").reduce((s, x) => s + x.cod, 0);
  res.json({
    summary: {
      total: codTotal,
      profit: codCollected * 0.08,
      readyToSupply: codCollected * 0.7,
      net: codCollected * 0.92,
      networkDue: 0,
    },
    transactions: tx,
  });
});

router.get("/sellers", async (req, res) => {
  const companyId = req.user!.companyId!;
  const clients = await prisma.client.findMany({
    where: { companyId },
    include: { shipments: { select: { cod: true, status: true } } },
  });
  const data = clients.map((c) => {
    const due = c.shipments.filter((s) => s.status === "تسليم ناجح").reduce((s, x) => s + x.cod, 0);
    const owed = 0;
    const networkPending = 0;
    return { id: c.id, name: c.name, email: c.email, phone: c.phone, due, owed, networkPending, net: due - owed };
  });
  const summary = {
    due: data.reduce((s, x) => s + x.due, 0),
    owed: data.reduce((s, x) => s + x.owed, 0),
    networkPending: data.reduce((s, x) => s + x.networkPending, 0),
  };
  res.json({ data, summary });
});

router.get("/couriers", async (req, res) => {
  const companyId = req.user!.companyId!;
  const couriers = await prisma.courier.findMany({
    where: { companyId },
    include: { shipments: { select: { cod: true, status: true } } },
  });
  const data = couriers.map((c) => {
    const collected = c.shipments.filter((s) => s.status === "تسليم ناجح").reduce((s, x) => s + x.cod, 0);
    const due = collected * 0.02;
    return { id: c.id, name: c.name, phone: c.phone, due, owed: 0, net: due };
  });
  res.json({ data, summary: { due: data.reduce((s, x) => s + x.due, 0), owed: 0 } });
});

router.get("/network", async (req, res) => {
  const companyId = req.user!.companyId!;
  const distributors = await prisma.distributor.findMany({ where: { companyId } });
  res.json({ data: distributors.map((d) => ({ id: d.id, name: d.partnerCompany, due: 0, owed: 0 })) });
});

export default router;
