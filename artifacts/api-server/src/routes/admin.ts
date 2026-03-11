import { Router } from "express";
import { db, complaintsTable } from "@workspace/db";
import { authenticate, requireRole } from "../lib/auth.js";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/analytics", authenticate, requireRole("admin"), async (_req, res) => {
  try {
    const all = await db.select().from(complaintsTable);

    const totalComplaints = all.length;
    const pendingCount = all.filter(c => c.status === "Pending").length;
    const inReviewCount = all.filter(c => c.status === "In Review").length;
    const inProgressCount = all.filter(c => c.status === "In Progress").length;
    const resolvedCount = all.filter(c => c.status === "Resolved").length;

    const categoryMap: Record<string, number> = {};
    const departmentMap: Record<string, number> = {};

    for (const c of all) {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
      if (c.department) {
        departmentMap[c.department] = (departmentMap[c.department] || 0) + 1;
      }
    }

    return res.json({
      totalComplaints,
      pendingCount,
      inReviewCount,
      inProgressCount,
      resolvedCount,
      byCategory: Object.entries(categoryMap).map(([category, count]) => ({ category, count })),
      byDepartment: Object.entries(departmentMap).map(([department, count]) => ({ department, count })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
