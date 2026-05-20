# Blog API

A session-authenticated REST API for a small publishing platform. It supports users, admin-only post management, comments, likes, view counts, and MongoDB persistence.

This project is intentionally compact, but it now highlights the things a backend portfolio project should show: authentication, authorization, validation, clear setup, and predictable HTTP responses.

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- express-session
- bcrypt

## Features

- User registration and login with hashed passwords
- Session-based authentication
- Role-based authorization for admin post management
- Published post listing and individual post lookup
- Post view counts
- Like and unlike behavior per authenticated user
- Comment creation, editing, and deletion
- Owner/admin checks for protected mutations
- Health check endpoint for deployment monitoring

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
MONGO_URI=mongodb+srv://username:password@cluster.example.mongodb.net/blog-api
SESSION_SECRET=replace-this-with-a-long-random-secret
PORT=5000
```

Build and run:

```bash
npm run build
npm start
```

For local development, rebuild after TypeScript changes before running `npm start`.

## Environment Variables

| Name | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string. `MONGOURI` is also supported for backward compatibility. |
| `SESSION_SECRET` | Yes | Secret used to sign session cookies. |
| `PORT` | No | Server port. Defaults to `5000`. |

## Endpoints

### System

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Returns API health status. |
| `GET` | `/` | Public | Serves the documentation landing page. |

### Users

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/user` | Public | Register a user. |
| `POST` | `/user/auth` | Public | Log in and create a session. |
| `POST` | `/user/logout` | Session | Destroy the current session. |
| `GET` | `/user` | Session | List public user profiles. |
| `GET` | `/user/:id` | Session | Get one public user profile. |
| `PUT` | `/user/:id` | Owner/Admin | Update first or last name. |
| `DELETE` | `/user/:id` | Owner/Admin | Delete a user account. |

### Posts

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/post` | Public | List published posts. |
| `GET` | `/post/:post` | Public | Get one post and increment views. |
| `POST` | `/post` | Admin | Create a post. |
| `PUT` | `/post/:post` | Admin | Update a post. |
| `DELETE` | `/post/:post` | Admin | Delete a post. |
| `PUT` | `/post/:post/like` | Session | Like or unlike a post. |
| `POST` | `/post/:post/comments` | Session | Add a comment. |
| `GET` | `/post/:post/comments` | Session | Get comments for a post. |
| `PUT` | `/post/:postId/:commentId` | Owner | Edit a comment. |
| `DELETE` | `/post/:postId/:commentId` | Owner/Admin | Delete a comment. |

## Example Requests

Register:

```json
{
  "firstName": "Vedant",
  "lastName": "Sharma",
  "email": "vedant@example.com",
  "username": "vedant",
  "password": "strongpassword"
}
```

Log in:

```json
{
  "username": "vedant",
  "password": "strongpassword"
}
```

Create a post as an admin:

```json
{
  "title": "Designing a Blog API",
  "content": "A practical walkthrough of building a session-authenticated API.",
  "tags": "node, express, mongodb"
}
```

Create a comment:

```json
{
  "text": "This was helpful."
}
```

## Response Codes

- `200` successful read, update, delete, login, or like action
- `201` successful creation
- `400` invalid or missing request data
- `401` authentication required
- `403` authenticated but not allowed
- `404` resource not found
- `409` duplicate user credentials
- `500` unexpected server error

## Portfolio Notes

This project is best presented as a focused backend API. Strong talking points include:

- Fixing authorization bugs and enforcing role checks
- Moving database startup into the server bootstrap flow
- Adding validation before database operations
- Avoiding password/email leakage in public user responses
- Keeping the codebase small enough to explain clearly in an interview
