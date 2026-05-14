import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

async function fetchReportRows(req: any) {
  const companyId = req.user!.companyId!;
  const { status, merchant, from, to } = req.query;
  const where: any = { companyId };
  if (status) where.status = status;
  if (merchant) where.client = { name: { contains: String(merchant) } };
  if (from || to) where.createdAt = { gte: from ? new Date(String(from)) : undefined, lte: to ? new Date(String(to)) : undefined };
  return prisma.shipment.findMany({ where, include: { client: { select: { name: true } }, courier: { select: { name: true } } } });
}

router.get("/", async (req, res) => {
  const rows = await fetchReportRows(req);
  res.json({ data: rows });
});

router.get("/download-pdf", async (req, res) => {
  const rows = await fetchReportRows(req);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير شحنات</title>
  <style>body{font-family:Cairo,Tahoma;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right;font-size:12px}th{background:#f3e8ff}</style>
  </head><body><h1>تقرير الشحنات</h1>
  <table><thead><tr><th>رقم</th><th>التاجر</th><th>العميل</th><th>المحافظة</th><th>COD</th><th>الحالة</th></tr></thead><tbody>
  ${rows.map((r) => `<tr><td>${r.number}</td><td>${r.client?.name || ""}</td><td>${r.customerName}</td><td>${r.province}</td><td>${r.cod}</td><td>${r.status}</td></tr>`).join("")}
  </tbody></table></body></html>`;
  res.send(html);
});

router.get("/download-excel", async (req, res) => {
  const rows = await fetchReportRows(req);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=report.csv");
  const csv = ["number,merchant,customer,province,cod,status",
    ...rows.map((r) => [r.number, r.client?.name || "", r.customerName, r.province, r.cod, r.status].join(","))].join("\n");
  res.send("﻿" + csv);
});

export default router;
