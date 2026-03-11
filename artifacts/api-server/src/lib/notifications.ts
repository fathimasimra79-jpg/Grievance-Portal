import { db, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function createNotification(
  userId: number,
  message: string,
  complaintId?: number
): Promise<void> {
  await db.insert(notificationsTable).values({
    userId,
    message,
    complaintId: complaintId ?? null,
    isRead: false,
  });
}

export async function getAdminUserId(): Promise<number | null> {
  const { db: dbConn, usersTable } = await import("@workspace/db");
  const admins = await dbConn.select().from(usersTable).where(eq(usersTable.role, "admin")).limit(1);
  return admins.length > 0 ? admins[0].id : null;
}
