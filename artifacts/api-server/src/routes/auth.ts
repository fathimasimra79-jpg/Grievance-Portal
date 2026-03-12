import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, hashPassword, comparePassword, authenticate, AuthRequest } from "../lib/auth.js";

const router = Router();

// Admin credentials
const ADMIN_EMAIL = "admin@university.edu";
const ADMIN_PASSWORD = "admin@2026";

// Per-department credentials: email → { password, departmentName, displayName }
const DEPARTMENT_CREDENTIALS: Record<string, { password: string; department: string; name: string }> = {
  "academics@university.edu":   { password: "acad@2026",      department: "Academics",      name: "Academics Department" },
  "facilities@university.edu":  { password: "facil@2026",     department: "Facilities",     name: "Facilities Department" },
  "hostel@university.edu":      { password: "hostel@2026",    department: "Hostel",         name: "Hostel Department" },
  "faculty@university.edu":     { password: "faculty@2026",   department: "Faculty",        name: "Faculty Affairs" },
  "admin-dept@university.edu":  { password: "admindept@2026", department: "Administration", name: "Administration Department" },
  "others@university.edu":      { password: "others@2026",    department: "Others",         name: "Others Department" },
};

// Seed all system users (admin + departments) on first use
async function ensureSystemUser(
  email: string,
  password: string,
  name: string,
  role: string,
  department?: string
) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) return existing[0];
  const hashed = await hashPassword(password);
  const [created] = await db.insert(usersTable).values({
    name,
    email,
    password: hashed,
    role,
    department: department ?? null,
  }).returning();
  return created;
}

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
      department: null,
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

    // --- Admin login ---
    if (role === "admin") {
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Invalid admin credentials" });
      }
      const user = await ensureSystemUser(ADMIN_EMAIL, ADMIN_PASSWORD, "Administrator", "admin");
      const token = signToken({ id: user.id, email: user.email, role: "admin", name: user.name });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: "admin", department: null } });
    }

    // --- Department login ---
    if (role === "department") {
      const cred = DEPARTMENT_CREDENTIALS[email.toLowerCase()];
      if (!cred || password !== cred.password) {
        return res.status(401).json({ error: "Invalid department credentials" });
      }
      const user = await ensureSystemUser(email.toLowerCase(), cred.password, cred.name, "department", cred.department);
      // Always sync department in case row already existed without it
      if (!user.department) {
        await db.update(usersTable).set({ department: cred.department }).where(eq(usersTable.id, user.id));
        user.department = cred.department;
      }
      const token = signToken({ id: user.id, email: user.email, role: "department", name: user.name, department: cred.department });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: "department", department: cred.department } });
    }

    // --- Student login ---
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
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, department: null } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", authenticate, (req: AuthRequest, res) => {
  const user = req.user!;
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, department: user.department ?? null });
});

export default router;
