# Blog API

A production-style, session-authenticated REST API for a small publishing platform. Built to demonstrate backend fundamentals that interviewers and portfolio reviewers look for: clear architecture, validation, authorization, security middleware, and predictable HTTP responses.

## Highlights

- Versioned REST API at `/api/v1`
- Session-based authentication with bcrypt password hashing
- Role-based access control (`user` / `admin`)
- Zod request validation and centralized error handling
- Security middleware: Helmet, CORS, rate limiting
- Paginated post listing
- Comments, likes, and view counts
- OpenAPI-style docs at `/api/docs`
- Health check endpoint for deployment monitoring

## Tech Stack

| Layer      | Choice                           |
| ---------- | -------------------------------- |
| Runtime    | Node.js 20+                      |
| Framework  | Express 4                        |
| Language   | TypeScript (strict)              |
| Database   | MongoDB + Mongoose               |
| Auth       | express-session + bcrypt         |
| Validation | Zod                              |
| Security   | Helmet, CORS, express-rate-limit |

## Architecture

```text
src/
├── app.ts              # Express app setup and middleware
├── server.ts           # Bootstrap and database connection
├── config/             # Environment and database config
├── controllers/        # Request handlers
├── docs/               # OpenAPI specification
├── interfaces/         # Domain types
├── middleware/         # Auth, errors, async wrapper
├── models/             # Mongoose schemas
├── routes/             # Versioned route definitions
├── utils/              # Shared helpers
└── validators/         # Zod schemas
```

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example file and update the values:

```bash
cp .env.example .env
```

| Variable         | Required | Description                                            |
| ---------------- | -------- | ------------------------------------------------------ |
| `MONGO_URI`      | Yes      | MongoDB connection string                              |
| `SESSION_SECRET` | Yes      | Secret for signing session cookies (min 32 chars)      |
| `PORT`           | No       | Server port. Defaults to `5000`                        |
| `NODE_ENV`       | No       | `development`, `production`, or `test`                 |
| `CORS_ORIGIN`    | No       | Allowed frontend origin. Defaults to permissive in dev |

### 3. Run locally

Development with hot reload:

```bash
pnpm dev
```

Production build:

```bash
pnpm build
pnpm start
```

## API Overview

Base URL: `/api/v1`

### Users

| Method   | Route             | Auth        | Description                 |
| -------- | ----------------- | ----------- | --------------------------- |
| `POST`   | `/users/register` | Public      | Register a new user         |
| `POST`   | `/users/login`    | Public      | Log in and create a session |
| `POST`   | `/users/logout`   | Session     | Destroy the current session |
| `GET`    | `/users/me`       | Session     | Get the authenticated user  |
| `GET`    | `/users`          | Session     | List public user profiles   |
| `GET`    | `/users/:id`      | Session     | Get one public profile      |
| `PATCH`  | `/users/:id`      | Owner/Admin | Update profile              |
| `DELETE` | `/users/:id`      | Owner/Admin | Delete account              |

### Posts

| Method   | Route                            | Auth        | Description                      |
| -------- | -------------------------------- | ----------- | -------------------------------- |
| `GET`    | `/posts`                         | Public      | List published posts (paginated) |
| `GET`    | `/posts/:id`                     | Public      | Get one post and increment views |
| `POST`   | `/posts`                         | Admin       | Create a post                    |
| `PATCH`  | `/posts/:id`                     | Admin       | Update a post                    |
| `DELETE` | `/posts/:id`                     | Admin       | Delete a post                    |
| `PUT`    | `/posts/:id/like`                | Session     | Toggle like                      |
| `GET`    | `/posts/:id/comments`            | Public      | List comments                    |
| `POST`   | `/posts/:id/comments`            | Session     | Add a comment                    |
| `PATCH`  | `/posts/:id/comments/:commentId` | Owner       | Edit a comment                   |
| `DELETE` | `/posts/:id/comments/:commentId` | Owner/Admin | Delete a comment                 |

### System

| Method | Route       | Description                |
| ------ | ----------- | -------------------------- |
| `GET`  | `/health`   | Health check               |
| `GET`  | `/api/docs` | OpenAPI specification      |
| `GET`  | `/`         | Documentation landing page |

## Response Format

Successful responses:

```json
{
  "success": true,
  "message": "Optional human-readable message",
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "message": "What went wrong"
}
```

## Example Requests

Register:

```bash
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Vedant",
    "lastName": "Kale",
    "email": "vedant@example.com",
    "username": "vedant",
    "password": "strongpassword"
  }'
```

Log in (save the session cookie):

```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "vedant",
    "password": "strongpassword"
  }'
```

List posts:

```bash
curl "http://localhost:5000/api/v1/posts?page=1&limit=10"
```

## Portfolio Talking Points

- **Layered architecture** keeps routing, validation, business logic, and persistence separate
- **Defense in depth** with validation, auth middleware, rate limits, and sanitized errors
- **Password security** via bcrypt pre-save hooks and `select: false` on password fields
- **Consistent API contract** makes the project easy to demo with Postman or a frontend
- **Operational readiness** with health checks, structured logging, and environment validation

## Deployment Notes

- Set `NODE_ENV=production`
- Use a strong `SESSION_SECRET`
- Point `MONGO_URI` to a managed MongoDB instance (Atlas, etc.)
- Set `CORS_ORIGIN` to your frontend domain
- For multi-instance deployments, replace the default memory session store with Redis

## License

MIT
