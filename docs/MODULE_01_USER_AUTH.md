# Module 1 — User Registration, Login & Profile

**Scope:** Frontend (Flutter), Backend (Node Express), DB (MongoDB), Auth (Backend auth with JWT + profile sync)  
**Rule:** User must **register (mobile+password) → verify mobile → login → Home**. Only after login (and mobile is verified), show other app options (josiyam, daily, chat, etc.).

---

## 1. Overview

| Layer | Responsibility |
|-------|----------------|
| **Auth (Backend JWT)** | Register/login using mobile+password, then issue a JWT for protected APIs |
| **Flutter** | Register screen, login screen, mobile-verify flow, home (post-login); hide other options until logged in (and mobile verified) |
| **Node Express** | Verify JWT on protected routes; create/update user profile in MongoDB; APIs for profile |
| **MongoDB** | Store phone + verification status + profile fields |

**Flow:** Register (name, phone (E.164 incl. country code), password) → Verify mobile (once) → Login → Home → then show rest of app.

---

## 2. Registration

### 2.1 Required Fields

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| **Name** | string | Required, min 2 chars | Display name |
| **Phone** | string | Required, E.164 with country code | Used for login + mobile verification |
| **Password** | string | Required, min 8 chars | Hashed and stored in MongoDB |

### 2.2 Optional Fields (can be collected at register or later)

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| **DOB** | date | Optional | Birth date; for joshiyam later |
| **Birth time** | time | Optional | Birth time; for joshiyam later |
| **Birth place** | string | Optional | Place of birth; for joshiyam later |

### 2.3 Mobile Verification

- After register: mobile verification is completed once (OTP verification can be added later).
- **Once verified (or treated as verified in current implementation):** backend sets the user as verified so the app can allow **login + Home**.
- App should block or limit features until mobile is verified (recommended: only allow full Home after verified).

---

## 3. Login

- **Login with:** Phone (E.164 with country code) + Password.
- Optional later: phone OTP, social login (not in this document).
- On success: backend returns a JWT + user/profile data from MongoDB (with verified status).
- Then: navigate to **Home**. Only after this, show other options (drawer/tabs: Josiyam, Daily, Chat, Profile, etc.).

---

## 4. Post-Login Rule: Home First, Then Other Options

- **Before login:** Show only **Register** and **Login** screens (and Forgot password, mobile verification if enabled).
- **After login:** Go to **Home** first. From Home (or nav), show:
  - Josiyam, Daily horoscope, Calendar, Chat, Devotional, Profile, etc.
- So: **all other modules are behind auth**; user must register → verify mobile (once) → login → Home, then other options are visible.

---

## 5. Frontend Plan (Flutter)

### 5.1 Screens / Routes

| Screen | When shown | Action |
|--------|------------|--------|
| **Splash** | App open | If JWT exists → call `GET /auth/verify` (sync user) and/or `GET /profile`; if mobile verified → Home; else → Login |
| **Register** | User taps “Register” | Form: name, phone (E.164 with country code), password; optional: DOB, time, place. Submit → `POST /auth/register` → show “Login with your phone” |
| **Verify mobile** | After register (or from Login if not verified) | Show “Verify mobile” message (OTP can be added later); optional “Resend” |
| **Login** | User taps “Login” | Phone + password → `POST /auth/login` → receive JWT + profile → navigate to Home |
| **Forgot password** | Link from Login | Enter phone → `POST /auth/forgot-password` → show “Check your phone for reset code/link” |
| **Reset password** | From reset link/deep link | Enter new password → `POST /auth/reset-password` → navigate to Login |
| **Home** | After successful login | Main landing; nav to other modules (only visible when logged in) |

### 5.2 Auth State (Flutter)

- Use the stored JWT token (issued by backend to protect backend routes):
  - If no token → show Login/Register.
  - If token exists → call `GET /auth/verify` and/or `GET /profile`.
  - If backend returns `mobileVerified=true` → Home and show other options.
  - If `mobileVerified=false` → show VerifyMobile screen and block other routes until verified.
  - If token is invalid/expired (401) → clear token and redirect to Login/Register.

### 5.3 Register Form (Flutter)

- **Required:** Name, Phone (E.164 with country code), Password (and Confirm password).
- **Optional (can be same screen or “Add later”):** DOB (date picker), Birth time (time picker), Birth place (text or place picker).
- On submit:
  1. Call `POST /auth/register` with `{ name, phone, password, dob?, birthTime?, birthPlace? }`.
  2. Backend hashes password, stores profile in MongoDB, and marks the user as verified (current implementation sets it to verified; OTP can be added later).
  3. Navigate user to Login.

### 5.4 Login Form (Flutter)

- Phone (E.164 with country code), Password.
- On submit:
  1. Call `POST /auth/login` with `{ phone, password }`.
  2. Receive `{ token: <jwt>, user }`.
  3. If `user.mobileVerified == true` → navigate to Home; else → show VerifyMobile.

### 5.5 After Login: Show Other Options

- Home screen has navigation (drawer, bottom nav, or tabs) to:
  - Josiyam, Daily, Calendar, Chat, Devotional, Profile, etc.
- These routes are **only available when** a valid auth token exists AND backend returns `mobileVerified == true`. Otherwise redirect to Login/VerifyMobile.

---

## 6. Backend Plan (Node Express)

### 6.1 Auth Middleware

- **Verify JWT** on protected routes:
  - Header: `Authorization: Bearer <jwtToken>`
  - Verify token using your JWT secret/public key.
  - Attach `req.user` with `userId`, optional `phone`, and a verified flag.

### 6.2 APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Body: `{ name, phone, password, dob?, birthTime?, birthPlace? }`. Creates/updates user profile and marks it verified for login (OTP can be added later). |
| POST | `/auth/login` | None | Body: `{ phone, password }`. Validates credentials, issues JWT, and returns `{ token, user }`. |
| GET | `/auth/verify` | JWT | Validate token and return current user data. |
| GET | `/profile` | JWT | Get current user profile fields from MongoDB. |
| PUT | `/profile` | JWT | Update profile fields: name, dob, birthTime, birthPlace, phone, etc. |

### 6.3 Registration API (POST /auth/register)

- **Input:** Unauthenticated request + Body: `{ name, phone, password, dob?, birthTime?, birthPlace? }`.
- **Logic:**
  - Hash `password` and store `passwordHash`.
  - Create or update the MongoDB user profile using `phone` as the unique key.
  - Store `phone` and profile fields.
  - Mark the user as verified for login based on the mobile flow (OTP verification can be added later).
- **Response:** `201 + { message: "registered" }` (user/profile).

### 6.4 Token Sync API (GET /auth/verify)

- **Input:** JWT-authenticated request (validated by middleware).
- **Logic:**
  - Load the user profile by `req.user.userId` (or by `phone` if you store phone in the token).
  - Return the user/profile data.
- **Response:** `200 + { user/profile }`.

### 6.5 Login (Handled by Backend)

- **Input:** Phone + Password are used only on the client to authenticate against the backend.
- **Logic:**
  - Validate credentials by comparing provided `password` against stored `passwordHash` for that `phone`.
  - Issue a JWT and return `{ token, user }`.
  - Allow app navigation to Home only when `user.mobileVerified == true`.

### 6.6 Password Reset (POST /auth/forgot-password & POST /auth/reset-password)

- **POST /auth/forgot-password**
  - **Input:** `{ phone }` (or `{ email }` later if you add email-based auth)
  - **Logic:** Always return a generic message; if user exists, generate reset token, store **hashed token + expiry**, and send the token/link via phone/SMS (implementation detail).
  - **Response:** `200 + { message: "reset_sent" }`
- **POST /auth/reset-password**
  - **Input:** `{ token, newPassword }`
  - **Logic:** Validate reset token + expiry, hash new password, update `passwordHash`, clear reset token fields.
  - **Response:** `200 + { message: "password_updated" }`

---

## 7. MongoDB Plan

### 7.1 Collection: `users` (or `profiles`)

One document per user.

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `phone` | string | Yes | Unique phone (E.164 with country code) used for login |
| `passwordHash` | string | Yes | Hashed password for phone/password auth |
| `name` | string | Yes | From register/profile |
| `mobileVerified` | boolean | Yes | Verification flag used by the app (treated as mobileVerified) |
| `dob` | date / ISODate | No | Optional; birth date |
| `birthTime` | string | No | Optional; e.g. "08:30" or ISO |
| `birthPlace` | string | No | Optional; place of birth |
| `createdAt` | date | Yes | ISODate |
| `updatedAt` | date | Yes | ISODate |

**Index:** Unique index on `phone` for fast lookup.

### 7.2 Example Document

```json
{
  "_id": ObjectId("..."),
  "phone": "+919876543210",
  "name": "Ramesh",
  "mobileVerified": true,
  "passwordHash": "$2b$10$...",
  "dob": ISODate("1990-05-15"),
  "birthTime": "08:30",
  "birthPlace": "Chennai",
  "createdAt": ISODate("2025-03-09T10:00:00Z"),
  "updatedAt": ISODate("2025-03-09T10:00:00Z")
}
```

### 7.3 Optional: Separate `profiles` Collection

If you prefer to keep “auth” and “profile” separate:

- **users:** phone, passwordHash, mobileVerified, createdAt (minimal auth).
- **profiles:** userId (ref to users._id), name, dob, birthTime, birthPlace, updatedAt.

For simplicity, one collection `users` with all fields above is enough for Module 1.

---

## 8. Flow Summary

```
[App Open] → Splash
    → Not logged in → Login / Register
        → Register: Name, Phone (E.164 with country code), Password (+ optional DOB, time, place)
            → Backend: POST /auth/register → MongoDB upsert user (hash password) + mark verified for login
            → Show “Login with your phone”
        → Login: Phone, Password
            → Backend: POST /auth/login → issue JWT + return user/profile
            → Navigate to Home
    → Logged in → Splash calls GET /auth/verify; if mobileVerified -> Home; else -> VerifyMobile
    → Home → Show other options (Josiyam, Daily, Chat, etc.)
```

---

## 9. Checklist (Implementation)

### Frontend (Flutter)

- [ ] Splash; auth state check; route to Login/Register or Home
- [ ] Register screen: name, phone (E.164 incl. country code), password (required); DOB, time, place
- [ ] Mobile verification: mark verified for login (OTP can be added later); “Verify mobile” / “Resend” UI optional
- [ ] Login screen: phone, password; call `POST /auth/login` and store JWT; load profile/user
- [ ] Forgot password (reset token flow)
- [ ] Home screen; only show after login
- [ ] Guard all other modules: show only when user is logged in (JWT valid) and backend returns `mobileVerified == true`
- [ ] Call `POST /auth/register` then `POST /auth/login`; protect APIs with `Authorization: Bearer <jwtToken>`

### Backend (Node Express)

- [ ] JWT middleware: verify `Authorization: Bearer <jwtToken>` and attach `req.user`
- [ ] POST `/auth/register`: upsert user (hash password + profile) and mark verified for login
- [ ] GET `/auth/verify`: validate token and return user profile from MongoDB
- [ ] GET `/profile` and PUT `/profile`: fetch/update profile fields

### MongoDB

- [ ] Collection: users (or profiles)
- [ ] Schema: phone (unique), passwordHash, name, mobileVerified, dob, birthTime, birthPlace, createdAt, updatedAt

---

*End of Module 1 document.*
