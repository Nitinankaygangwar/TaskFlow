# Security Overview

This document describes the security controls that are implemented in the current repository code.

## Authentication

The backend authenticates users with JWTs generated through `Backend/src/utils/jwt.js`.

Two token types are defined in the application code:
- access token
- refresh token

The token payload includes:
- `sub` (user id)
- `type` (`access` or `refresh`)
- `jti` (UUID generated per token)

Tokens are verified using the configured secret values:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

## Refresh token storage and rotation

The app stores refresh tokens in the database as hash values in the `RefreshToken` table.

This flow is implemented in `Backend/src/services/auth.service.js`:
- refresh tokens are hashed with SHA-256 before storage
- each refresh token is checked for validity and revocation
- token rotation invalidates the previous token after issuance of a new one
- logout can revoke a single refresh token or all sessions for a user

## Authorization

Authorization is implemented in route middleware and role checks.

Known roles in the schema and code:
- `platform_admin`
- `org_admin`
- `member`

The middleware validates:
- authentication presence
- organization membership for non-platform-admin users
- required role for protected endpoints

Examples from the code:
- project creation and update require `org_admin`
- task modification routes allow `org_admin` and `member`
- member management requires `org_admin`
- platform routes require `platform_admin`

## Tenant boundary enforcement

The application enforces tenant isolation by requiring organization context for non-platform-admin users.

Examples from the code:
- users are resolved to an organization from their memberships
- endpoints fetch data using `organizationId`
- task assignment checks if the assignee belongs to the same organization
- job status checks compare job data organizationId with the user’s organization

## Data validation

The application validates incoming requests with Zod.

Actual validation rules from the repository include:
- email validation
- password minimum length
- UUID validation on assignee and task IDs
- enum validation for role, status, and priority values
- date-only and ISO datetime support for due dates

## HTTP protections

The Express app sets up:
- CORS middleware
- Helmet security headers
- JSON body parsing with a request size limit of 1MB
- rate limiting specifically on the auth routes through `authRateLimiter`

These are configured in `Backend/src/app.js` and `Backend/src/middleware/rateLimit.middleware.js`.

## Secret management

The application expects the secrets to be provided through environment variables:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `DATABASE_URL`
- `REDIS_URL`

The `.env.example` file in `Backend` documents the expected values in local development.

## Password handling

Passwords are hashed using bcrypt, and the cost is set from:

- `BCRYPT_ROUNDS`

This is used in the auth service when creating or validating user credentials.

## Background job safety

BullMQ is configured with:
- retry attempts
- exponential backoff
- dead-letter queue on failure

This is implemented in `Backend/src/queue/email.worker.js`.

## Security limits in this repository

This codebase does not expose a broader production security model beyond the implemented protections above. The repository code currently demonstrates:
- JWT auth
- HTTPS/HTTP header protections
- role checks
- org-bound access enforcement
- hashed refresh tokens
- validation and rate limiting

It does not define additional production security layers beyond those present in the source.
