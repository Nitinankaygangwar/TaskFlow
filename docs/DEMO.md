# Demo Guide

This guide describes a realistic demo sequence using the routes and workflows that are actually implemented in the repository.

## Demo goals

The app supports:
- user registration and login
- organization creation during registration
- project lifecycle management
- task creation and filtering
- task assignment within the same organization
- org dashboard and member dashboard views
- platform-admin management operations
- background job status checks for assignment jobs

## Suggested demo flow

### 1. Start services
Start the backend and Redis/PostgreSQL dependencies as described in `docs/SETUP.md`.

For local development:

```bash
cd Backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run dev
npm run worker
```

### 2. Register a user and organization
Call:

```http
POST /api/auth/register
```

Example payload:

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "password123",
  "organizationName": "Demo Org",
  "role": "org_admin"
}
```

The response includes:
- access token
- refresh token
- organization details
- primary organization Id and role

### 3. Log in
Call:

```http
POST /api/auth/login
```

Example payload:

```json
{
  "email": "demo@example.com",
  "password": "password123"
}
```

Use the returned access token in later requests.

### 4. Create a project
Call:

```http
POST /api/projects
Authorization: Bearer <accessToken>
```

Example payload:

```json
{
  "name": "Website Redesign",
  "description": "Q3 redesign project"
}
```

### 5. Create tasks
Call:

```http
POST /api/tasks/projects/:projectId
Authorization: Bearer <accessToken>
```

Example payload:

```json
{
  "title": "Set up design review",
  "description": "Prepare the review notes and timeline",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-08-30"
}
```

### 6. List and filter tasks
Call:

```http
GET /api/tasks/projects/:projectId?status=todo&priority=high&page=1&limit=10
Authorization: Bearer <accessToken>
```

This demonstrates the repository’s actual task filtering support.

### 7. Assign a task to a member
Create a second user or use an existing org member. Then assign a task:

```http
POST /api/tasks/:taskId/assign
Authorization: Bearer <accessToken>
```

Example payload:

```json
{
  "userId": "<member-user-id>"
}
```

The app only allows same-organization assignment. This is enforced in the task service.

### 8. Review org dashboard
Call:

```http
GET /api/dashboard/org
Authorization: Bearer <accessToken>
```

This returns project counts, task counts, member counts, and recent project/task lists.

### 9. Review member dashboard
A member user can call:

```http
GET /api/dashboard/member
Authorization: Bearer <accessToken>
```

This returns assigned tasks and task counts by status.

### 10. Check job status
When assignment jobs are queued, a job id can be retrieved from the queue response path or by evaluating the app’s work queue output. The repository exposes:

```http
GET /api/jobs/:id
Authorization: Bearer <accessToken>
```

This returns job status for the job id.

## Platform admin demo

A user created with `role: "platform_admin"` can access the platform routes under `/api/platform`.

Example route:

```http
GET /api/platform/dashboard
Authorization: Bearer <platformAdminToken>
```

This demonstrates the platform-level admin capability implemented in the code.

## Demo validation

A successful demo should confirm:
- registration and login work
- organization scoping works
- project/task CRUD works
- assignment respects organization membership
- RBAC blocks unauthorized roles
- dashboard endpoints return relevant data
- queue status endpoint responds with job status
