# Submission Guide

This document summarizes what to verify before submitting the project and what to include in the final delivery.

## Required repository artifacts

The repository should include:
- root `README.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/SETUP.md`
- `docs/SECURITY.md`
- `docs/DEMO.md`
- `docs/SUBMISSION.md`
- `docs/openapi.yaml`
- `.env.example` in the project root if used for local environment setup

## Source verification checklist

Before submission, confirm the following against the code:

### Backend stack
- Express server configuration in `Backend/src/app.js`
- Prisma schema in `Backend/prisma/schema.prisma`
- PostgreSQL connection in `Backend/src/config/db.js`
- Redis connection in `Backend/src/config/redis.js`
- BullMQ queue in `Backend/src/queue/email.queue.js`
- Worker in `Backend/src/queue/email.worker.js`

### Auth and RBAC
- JWT generation in `Backend/src/utils/jwt.js`
- Auth middleware in `Backend/src/middleware/auth.middleware.js`
- RBAC checks in `Backend/src/middleware/rbac.middleware.js`
- Platform auth middleware in `Backend/src/middleware/authz.middleware.js`

### API coverage
- `Backend/src/routes/auth.routes.js`
- `Backend/src/routes/project.routes.js`
- `Backend/src/routes/task.routes.js`
- `Backend/src/routes/member.routes.js`
- `Backend/src/routes/dashboard.routes.js`
- `Backend/src/routes/job.routes.js`
- `Backend/src/routes/platform.routes.js`

### Documentation correctness
- README reflects actual startup commands and stack
- Setup guide matches `Backend/package.json` scripts
- Demo guide uses actual routes available in the app
- Security guide describes only implemented protections
- OpenAPI spec reflects the real route list and names

## Validation commands

Run the backend test suite:

```bash
cd Backend
npm test
```

Run the app locally if needed:

```bash
cd Backend
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run dev
```

For the worker:

```bash
cd Backend
npm run worker
```

For Docker-based local validation:

```bash
docker compose up --build
```

## Final submission content

A complete submission should include:
1. working backend and frontend code
2. verified docs
3. environment template
4. setup instructions
5. route reference and architecture notes
6. security summary grounded in the implemented code

## Submission note

The repository does not include undocumented APIs or extra features beyond what is implemented in the code. This package therefore prioritizes documentation accuracy over invented functionality.
