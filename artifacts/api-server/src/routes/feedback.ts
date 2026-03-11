import { Router } from "express";
import { db, feedbackTable, complaintsTable, notificationsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, requireRole, AuthRequest } from "../lib/auth.js";

const router = Router({ mergeParams: true });

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    const result = await db.select().from(feedbackTable).where(eq(feedbackTable.complaintId, complaintId)).limit(1);
    if (result.length === 0) {
      return res.status(404).json({ error: "No feedback found" });
    }
    return res.json(result[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticate, requireRole("student"), async (req: AuthRequest, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const complaint = await db.select().from(complaintsTable).where(eq(complaintsTable.id, complaintId)).limit(1);
    if (complaint.length === 0) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const existing = await db.select().from(feedbackTable).where(eq(feedbackTable.complaintId, complaintId)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Feedback already submitted for this complaint" });
    }

    const [feedback] = await db.insert(feedbackTable).values({
      complaintId,
      rating,
      comment: comment || null,
    }).returning();

    const adminUsers = await db.select().from(usersTable).where(eq(usersTable.email, "admin@university.edu")).limit(1);
    if (adminUsers.length > 0) {
      await db.insert(notificationsTable).values({
        userId: adminUsers[0].id,
        complaintId,
        message: `Student submitted feedback (${rating}/5 stars) for complaint "${complaint[0].title}"`,
        isRead: false,
      });
    }

    return res.status(201).json(feedback);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
