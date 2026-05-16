import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Synthesize notifications from recent shipment activity + couriers + transactions.
// For real-time we'd add a Notification model, but this gives meaningful per-company data
// derived from real records.
router.get("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const since = new Date(Date.now() - 7 * 86400_000);

  const [recentShipments, recentDelivered, recentCouriers] = await Promise.all([
    prisma.shipment.findMany({
      where: { companyId, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, number: true, status: true, cod: true, createdAt: true },
    }),
    prisma.shipment.findMany({
      where: { companyId, status: "تسليم ناجح" },
      orderBy: { id: "desc" },
      take: 5,
      select: { id: true, number: true, cod: true, createdAt: true },
    }),
    prisma.courier.findMany({
      where: { companyId, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, name: true, createdAt: true },
    }),
  ]);

  type Note = { id: string; type: string; titleKey: string; descKey: string; vars: any; createdAt: Date; read: boolean };
  const notifications: Note[] = [];

  for (const s of recentDelivered) {
    notifications.push({
      id: `delivered-${s.id}`, type: "delivered",
      titleKey: "notif.shipmentDelivered",
      descKey: "notif.shipmentDeliveredDesc",
      vars: { n: s.number },
      createdAt: s.createdAt,
      read: false,
    });
    if (s.cod > 0) {
      notifications.push({
        id: `cod-${s.id}`, type: "cod",
        titleKey: "notif.codCollected",
        descKey: "notif.codCollectedDesc",
        vars: { n: s.number, amount: s.cod },
        createdAt: s.createdAt,
        read: false,
      });
    }
  }
  for (const s of recentShipments) {
    if (["مشكلة تسليم", "ملغيه"].includes(s.status)) {
      notifications.push({
        id: `problem-${s.id}`, type: "problem",
        titleKey: "notif.deliveryProblem",
        descKey: "notif.deliveryProblemDesc",
        vars: { n: s.number },
        createdAt: s.createdAt,
        read: false,
      });
    } else if (s.status === "فى انتظار التنفيذ") {
      notifications.push({
        id: `new-${s.id}`, type: "new",
        titleKey: "notif.newShipment",
        descKey: "notif.newShipmentDesc",
        vars: { n: s.number },
        createdAt: s.createdAt,
        read: false,
      });
    }
  }
  for (const c of recentCouriers) {
    notifications.push({
      id: `courier-${c.id}`, type: "courier",
      titleKey: "notif.courierJoined",
      descKey: "notif.courierJoinedDesc",
      vars: { name: c.name },
      createdAt: c.createdAt,
      read: false,
    });
  }

  notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json({ data: notifications.slice(0, 15) });
});

export default router;
