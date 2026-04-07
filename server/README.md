# STJ Backend — User registration, login, and profile

Node.js + Express + MongoDB API. Authentication is **JWT** (issued by this server after phone + password register/login). **MongoDB is the only data store** for users and sessions (tokens are stateless JWTs).

## Features

- Register and login with **phone** + **password**
- JWT in `Authorization: Bearer <token>` for protected routes
- Profile read/update
- Forgot / reset password (token stored in MongoDB; no SMS/email in this demo)
- Helmet, CORS, express-validator

## Tech stack

- Node.js, Express, Mongoose
- **jsonwebtoken** + **bcryptjs**
- MongoDB

## Project structure

```
server/
├── config/db.js
├── models/userModel.js
├── controllers/authController.js
├── routes/authRoutes.js, profileRoutes.js
├── middleware/authMiddleware.js   # JWT verification
├── services/userService.js
├── app.js
├── server.js
└── .env.example
```

## Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`: set `MONGODB_URI`, `JWT_SECRET`, and optional `ALLOWED_ORIGINS`, `JWT_EXPIRES_IN`, `MONGODB_DB_NAME`.

```bash
npm run dev
```

### Obsolete MongoDB index (legacy UID field)

If your cluster still has a **unique index** on an old optional UID field (default index name ends with `_1` on that field), registration can fail with `E11000 duplicate key`. On **every successful connect**, the server drops those indexes and unsets that field on existing documents. **Redeploy** the backend so this runs.

If cleanup fails (e.g. permissions), remove the bad index manually: **Collections → users → Indexes** → delete the unique index on the obsolete UID field (often named with `_1` suffix).

## API (summary)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Body: `name`, `phone`, `password`, optional `dob`, `birthTime`, `birthPlace` → `data.user`, `data.token` |
| POST | `/auth/login` | No | `phone`, `password` → `data.user`, `data.token` |
| GET | `/auth/verify` | Bearer JWT | Returns current user |
| POST | `/auth/forgot-password` | No | `phone` |
| POST | `/auth/reset-password` | No | `token`, `newPassword` |
| GET | `/profile` | Bearer JWT | Current user |
| PUT | `/profile` | Bearer JWT | Update `name`, `dob`, `birthTime`, `birthPlace`, `phone` |

Success envelope: `{ "success": true, "message": "...", "data": ... }`.

## Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 3000) |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB_NAME` | Optional DB name if not in URI |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `MONGO_DEV_MEMORY` | Set to `1` for in-memory MongoDB (dev only) |

## License

ISC

**Last updated**: March 28, 2026
