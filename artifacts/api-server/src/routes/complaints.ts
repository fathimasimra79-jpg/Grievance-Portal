import { Router } from "express";
import { db, complaintsTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authenticate, requireRole, AuthRequest } from "../lib/auth.js";

const router = Router();

async function notifyUser(userId: number, message: string, complaintId?: number) {
  await db.insert(notificationsTable).values({
    userId,
    message,
    complaintId: complaintId ?? null,
    isRead: false,
  });
}

async function getAdminId(): Promise<number | null> {
  const admins = await db.select().from(usersTable).where(eq(usersTable.email, "admin@university.edu")).limit(1);
  return admins.length > 0 ? admins[0].id : null;
}

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { status, category, department } = req.query as Record<string, string>;

    const allComplaints = await db
      .select({
        id: complaintsTable.id,
        studentId: complaintsTable.studentId,
        studentName: usersTable.name,
        title: complaintsTable.title,
        description: complaintsTable.description,
        category: complaintsTable.category,
        department: complaintsTable.department,
        status: complaintsTable.status,
        createdAt: complaintsTable.createdAt,
      })
      .from(complaintsTable)
      .leftJoin(usersTable, eq(complaintsTable.studentId, usersTable.id))
      .orderBy(desc(complaintsTable.createdAt));

    let filtered = allComplaints;

    if (user.role === "student") {
      filtered = filtered.filter(c => c.studentId === user.id);
    } else if (user.role === "department") {
      filtered = filtered.filter(c => c.department != null);
    }

    if (status) filtered = filtered.filter(c => c.status === status);
    if (category) filtered = filtered.filter(c => c.category === category);
    if (department) filtered = filtered.filter(c => c.department === department);

    return res.json({ complaints: filtered, total: filtered.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticate, requireRole("student"), async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ error: "Title, description, and category are required" });
    }
    const [complaint] = await db.insert(complaintsTable).values({
      studentId: user.id,
      title,
      description,
      category,
      status: "Pending",
    }).returning();

    const adminId = await getAdminId();
    if (adminId) {
      await notifyUser(adminId, `New complaint submitted: "${title}" by ${user.name}`, complaint.id);
    }

    const studentName = user.name;
    return res.status(201).json({ ...complaint, studentName });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const results = await db
      .select({
        id: complaintsTable.id,
        studentId: complaintsTable.studentId,
        studentName: usersTable.name,
        title: complaintsTable.title,
        description: complaintsTable.description,
        category: complaintsTable.category,
        department: complaintsTable.department,
        status: complaintsTable.status,
        createdAt: complaintsTable.createdAt,
      })
      .from(complaintsTable)
      .leftJoin(usersTable, eq(complaintsTable.studentId, usersTable.id))
      .where(eq(complaintsTable.id, id))
      .limit(1);

    if (results.length === 0) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    return res.json({ ...results[0], responses: [], feedback: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", authenticate, requireRole("admin", "department"), async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id);
    const { status, department } = req.body;

    const existing = await db.select().from(complaintsTable).where(eq(complaintsTable.id, id)).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    const complaint = existing[0];

    const updates: Partial<typeof complaintsTable.$inferSelect> = {};
    if (status) updates.status = status;
    if (department) updates.department = department;

    const [updated] = await db.update(complaintsTable).set(updates).where(eq(complaintsTable.id, id)).returning();

    if (department && department !== complaint.department) {
      await notifyUser(complaint.studentId, `Your complaint "${complaint.title}" has been assigned to the ${department} department.`, id);
    }

    if (status && status !== complaint.status) {
      await notifyUser(complaint.studentId, `Your complaint "${complaint.title}" status updated to: ${status}`, id);
      if (status === "Resolved") {
        await notifyUser(complaint.studentId, `Your complaint "${complaint.title}" has been resolved! Please provide feedback.`, id);
      }
    }

    const studentName = (await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, updated.studentId)).limit(1))[0]?.name;
    return res.json({ ...updated, studentName });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
