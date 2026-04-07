# STJ Backend documentation (Module 1)

## Purpose

REST API for user registration, login, JWT session handling, and profile CRUD. The Flutter client talks to this service over HTTPS. Credentials are **phone + password** (bcrypt hash in MongoDB). Auth is **JWT only**, issued by this server—**no third-party auth providers**.

## Stack

- Express, Mongoose, MongoDB  
- `jsonwebtoken` for access tokens  
- `express-validator` for request validation  

## User model (Mongoose)

- `phone` — required, unique, indexed  
- `passwordHash` — required, `select: false`  
- `name`, `mobileVerified`, `dob`, `birthTime`, `birthPlace`  
- `resetTokenHash`, `resetTokenExpires` (password reset flow)  
- `timestamps` → `createdAt`, `updatedAt`  

## Auth middleware

`Authorization: Bearer <jwt>` — `jwt.verify` with `JWT_SECRET`. Attaches `req.user.userId`, `phone`, `mobileVerified`.

## Endpoints

See `README.md` for the route table. Implementations live in `controllers/authController.js`, `services/userService.js`, and `routes/authRoutes.js` / `profileRoutes.js`.

## MongoDB: obsolete uid field / index

Some databases still have a **unique index** on an old optional UID column that this API does not use. That causes `E11000 duplicate key` on new registrations. After each connect, `config/db.js` drops indexes on that field and removes the field from existing documents. Deploy the latest server so this runs against production.

## Security

- Use strong `JWT_SECRET` and HTTPS in production.  
- Validate all inputs; never return `passwordHash` in JSON (`toJSON` transform strips it).  

**Last updated**: March 28, 2026
