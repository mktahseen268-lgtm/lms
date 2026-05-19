import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const distributors = await prisma.distributor.findMany({ where: { companyId } });
  const data: any[] = [];
  for (const d of distributors) {
    let provs: string[] = [];
    try { provs = JSON.parse(d.provinces || "[]"); } catch {}
    for (const p of provs) data.push({ id: d.id, province: p, distributor: d.partnerCompany, status: d.status });
  }
  res.json({ data });
});

router.post("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const { partnerCompany, provinces = [], status = "active" } = req.body || {};
  if (!partnerCompany) return res.status(400).json({ error: "اسم الموزع مطلوب" });
  const d = await prisma.distributor.create({
    data: { companyId, partnerCompany, provinces: JSON.stringify(provinces), status },
  });
  res.json({ distributor: d });
});

router.put("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  const existing = await prisma.distributor.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  const { partnerCompany, provinces, status } = req.body || {};
  const data: any = {};
  if (partnerCompany !== undefined) data.partnerCompany = partnerCompany;
  if (provinces !== undefined) data.provinces = JSON.stringify(provinces);
  if (status !== undefined) data.status = status;
  const d = await prisma.distributor.update({ where: { id }, data });
  res.json({ distributor: d });
});

router.delete("/:id", async (req, res) => {
  const companyId = req.user!.companyId!;
  const id = Number(req.params.id);
  const existing = await prisma.distributor.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await prisma.distributor.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
