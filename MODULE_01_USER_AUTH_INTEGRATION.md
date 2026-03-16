# Module 1 — Auth Integration (Frontend + Backend)

**Repos:**  
- **Frontend:** `Smart-Jothidam-Frontend/client` (Flutter)  
- **Backend:** `Smart-Jothidam-backend/server` (Node.js + Express + MongoDB + Firebase Admin)  

**Goal:** Implement a **single, consistent flow** for registration, email verification, login, and profile sync across frontend and backend for **Module 1**.

---

## 1. End-to-End User Flow (High Level)

```text
App Open → Splash → Welcome
   → Register (new user) → Firebase createUser + send verify email
      → Backend /api/auth/register (create profile)
      → Show “Verify email” screen
   → User verifies email via link
   → Login (email + password)
      → Firebase signIn → ID token
      → Backend /api/auth/verify (sync + get profile)
      → Navigate to Home (other modules unlocked)
   → Authenticated requests (profile, josiyam, daily, etc.) always send ID token in Authorization header
```

**Rule:** User must **register → verify email → login → Home**. Only after **Home**, show other app options (josiyam, daily, chat, etc.).

---

## 2. Backend Integration — Smart-Jothidam-backend

**Base URL (local dev):**

```text
http://localhost:3000/api
```

### 2.1 Routes (authRoutes.js)

Existing routes (from `server/routes/authRoutes.js`):

- `POST /auth/register` — Register new user and create profile (protected by `authenticate` middleware).
- `POST /auth/verify` — Verify Firebase token and sync/create user profile.
- `GET /profile` — Get current user profile.
- `PUT /profile` — Update user profile.

Mounted under `/api` (see `app.js`), effective endpoints:

| Method | Path                     | Description                |
|--------|--------------------------|----------------------------|
| POST   | `/api/auth/register`     | Register + create profile  |
| POST   | `/api/auth/verify`       | Verify token + sync user   |
| GET    | `/api/profile`           | Get current user profile   |
| PUT    | `/api/profile`           | Update current user        |

### 2.2 Auth Middleware (`authenticate`)

- Reads `Authorization: Bearer <firebase_id_token>` header.
- Uses Firebase Admin SDK (see `config/firebaseAdmin.js`) to **verify** the token.
- On success, attaches decoded token (uid, email, etc.) to `req.user`.
- On failure, returns **401** with standard error response.

### 2.3 Request/Response Contract

#### 2.3.1 Register (`POST /api/auth/register`)

- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <firebase_id_token>`
- **Body:**
  - `firebaseUid` (string, required)
  - `email` (string, required)
  - `name` (string, required)
  - `dateOfBirth` (string, optional, `YYYY-MM-DD`)
  - `birthTime` (string, optional, `HH:mm`)
  - `birthPlace` (string, optional)
  - `phoneNumber` (string, optional, E.164)
- **On success:** `201` with

```json
{
  "success": true,
  "data": { "user": { /* user fields */ } },
  "message": "User registered successfully"
}
```

#### 2.3.2 Verify Token (`POST /api/auth/verify`)

- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <firebase_id_token>`
- **Body:**
  - `idToken` (string, same token; can be optional if only header is used)
- **On success:** `200` with `user` and `decodedToken` in `data`.

#### 2.3.3 Get Profile (`GET /api/profile`)

- **Headers:**
  - `Authorization: Bearer <firebase_id_token>`
- **On success:** `200` with `data.user`.

#### 2.3.4 Update Profile (`PUT /api/profile`)

- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <firebase_id_token>`
- **Body:** any subset of profile fields to update (name, dateOfBirth, birthTime, birthPlace, phoneNumber).

---

## 3. Frontend Integration — Smart-Jothidam-Frontend

### 3.1 Architecture (Auth Module)

Key pieces from `client/lib`:

- `main.dart` — wires up:
  - `Firebase.initializeApp(...)`
  - `DioClient` + `ApiService`
  - `FirebaseAuthService` (wraps `FirebaseAuth.instance`)
  - `AuthFirebaseDataSourceImpl` — talks to Firebase Auth.
  - `AuthRemoteDataSourceImpl` — talks to backend via `ApiService`.
  - `AuthRepositoryImpl` — combines Firebase + backend.
  - Use cases: `RegisterUser`, `LoginUser`, `VerifyEmail`, `ResendVerification`, `ForgotPassword`, `GetProfile`, `UpdateProfile`.
  - `AuthBloc` — handles events and states for auth.

- `features/auth/data/datasources/auth_remote_datasource.dart` — backend calls:
  - `registerUser(String token, Map<String, dynamic> userData)` → `POST ApiConstants.registerEndpoint`.
  - `verifyToken(String token)` → `POST ApiConstants.verifyEndpoint`.
  - `getProfile(String token)` → `GET ApiConstants.profileEndpoint`.
  - `updateProfile(String token, Map<String, dynamic> userData)` → `PUT ApiConstants.profileEndpoint`.

- UI pages:
  - `SplashPage` — shows logo, navigates to welcome.
  - `WelcomePage` — entry point (login/register actions).
  - `LoginPage` — email/password login.
  - `RegisterPage` — full register form (name, email, password, optional DOB/time/place/phone).
  - `VerifyEmailPage` — verify email flow.
  - `ForgotPasswordPage` — reset password.

### 3.2 API Constants (Frontend)

Ensure `ApiConstants` matches backend:

```dart
class ApiConstants {
  static const String baseUrl = 'http://localhost:3000/api'; // dev

  static const String registerEndpoint = '$baseUrl/auth/register';
  static const String verifyEndpoint = '$baseUrl/auth/verify';
  static const String profileEndpoint = '$baseUrl/profile';
}
```

For production, update `baseUrl` to your deployed backend URL.

---

## 4. Detailed Flows (Frontend + Backend Together)

### 4.1 Registration Flow

**Frontend (Flutter / AuthBloc):**

1. User opens `RegisterPage`.
2. Fills required fields: name, email, password. Optional: phone, date of birth, birth time, birth place.
3. On “Sign Up”:
   - Flutter validates fields (`Validators`).
   - `AuthRegisterRequested` event is dispatched.
   - Use case `RegisterUser`:
     - Calls `AuthFirebaseDataSourceImpl` to:
       - `createUserWithEmailAndPassword(email, password)`.
       - `sendEmailVerification()`.
       - `getIdToken()` to get `firebase_id_token`.
     - Builds `userData` map:
       - `firebaseUid` (from Firebase user.uid).
       - `email`, `name`, and optional DOB/Time/Place/Phone.
     - Calls `AuthRemoteDataSource.registerUser(token, userData)`.
4. On backend success:
   - Bloc emits `AuthVerificationEmailSent`.
   - UI navigates to `VerifyEmailPage`.

**Backend (Node / Express):**

1. `POST /api/auth/register` receives:
   - Header: `Authorization: Bearer <firebase_id_token>`.
   - Body: `firebaseUid`, `email`, `name`, and optional birth details.
2. `authenticate` middleware:
   - Verifies token with Firebase Admin.
   - Attaches `req.user = { uid, email, ... }`.
3. `authController.register`:
   - Validates body (using `registerValidation`).
   - Uses `userService` to **upsert** document in `users` collection (`firebaseUid` as unique key).
4. Returns standard success response with `user` object.

---

### 4.2 Email Verification Flow

**In Firebase (handled by Firebase Auth):**

- After registration, Firebase sends a verification link.
- User clicks the link; Firebase marks `emailVerified = true` for that account.

