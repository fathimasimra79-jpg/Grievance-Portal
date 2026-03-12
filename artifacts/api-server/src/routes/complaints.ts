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

async function getDepartmentUserId(departmentName: string): Promise<number | null> {
  const deptUsers = await db.select()
    .from(usersTable)
    .where(and(eq(usersTable.role, "department"), eq(usersTable.department, departmentName)))
    .limit(1);
  return deptUsers.length > 0 ? deptUsers[0].id : null;
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
      // Students see only their own complaints
      filtered = filtered.filter(c => c.studentId === user.id);
    } else if (user.role === "department") {
      // Department users see ONLY complaints assigned to their specific department
      filtered = filtered.filter(c => c.department === user.department);
    }
    // Admin sees all complaints (no filter)

    if (status) filtered = filtered.filter(c => c.status === status);
    if (category) filtered = filtered.filter(c => c.category === category);
    if (department && user.role === "admin") filtered = filtered.filter(c => c.department === department);

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

    // Notify admin of new complaint
    const adminId = await getAdminId();
    if (adminId) {
      await notifyUser(adminId, `New complaint submitted: "${title}" by ${user.name}`, complaint.id);
    }

    return res.status(201).json({ ...complaint, studentName: user.name });
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

    const updates: Record<string, string> = {};
    if (status) updates.status = status;
    if (department) updates.department = department;

    const [updated] = await db.update(complaintsTable).set(updates).where(eq(complaintsTable.id, id)).returning();

    // Notify department user when assigned
    if (department && department !== complaint.department) {
      // Notify the specific department user
      const deptUserId = await getDepartmentUserId(department);
      if (deptUserId) {
        await notifyUser(deptUserId, `Complaint #${id} "${complaint.title}" has been assigned to your department.`, id);
      }
      // Also notify the student
      await notifyUser(complaint.studentId, `Your complaint "${complaint.title}" has been assigned to the ${department} department.`, id);
    }

    // Notify student on status change
    if (status && status !== complaint.status) {
      await notifyUser(complaint.studentId, `Your complaint "${complaint.title}" status updated to: ${status}`, id);
      if (status === "Resolved") {
        await notifyUser(complaint.studentId, `Your complaint "${complaint.title}" has been resolved! Please leave feedback.`, id);
      }
    }

    const studentRow = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, updated.studentId)).limit(1);
    return res.json({ ...updated, studentName: studentRow[0]?.name ?? "" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
