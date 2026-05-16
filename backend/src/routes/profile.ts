import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  res.json({ company });
});

router.put("/", async (req, res) => {
  const companyId = req.user!.companyId!;
  const { name, email, phone, address, logo } = req.body || {};
  const company = await prisma.company.update({
    where: { id: companyId },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(logo !== undefined && { logo }),
    },
  });
  res.json({ company });
});

export default router;
