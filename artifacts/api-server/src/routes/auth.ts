import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, hashPassword, comparePassword, authenticate, AuthRequest } from "../lib/auth.js";

const router = Router();

const ADMIN_EMAIL = "admin@university.edu";
const ADMIN_PASSWORD = "admin@2026";

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const hashed = await hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      name,
      email,
      password: hashed,
      role: "student",
    }).returning();
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required" });
    }

    if (role === "admin" || role === "department") {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        let adminUser = await db.select().from(usersTable).where(eq(usersTable.email, ADMIN_EMAIL)).limit(1);
        if (adminUser.length === 0) {
          const hashed = await hashPassword(ADMIN_PASSWORD);
          const [created] = await db.insert(usersTable).values({
            name: role === "admin" ? "Administrator" : "Department Staff",
            email: ADMIN_EMAIL,
            password: hashed,
            role: "admin",
          }).returning();
          adminUser = [created];
        }
        const user = adminUser[0];
        const token = signToken({ id: user.id, email: user.email, role: role, name: user.name });
        return res.json({
          token,
          user: { id: user.id, name: user.name, email: user.email, role: role },
        });
      }
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = users[0];
    if (user.role !== "student") {
      return res.status(401).json({ error: "Invalid credentials for student login" });
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", authenticate, (req: AuthRequest, res) => {
  const user = req.user!;
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

export default router;
