# TaskFlow

TaskFlow is a multi-tenant project and task management application built with a Node.js/Express backend, Prisma with PostgreSQL, Redis + BullMQ background jobs, and a React + Vite frontend.

## Repository layout

- `Backend/` — Express API, Prisma schema, queue worker, Docker config, tests
- `Frontend/` — Vite React application
- `docs/` — project documentation and API reference

## Tech stack

### Backend
- Node.js
- Express 5
- PostgreSQL via Prisma ORM
- Redis via ioredis
- BullMQ background job processing
- JWT-based authentication
- Zod request validation
- Swagger/OpenAPI docs

### Frontend
- React 19
- Vite
- React Router
- Axios

## Runtime architecture

The backend starts from `Backend/src/server.js`, initializes Prisma, and listens on the configured port (default `5000`). The Express app is defined in `Backend/src/app.js` and exposes the API routes under `/api`.

The app uses:
- JWT access tokens for authenticated requests
- refresh tokens persisted in the database with revocation support
- multi-tenant organization scoping using `organizationId`
- `platform_admin`, `org_admin`, and `member` roles
- BullMQ queue processing for assignment notification jobs

## Environment variables

The backend uses the variables defined in `Backend/.env.example` and the active runtime environment file in `Backend/.env`.

Current variables in the codebase:

- `PORT` — API port, default `5000`
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_ACCESS_SECRET` — JWT access token secret
- `JWT_REFRESH_SECRET` — JWT refresh token secret
- `JWT_ACCESS_EXPIRES_IN` — access token expiry, default `15m`
- `JWT_REFRESH_EXPIRES_IN` — refresh token expiry, default `7d`
- `BCRYPT_ROUNDS` — bcrypt cost rounds, default `12`
- `NODE_ENV` — runtime environment

## Backend quick start

From the `Backend` directory:

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Start the worker separately:

```bash
npm run worker
```

## Tests

```bash
npm test
```

The Jest suite covers auth, cross-tenant access, task CRUD, validation, job status, and pagination logic.

## Docker

From the `Backend` directory:

```bash
docker compose up --build
```

This configuration starts the API, worker, PostgreSQL, and Redis services defined in `Backend/docker-compose.yml`.

## API documentation

The app exposes Swagger UI at:

- `http://localhost:5000/api-docs`

The generated OpenAPI definition is configured in `Backend/src/docs/openapi.js` and the YAML reference is in `docs/openapi.yaml`.

## Documentation index

- `docs/ARCHITECTURE.md` — architecture and component flow
- `docs/API.md` — route inventory and auth/role model
- `docs/SETUP.md` — local and Docker setup guide
- `docs/SECURITY.md` — security controls implemented in code
- `docs/DEMO.md` — sample workflow for demonstrating the app
- `docs/openapi.yaml` — OpenAPI document derived from the current implementation

## Important implementation notes

- Organization context is required for regular users and is selected from the authenticated user’s memberships.
- `platform_admin` users bypass organization context checks.
- Project and task routes enforce org membership and role access rules.
- Task assignment is restricted to users in the same organization.
- Redis/BullMQ jobs are used for task-assignment email notification processing.
- Refresh tokens are stored as hashes and revoked on logout or rotation.
