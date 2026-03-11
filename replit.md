# Workspace

## Overview

Student Grievance Redressal System — a full-stack university portal for submitting, tracking, and resolving student complaints.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (artifacts/grievance-portal)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── grievance-portal/   # React + Vite frontend
│   └── api-server/         # Express API server
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
```

## Authentication

- **Students**: Register with name/email/password, login with role=student
- **Admin**: email=admin@university.edu, password=admin123, role=admin
- **Department**: email=admin@university.edu, password=admin123, role=department
- JWT stored in localStorage as 'token'

## Database Tables

- `users` — id, name, email, password, role, created_at
- `complaints` — id, student_id, title, description, category, department, status, created_at
- `responses` — id, complaint_id, staff_id, message, created_at
- `notifications` — id, user_id, complaint_id, message, is_read, created_at
- `feedback` — id, complaint_id, rating, comment, created_at

## Complaint Categories

Academics, Facilities, Hostel, Faculty, Administration, Others

## Complaint Statuses

Pending → In Review → In Progress → Resolved

## API Routes

All routes prefixed with `/api`:
- `POST /auth/register` — student registration
- `POST /auth/login` — login (role: student|admin|department)
- `GET /auth/me` — current user
- `GET/POST /complaints` — list/create complaints
- `GET/PATCH /complaints/:id` — get/update complaint
- `GET/POST /complaints/:id/responses` — responses
- `GET/POST /complaints/:id/feedback` — feedback
- `GET /notifications` — list notifications
- `PATCH /notifications/:id/read` — mark read
- `PATCH /notifications/mark-all-read` — mark all read
- `GET /admin/analytics` — analytics data

## Notification System

Notifications trigger on:
1. Student submits complaint → notifies Admin
2. Admin assigns department → notifies Student
3. Status update → notifies Student
4. Complaint resolved → notifies Student
5. Feedback submitted → notifies Admin
