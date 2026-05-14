import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EG_PROVINCES = [
  "القاهرة","الجيزة","الإسكندرية","الدقهلية","الشرقية","القليوبية","المنوفية","الغربية",
  "كفر الشيخ","البحيرة","الإسماعيلية","السويس","بورسعيد","دمياط","شمال سيناء","جنوب سيناء",
  "الفيوم","بني سويف","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان","البحر الأحمر","الوادي الجديد","مطروح","حلوان","6 أكتوبر",
];

async function main() {
  console.log("⌛ Seeding Dalilee Logico Logistics...");

  // Company
  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1, name: "Dalilee Logico Logistics", email: "info@dalilee.com", phone: "+20100000000", address: "القاهرة، مصر",
    },
  });

  // Admin user
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@dalilee.com" },
    update: { passwordHash: hash, role: "COMPANY_ADMIN", active: true, companyId: company.id },
    create: { email: "admin@dalilee.com", name: "مدير النظام", passwordHash: hash, role: "COMPANY_ADMIN", active: true, companyId: company.id },
  });

  // Provinces
  for (const p of EG_PROVINCES) {
    await prisma.province.upsert({ where: { name: p }, update: {}, create: { name: p } });
  }

  // Roles
  const roles = ["SUPER_ADMIN", "COMPANY_ADMIN", "DATA_ENTRY", "SUPERVISOR", "COURIER", "CLIENT", "AGENT", "DISTRIBUTOR"];
  for (const r of roles) {
    await prisma.role.upsert({ where: { name: r }, update: {}, create: { name: r, permissions: "[]" } });
  }

  // Clients (merchants)
  const clientNames = ["متجر النور", "السوق الأخضر", "مؤسسة الكرامة", "Trendy Closet"];
  for (const n of clientNames) {
    await prisma.client.upsert({
      where: { id: clientNames.indexOf(n) + 1 },
      update: {},
      create: { id: clientNames.indexOf(n) + 1, companyId: company.id, name: n, phone: `0100000${Math.floor(1000 + Math.random() * 9000)}`, city: "القاهرة", email: `${n.replace(/\s/g, "")}@example.com`, active: true },
    });
  }

  // Branches
  const branches = ["الفرع الرئيسي", "فرع الجيزة", "فرع الإسكندرية"];
  for (const b of branches) {
    await prisma.branch.upsert({
      where: { id: branches.indexOf(b) + 1 },
      update: {},
      create: { id: branches.indexOf(b) + 1, companyId: company.id, name: b, address: "—", active: true },
    });
  }

  // Couriers
  const couriers = [
    { name: "أحمد محمود", phone: "01001234567", workType: "دوام كامل" },
    { name: "محمد علي", phone: "01001234568", workType: "بالعمولة" },
    { name: "خالد إبراهيم", phone: "01001234569", workType: "دوام كامل" },
  ];
  for (const c of couriers) {
    const courier = await prisma.courier.upsert({
      where: { id: couriers.indexOf(c) + 1 },
      update: {},
      create: { id: couriers.indexOf(c) + 1, companyId: company.id, name: c.name, phone: c.phone, workType: c.workType, active: true },
    });
    // Some provinces
    for (const p of EG_PROVINCES.slice(0, 3)) {
      await prisma.courierProvince.create({ data: { courierId: courier.id, province: p, commissionType: "fixed", commissionValue: 25 } }).catch(() => {});
    }
  }

  // Pricing
  for (const p of EG_PROVINCES) {
    await prisma.pricingPlan.upsert({
      where: { companyId_province: { companyId: company.id, province: p } },
      update: {},
      create: { companyId: company.id, province: p, basePrice: 50, returnPrice: 25, weightPrice: 10, deliveryPrice: 15, active: true },
    });
  }

  // Marketplace
  const products = [
    { name: "كرتونة شحن متوسطة", price: 5, description: "كرتون مقوى 30×20×20" },
    { name: "كرتونة شحن كبيرة", price: 8, description: "كرتون مقوى 50×40×30" },
    { name: "شريط لاصق صناعي", price: 12, description: "لاصق قوي 50 متر" },
    { name: "ملصقات بوليصة (1000)", price: 60, description: "ملصقات حرارية للطباعة" },
  ];
  for (const p of products) {
    await prisma.marketplaceProduct.upsert({
      where: { id: products.indexOf(p) + 1 },
      update: {},
      create: { id: products.indexOf(p) + 1, name: p.name, price: p.price, description: p.description, active: true },
    });
  }

  // Sample shipments
  const statuses = ["فى انتظار التنفيذ", "تحت تسليم العميل", "تسليم ناجح", "في الطريق الي منطقة التوزيع", "مشكلة تسليم"];
  for (let i = 0; i < 18; i++) {
    const cli = (i % clientNames.length) + 1;
    const status = statuses[i % statuses.length];
    const number = `DE-SEED-${String(1000 + i)}`;
    await prisma.shipment.upsert({
      where: { number },
      update: {},
      create: {
        number, companyId: company.id, clientId: cli,
        courierId: ((i % 3) + 1),
        type: i % 5 === 0 ? "استرجاع" : "جديد",
        province: EG_PROVINCES[i % EG_PROVINCES.length],
        city: "—",
        senderName: clientNames[i % clientNames.length],
        customerName: `عميل ${i + 1}`,
        customerPhone: `0102000${1000 + i}`,
        customerAddress: "شارع الجمهورية، رقم 12",
        status,
        cod: 200 + i * 25,
      },
    });
  }

  console.log("✓ Seed complete. Login with admin@dalilee.com / admin123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
