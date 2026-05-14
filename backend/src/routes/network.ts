import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/shipments", async (req, res) => {
  const companyId = req.user!.companyId!;
  const data = await prisma.shipment.findMany({ where: { companyId, type: "شبكة" }, take: 100, orderBy: { createdAt: "desc" } });
  res.json({ data });
});

router.post("/add-shipments", async (_req, res) => res.json({ ok: true, message: "Excel import not yet enabled" }));

router.post("/join-request", async (req, res) => {
  const companyId = req.user!.companyId!;
  const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
  await prisma.$transaction(
    rows.filter((r: any) => r.enabled).map((r: any) =>
      prisma.networkRequest.create({
        data: {
          companyId, province: r.province, status: "pending",
          price: r.price || 0, replacePrice: r.replacePrice || 0, returnPrice: r.returnPrice || 0,
          costReturn: r.costReturn || 0, weightLimit: r.weightLimit || 0, extraWeightPrice: r.extraWeightPrice || 0,
        },
      })
    )
  );
  res.json({ ok: true });
});

router.get("/distribution-requests", async (req, res) => {
  const companyId = req.user!.companyId!;
  const data = await prisma.networkRequest.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } });
  res.json({ data });
});

router.get("/distributors", async (req, res) => {
  const companyId = req.user!.companyId!;
  const data = await prisma.distributor.findMany({ where: { companyId } });
  res.json({ data });
});

export default router;
