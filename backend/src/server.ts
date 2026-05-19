import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import auth from "./routes/auth.js";
import dashboard from "./routes/dashboard.js";
import shipments from "./routes/shipments.js";
import couriers from "./routes/couriers.js";
import clients from "./routes/clients.js";
import branches from "./routes/branches.js";
import pricing from "./routes/pricing.js";
import accounts from "./routes/accounts.js";
import users from "./routes/users.js";
import roles from "./routes/roles.js";
import network from "./routes/network.js";
import reports from "./routes/reports.js";
import marketplace from "./routes/marketplace.js";
import ai from "./routes/ai.js";
import supply from "./routes/supply.js";
import operations from "./routes/operations.js";
import profile from "./routes/profile.js";
import notifications from "./routes/notifications.js";
import { requireAuth } from "./middleware/auth.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "Dalilee Logico API" }));

app.use("/api/auth", auth);
app.use("/api/dashboard", requireAuth, dashboard);
app.use("/api/shipments", requireAuth, shipments);
app.use("/api/couriers", requireAuth, couriers);
app.use("/api/clients", requireAuth, clients);
app.use("/api/branches", requireAuth, branches);
app.use("/api/pricing", requireAuth, pricing);
app.use("/api/accounts", requireAuth, accounts);
app.use("/api/users", requireAuth, users);
app.use("/api/roles", requireAuth, roles);
app.use("/api/network", requireAuth, network);
app.use("/api/reports", requireAuth, reports);
app.use("/api/marketplace", requireAuth, marketplace);
app.use("/api/ai", requireAuth, ai);
app.use("/api/supply", requireAuth, supply);
app.use("/api/operations", requireAuth, operations);
app.use("/api/profile", requireAuth, profile);
app.use("/api/notifications", requireAuth, notifications);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: err?.message || "خطأ داخلي" });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`✓ Dalilee Logico API listening on http://localhost:${PORT}`);
});
