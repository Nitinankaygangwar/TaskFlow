# API Reference

This document describes the API routes implemented in the repository as of the current codebase. It is based directly on the route declarations in the backend source.

## Base URL

Local development default:

- http://localhost:5000

The app also exposes Swagger UI at:

- http://localhost:5000/api-docs

## Authentication model

Authenticated routes require an access token in the HTTP header:

```http
Authorization: Bearer <accessToken>
```

The backend also accepts organization context through:

- `x-org-id` header
- `organizationId` query parameter
- `org_id` query parameter
- `orgId` route param
- `organizationId` / `org_id` in request body

For regular users, the middleware resolves the user’s organization from `OrgMember` records.

## Header and role notes

- `platform_admin` users bypass organization-scoped checks
- `org_admin` has org-admin permissions
- `member` is the standard org member role
- some endpoints are restricted by route-level role checks

## Auth endpoints

### POST /api/auth/register
Creates a user and an organization.

Request body (validated with Zod):
- `name`: string
- `email`: string
- `password`: string
- `organizationName`: string
- `role`: optional enum: `platform_admin`, `org_admin`, `member`

Response fields included in the controller:
- `user`
- `organization`
- `organizations`
- `primaryOrganizationId`
- `primaryOrganizationRole`
- `accessToken`
- `token`
- `refreshToken`

### POST /api/auth/login
Authenticates a user.

Request body:
- `email`: string
- `password`: string

Response fields:
- `user`
- `organizations`
- `primaryOrganizationId`
- `primaryOrganizationRole`
- `accessToken`
- `token`
- `refreshToken`

### POST /api/auth/refresh
Refreshes an access token using a refresh token.

Request body:
- `refreshToken`: string

Response fields:
- `accessToken`
- `refreshToken`
- `organizationId`
- `role`

### POST /api/auth/logout
Requires authentication.

Request body or header:
- `refreshToken` in JSON body
- or `x-refresh-token` header

Validates user identity and revokes the specific refresh token.

### POST /api/auth/logout-all
Requires authentication.

Revokes all stored refresh tokens for the authenticated user.

## Project endpoints

All project routes require authentication through `authMiddleware`.

### GET /api/projects
Lists projects in the current user organization.

### POST /api/projects
Requires `org_admin`.

Request body is validated by `projectSchema` and includes:
- `name`: string
- `description`: optional string

### GET /api/projects/:projectId
Gets a project by id within the current organization.

### PATCH /api/projects/:projectId
Requires `org_admin`.

Request body is validated by `projectUpdateSchema`.

### DELETE /api/projects/:projectId
Requires `org_admin`.

Returns a deleted result object.

## Task endpoints

All task routes require authentication.

### GET /api/tasks/projects/:projectId
Lists tasks for a project.

Query parameters supported by `taskFilterSchema`:
- `status`
- `priority`
- `assignee` (UUID)
- `dueDateFrom`
- `dueDateTo`
- `search`
- `page`
- `limit`

### POST /api/tasks/projects/:projectId
Requires `org_admin` or `member`.

Request body includes:
- `title`: string
- `description`: optional string
- `status`: optional enum (`todo`, `in_progress`, `review`, `done`)
- `priority`: optional enum (`low`, `medium`, `high`, `urgent`)
- `dueDate`: optional ISO date string or `YYYY-MM-DD`

### GET /api/tasks/projects/:projectId/dashboard
Returns project-level dashboard counts by task status.

### PATCH /api/tasks/bulk-status
Requires `org_admin` or `member`.

Request body:
- `taskIds`: array of UUID strings
- `status`: one of `todo`, `in_progress`, `review`, `done`

### GET /api/tasks/:taskId
Gets a task by id within the current organization.

### PATCH /api/tasks/:taskId
Requires `org_admin` or `member`.

Supports partial update of task fields.

### DELETE /api/tasks/:taskId
Requires `org_admin`.

### POST /api/tasks/:taskId/assign
Requires `org_admin` or `member`.

Request body:
- `userId`: UUID

Validation checks that the assignee belongs to the same organization as the task.

### POST /api/tasks/:taskId/unassign
Requires `org_admin` or `member`.

Request body:
- `userId`: UUID

## Member endpoints

All member routes require authentication.

### GET /api/members
Lists members in the current organization.

### POST /api/members
Requires `org_admin`.

Request body:
- `email`: string

Adds a user to the current organization as a member.

### PATCH /api/members/:memberId
Requires `org_admin`.

Request body:
- `role`: `org_admin` or `member`

### DELETE /api/members/:memberId
Requires `org_admin`.

Removes a member from the organization.

## Dashboard endpoints

### GET /api/dashboard/org
Requires authentication and `org_admin`.

Returns org admin dashboard totals and recent items.

### GET /api/dashboard/member
Requires authentication and `member`.

Returns tasks assigned to the current user and status counts.

## Job status endpoint

### GET /api/jobs/:id
Requires authentication.

Returns the status of a BullMQ job by id.

Access control is enforced so the job’s `organizationId` must match the requesting user’s organization context.

## Platform admin endpoints

All routes under `/api/platform` require authenticated `platform_admin` access via `authz.middleware.js`.

### GET /api/platform/dashboard
### GET /api/platform/organizations
### POST /api/platform/organizations
### GET /api/platform/organizations/:organizationId
### PATCH /api/platform/organizations/:organizationId
### DELETE /api/platform/organizations/:organizationId
### GET /api/platform/users
### GET /api/platform/users/:userId
### PATCH /api/platform/users/:userId/role
### DELETE /api/platform/users/:userId
### POST /api/platform/organizations/:organizationId/members
### PATCH /api/platform/organizations/:organizationId/members/:userId/promote

These routes are implemented in `platform.controller.js` and are used for platform-level administration.

## Error behavior

The app defines a custom error handler in `Backend/src/middleware/error.middleware.js`.

Typical patterns in the code include:
- validation errors
- auth failures
- forbidden access
- not found errors
- duplicate assignment or duplicate membership errors

## Health endpoint

### GET /health
The application exposes a simple health check endpoint at root level.

Response shape in the app code:

```json
{ "ok": true, "service": "taskflow-api" }
```
