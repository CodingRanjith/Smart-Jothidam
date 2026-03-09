# Module 1 — User Registration, Login & Profile

**Scope:** Frontend (Flutter), Backend (Node Express), DB (MongoDB), Auth (Firebase)  
**Rule:** User must **register → verify email → login → Home**. Only after login, show other app options (josiyam, daily, chat, etc.).

---

## 1. Overview

| Layer | Responsibility |
|-------|----------------|
| **Firebase Auth** | Register, login, email verification, password reset, token (UID) |
| **Flutter** | Register screen, login screen, email-verify flow, home (post-login); hide other options until logged in |
| **Node Express** | Verify Firebase token; create/update user profile in MongoDB; APIs for profile |
| **MongoDB** | Store user profile (name, email, DOB, time, place, phone, etc.) linked to Firebase UID |

**Flow:** Register (name, email, password) → Verify email (once) → Login → Home → then show rest of app.

---

## 2. Registration

### 2.1 Required Fields

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| **Name** | string | Required, min 2 chars | Display name |
| **Email** | string | Required, valid email | Used for login; must be verified once |
| **Password** | string | Required, min 6 chars (Firebase) | Firebase Auth |

### 2.2 Optional Fields (can be collected at register or later)

| Field | Type | Validation | Notes |
|-------|------|------------|--------|
| **DOB** | date | Optional | Birth date; for joshiyam later |
| **Birth time** | time | Optional | Birth time; for joshiyam later |
| **Birth place** | string | Optional | Place of birth; for joshiyam later |
| **Phone** | string | Optional | E.164 or national format; for OTP/login later if needed |

### 2.3 Email Verification

- After register: send **verify email** (Firebase: `sendEmailVerification`).
- **Once verified:** user can use “Login”; optionally allow “resend verification email.”
- App can **block or limit** features until email is verified (e.g. only allow login after verification, or show banner “Verify email to continue”).

---

## 3. Login

- **Login with:** Email + Password (Firebase Auth).
- Optional later: Google sign-in, phone OTP (not in this document).
- On success: Firebase returns **idToken** and **uid**. App sends token to Node backend; backend verifies token and returns/creates profile from MongoDB.
- Then: navigate to **Home**. Only after this, show other options (drawer/tabs: Josiyam, Daily, Chat, Profile, etc.).

---

## 4. Post-Login Rule: Home First, Then Other Options

- **Before login:** Show only **Register** and **Login** screens (and Forgot password, Verify email).
- **After login:** Go to **Home** first. From Home (or nav), show:
  - Josiyam, Daily horoscope, Calendar, Chat, Devotional, Profile, etc.
- So: **all other modules are behind auth**; user must register → verify email (once) → login → Home, then other options are visible.

---

## 5. Frontend Plan (Flutter)

### 5.1 Screens / Routes

| Screen | When shown | Action |
|--------|------------|--------|
| **Splash** | App open | Check auth state → if logged in → Home; else → Login/Register choice |
| **Register** | User taps “Register” | Form: name, email, password; optional: DOB, time, place, phone. Submit → Firebase createUser → send verify email → show “Check your email” |
| **Verify email** | After register (or from Login if not verified) | Show “Verify email” message; “Resend” button; “Open mail app” link; optional “Continue” only after verified |
| **Login** | User taps “Login” | Email + password → Firebase signIn → get token → call backend “sync profile” → navigate to Home |
| **Forgot password** | Link from Login | Firebase sendPasswordResetEmail |
| **Home** | After successful login | Main landing; nav to other modules (only visible when logged in) |

### 5.2 Auth State (Flutter)

- Use **Firebase Auth** auth state listener:
  - `user == null` → show Login/Register.
  - `user != null` and `user.emailVerified == true` → treat as logged in → Home and show other options.
  - Optional: if `user != null` but `!emailVerified` → show “Verify email” screen and block rest of app until verified.

### 5.3 Register Form (Flutter)

- **Required:** Name, Email, Password (and Confirm password).
- **Optional (can be same screen or “Add later”):** DOB (date picker), Birth time (time picker), Birth place (text or place picker), Phone (text field).
- On submit:
  1. Create user in Firebase with email/password.
  2. Send verification email.
  3. Call backend `POST /auth/register` or `POST /profile` with Firebase idToken + name, email, and optional DOB, time, place, phone. Backend creates/updates MongoDB profile linked to UID.
  4. Show “Verify your email” screen.

### 5.4 Login Form (Flutter)

- Email, Password.
- On submit: Firebase signIn → get idToken → call backend `POST /auth/verify` or `GET /profile` with token. Backend verifies token, returns profile; store in app. Navigate to Home.

### 5.5 After Login: Show Other Options

- Home screen has navigation (drawer, bottom nav, or tabs) to:
  - Josiyam, Daily, Calendar, Chat, Devotional, Profile, etc.
- These routes are **only available when** `FirebaseAuth.instance.currentUser != null` (and optionally `emailVerified == true`). Otherwise redirect to Login.

---

## 6. Backend Plan (Node Express)

### 6.1 Auth Middleware

- **Verify Firebase token** on protected routes:
  - Header: `Authorization: Bearer <firebaseIdToken>`.
  - Use Firebase Admin SDK to verify idToken; get `uid` and optionally email.
  - Attach `req.user = { uid, email }` for next handlers.

### 6.2 APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Token (optional at register) | Body: name, email, and optional DOB, birthTime, birthPlace, phone. Verify token; create or update user in MongoDB by `uid`. |
| POST | `/auth/verify` | Token | Verify Firebase token; return user profile from MongoDB (for login sync). |
| GET | `/profile` | Token | Get current user profile (by uid from token). |
| PUT | `/profile` | Token | Update profile: name, DOB, birthTime, birthPlace, phone, etc. |

### 6.3 Register API (POST /auth/register or POST /profile)

- **Input:** Firebase idToken (header) + body: `{ name, email, dob?, birthTime?, birthPlace?, phone? }`.
- **Logic:** Verify token → get uid (and email). Upsert MongoDB document: `users` or `profiles` with `firebaseUid`, name, email, dob, birthTime, birthPlace, phone, `updatedAt`.
- **Response:** 200 + profile (no password).

### 6.4 Login Sync (POST /auth/verify or GET /profile)

- **Input:** Firebase idToken in header.
- **Logic:** Verify token → find user in MongoDB by `firebaseUid`. If not found, create minimal document (uid, email from token). Return profile.
- **Response:** 200 + profile. Flutter stores profile and goes to Home.

---

## 7. MongoDB Plan

### 7.1 Collection: `users` (or `profiles`)

One document per user, identified by Firebase UID.

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `firebaseUid` | string | Yes | Firebase Auth UID; unique index |
| `email` | string | Yes | From Firebase or register |
| `name` | string | Yes | From register |
| `password` | — | No | Do not store; Firebase only |
| `dob` | date / ISODate | No | Optional; birth date |
| `birthTime` | string | No | Optional; e.g. "08:30" or ISO |
| `birthPlace` | string | No | Optional; place of birth |
| `phone` | string | No | Optional |
| `emailVerified` | boolean | No | Can sync from Firebase or set when user verifies |
| `createdAt` | date | Yes | ISODate |
| `updatedAt` | date | Yes | ISODate |

**Index:** Unique on `firebaseUid` for fast lookup on login.

### 7.2 Example Document

```json
{
  "_id": ObjectId("..."),
  "firebaseUid": "abc123firebaseUid",
  "email": "user@example.com",
  "name": "Ramesh",
  "dob": ISODate("1990-05-15"),
  "birthTime": "08:30",
  "birthPlace": "Chennai",
  "phone": "+919876543210",
  "emailVerified": true,
  "createdAt": ISODate("2025-03-09T10:00:00Z"),
  "updatedAt": ISODate("2025-03-09T10:00:00Z")
}
```

### 7.3 Optional: Separate `profiles` Collection

If you prefer to keep “auth” and “profile” separate:

- **users:** firebaseUid, email, createdAt (minimal).
- **profiles:** userId (ref to users._id or firebaseUid), name, dob, birthTime, birthPlace, phone, updatedAt.

For simplicity, one collection `users` with all fields above is enough for Module 1.

---

## 8. Flow Summary

```
[App Open] → Splash
    → Not logged in → Login / Register
        → Register: Name, Email, Password (+ optional DOB, time, place, phone)
            → Firebase createUser → Send verify email
            → Backend: POST /auth/register (token + body) → MongoDB upsert
            → Show "Verify email" (once)
        → Login: Email, Password
            → Firebase signIn → idToken
            → Backend: POST /auth/verify or GET /profile (token)
            → MongoDB: get/ensure user by firebaseUid
            → Navigate to Home
    → Logged in (and email verified) → Home → Show other options (Josiyam, Daily, Chat, etc.)
```

---

## 9. Checklist (Implementation)

### Frontend (Flutter)

- [ ] Splash; auth state check; route to Login/Register or Home
- [ ] Register screen: name, email, password (required); DOB, time, place, phone (optional)
- [ ] Send verification email after register; “Verify email” / “Resend” UI
- [ ] Login screen: email, password; call backend with token after Firebase signIn
- [ ] Forgot password (Firebase)
- [ ] Home screen; only show after login
- [ ] Guard all other modules: show only when user is logged in (and optionally email verified)
- [ ] Call POST /auth/register and GET /profile (or POST /auth/verify) with Firebase idToken

### Backend (Node Express)

- [ ] Firebase Admin SDK: verify idToken; get uid, email
- [ ] Auth middleware: attach req.user from token
- [ ] POST /auth/register (or POST /profile): upsert user by firebaseUid
- [ ] GET /profile (or POST /auth/verify): return profile by firebaseUid
- [ ] PUT /profile: update name, dob, birthTime, birthPlace, phone

### MongoDB

- [ ] Collection: users (or profiles)
- [ ] Schema: firebaseUid, email, name, dob, birthTime, birthPlace, phone, emailVerified, createdAt, updatedAt
- [ ] Unique index on firebaseUid

---

*End of Module 1 document.*
