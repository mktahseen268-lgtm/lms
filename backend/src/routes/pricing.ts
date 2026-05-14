import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

const EG_PROVINCES = [
  "القاهرة","الجيزة","الإسكندرية","الدقهلية","الشرقية","القليوبية","المنوفية","الغربية",
  "كفر الشيخ","البحيرة","الإسماعيلية","السويس","بورسعيد","دمياط","شمال سيناء","جنوب سيناء",
  "الفيوم","بني سويف","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان","البحر الأحمر","الوادي الجديد","مطروح","حلوان","6 أكتوبر",
];

router.get("/provinces", async (req, res) => {
  const companyId = req.user!.companyId!;
  const existing = await prisma.pricingPlan.findMany({ where: { companyId } });
  const map = new Map(existing.map((x) => [x.province, x]));
  const data = EG_PROVINCES.map((p) => {
    const r = map.get(p) as typeof existing[0] | undefined;
    return r
      ? { id: r.id, province: p, basePrice: r.basePrice, returnPrice: r.returnPrice, weightPrice: r.weightPrice, deliveryPrice: r.deliveryPrice, active: r.active }
      : { province: p, basePrice: 50, returnPrice: 25, weightPrice: 10, deliveryPrice: 15, active: true };
  });
  res.json({ data });
});

router.put("/bulk-update", async (req, res) => {
  const companyId = req.user!.companyId!;
  const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
  await prisma.$transaction(
    rows.map((r: any) =>
      prisma.pricingPlan.upsert({
        where: { companyId_province: { companyId, province: r.province } },
        update: {
          basePrice: Number(r.basePrice) || 0,
          returnPrice: Number(r.returnPrice) || 0,
          weightPrice: Number(r.weightPrice) || 0,
          deliveryPrice: Number(r.deliveryPrice) || 0,
          active: !!r.active,
        },
        create: {
          companyId, province: r.province,
          basePrice: Number(r.basePrice) || 0,
          returnPrice: Number(r.returnPrice) || 0,
          weightPrice: Number(r.weightPrice) || 0,
          deliveryPrice: Number(r.deliveryPrice) || 0,
          active: !!r.active,
        },
      })
    )
  );
  res.json({ ok: true });
});

export default router;
