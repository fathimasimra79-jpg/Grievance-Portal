import { Router } from "express";
import { db, responsesTable, complaintsTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticate, requireRole, AuthRequest } from "../lib/auth.js";

const router = Router({ mergeParams: true });

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    const responses = await db
      .select({
        id: responsesTable.id,
        complaintId: responsesTable.complaintId,
        staffId: responsesTable.staffId,
        staffName: usersTable.name,
        message: responsesTable.message,
        createdAt: responsesTable.createdAt,
      })
      .from(responsesTable)
      .leftJoin(usersTable, eq(responsesTable.staffId, usersTable.id))
      .where(eq(responsesTable.complaintId, complaintId))
      .orderBy(desc(responsesTable.createdAt));

    return res.json({ responses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticate, requireRole("admin", "department"), async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const complaintId = parseInt(req.params.id);
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const complaint = await db.select().from(complaintsTable).where(eq(complaintsTable.id, complaintId)).limit(1);
    if (complaint.length === 0) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const [response] = await db.insert(responsesTable).values({
      complaintId,
      staffId: user.id,
      message,
    }).returning();

    await db.insert(notificationsTable).values({
      userId: complaint[0].studentId,
      complaintId,
      message: `New response on your complaint "${complaint[0].title}": ${message.slice(0, 60)}${message.length > 60 ? "..." : ""}`,
      isRead: false,
    });

    return res.status(201).json({ ...response, staffName: user.name });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
