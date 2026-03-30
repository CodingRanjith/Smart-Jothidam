# Module 3 — Couple Josiyam (Compatibility)

**Scope:** Frontend (Flutter), Backend (Node Express), DB (MongoDB), AI (Groq)  
**Rule:** Couple josiyam is available **only after login + user can provide 2 birth profiles** (saved in DB or manual entry). Calculations must be **transparent and repeatable** (same inputs => same chart/category structure).

---

## 1. Overview

| Layer | Responsibility |
|-------|----------------|
| **Flutter** | Couple Josiyam input UI (2 partners), result display (charts + categories), loading/error states, pulls stored partner birth data |
| **Node Express** | Validate request, compute compatibility + 25 categories, call Groq for narrative, store/cache result in MongoDB |
| **MongoDB** | Store partner birth data (if using saved profiles) and cache couple josiyam results per user |
| **Groq AI** | Convert raw scores/keywords into human-readable couple compatibility narrative (Tamil/English/Tanglish) |

**Flow:** User logs in → Home → taps “Couple Josiyam” → app collects partner birth data (saved or manual) → calls backend → backend computes charts + 25 categories → optional Groq narrative → UI shows partner A/B charts + compatibility categories.

---

## 2. Input & Output (Functional Requirements)

### 2.1 Inputs

Couple calculation requires birth details for:

| Partner field | Required | Notes |
|---------------|----------|------|
| DOB (`dateOfBirth`) | Yes | ISO date `YYYY-MM-DD` |
| Birth time (`birthTime`) | Yes | `HH:mm` 24-hour string |
| Birth place (`birthPlace`) | Yes | City/country (or coordinates string) |
| Language | Yes | Tamil / English / Tanglish |

**Input source options:**

- **Option A (recommended):** Use saved partner profiles from DB (created under the user).
- **Option B:** Manual entry for this calculation run only.

### 2.2 Outputs

Backend returns:

1. **Charts (verifiable)**
   - Partner A: `rasi`, `nakshatra`, `lagnam`, `ayanamsa`
   - Partner B: `rasi`, `nakshatra`, `lagnam`, `ayanamsa`
   - Compatibility/combined chart metadata (implementation-specific but must be deterministic)

2. **25 categories**
   - 20 standard categories (mirrors Module 2 keys): `career`, `business`, `finance`, `education`, `marriage`, `love`, `family`, `children`, `health`, `mental_strength`, `spiritual`, `foreign_travel`, `property`, `legal`, `enemy`, `social_status`, `friends`, `luck`, `remedies`, `overall_life_path`
   - 5 couple-specific categories:
     1. `compatibility_score`
     2. `emotional_bond`
     3. `financial_stability`
     4. `family_harmony`
     5. `long_term_growth`

3. **AI narrative (optional, per category + summary)**
   - Short, clear text per category
   - One overall summary paragraph (couple-focused)

---

## 3. Backend Plan (Node Express)

### 3.1 API Design

Endpoint from `MODULES.md`:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/josiyam/couple` | Token | Calculate couple compatibility josiyam (25 categories) |

**Auth:** JWT middleware (`authenticate`) from Module 1.  
**Base URL:** `http://localhost:3000/api/josiyam/couple` (dev).

### 3.2 Request Contract

- **Headers:**
  - `Authorization: Bearer <jwtToken>`
  - `Content-Type: application/json`

- **Body:**

Option A (saved partner profiles):
```json
{
  "useProfiles": true,
  "partnerA": { "profileId": "PA_PROFILE_OBJECT_ID" },
  "partnerB": { "profileId": "PB_PROFILE_OBJECT_ID" },
  "language": "ta-IN"
}
```

Option B (manual entry for this run):
```json
{
  "useProfiles": false,
  "partnerA": {
    "dateOfBirth": "1990-05-15",
    "birthTime": "08:30",
    "birthPlace": "Chennai, India"
  },
  "partnerB": {
    "dateOfBirth": "1992-11-20",
    "birthTime": "18:10",
    "birthPlace": "Coimbatore, India"
  },
  "language": "ta-IN"
}
```

### 3.3 Response Contract

```json
{
  "success": true,
  "data": {
    "chart": {
      "ayanamsa": "Lahiri",
      "partnerA": { "rasi": "Mesha", "nakshatra": "Ashwini", "lagnam": "Mesha" },
      "partnerB": { "rasi": "Vrishabha", "nakshatra": "Krittika", "lagnam": "Vrishabha" },
      "compatibilityMeta": { "source": "deterministic-v1" }
    },
    "categories": [
      {
        "key": "compatibility_score",
        "score": 7,
        "trend": "positive",
        "aiText": "Your relationship chemistry shows strong stability...",
        "raw": { "house": 9, "notes": "..." }
      }
      // ... 24 more categories ...
    ],
    "summary": {
      "aiText": "Overall, your couple compatibility indicates stable growth with focused communication...",
      "language": "ta-IN"
    }
  },
  "message": "Couple josiyam generated successfully"
}
```

Errors use the standard backend format:
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    { "field": "partnerA.dateOfBirth", "message": "Required when useProfiles is false" }
  ]
}
```

### 3.4 Controller & Service Responsibilities

- **Controller (`josiyamController.couple`):**
  - Validate body (`useProfiles` + partner birth inputs or profileIds).
  - If `useProfiles == true`, fetch partner birth data from DB using `req.user.userId` and provided `profileId`s.
  - Call `josiyamService.calculateCouple(...)` with final partner birth data.
  - Return formatted response with `successResponse(...)`.

- **Service (`josiyamService.calculateCouple`):**
  - Input: `{ partnerA, partnerB, userId, language }`.
  - Steps:
    1. Compute both charts (Rasi, Nakshatra, Lagnam, ayanamsa).
    2. Compute raw scores/flags per 25 categories (deterministic rules).
    3. Optionally check cache in MongoDB (`josiyamResults`) and reuse if present and inputs unchanged.
    4. Build compact payload to send to Groq (chart + category skeleton).
    5. Call Groq to generate `aiText` per category + summary.
    6. Save final result to MongoDB cache.
  - Output: `chart`, `categories[]`, `summary`.

### 3.5 Database Collections

Reuse `users` from Module 1 and add:

#### 3.5.1 Collection: `josiyamResults`

| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | Link to user |
| `type` | string | `"couple"` |
| `input` | object | partner birth data + language (and profile references if applicable) |
| `chart` | object | charts + metadata |
| `categories` | array | 25 category objects (see response) |
| `summary` | object | aiText, language |
| `createdAt` | date | When result was generated |
| `updatedAt` | date | Last refresh |

Index on (`userId`, `type`) for fast lookup.

---

## 4. Frontend Plan (Flutter)

### 4.1 Screens / Routes

| Screen | When shown | Action |
|--------|-------------|--------|
| **Couple Josiyam entry** | From Home, user taps “Couple Josiyam” | Collect partner A + B birth data (saved or manual) |
| **Couple Josiyam result** | After successful API call | Show partner A/B charts + 25 categories; allow “Recalculate” or “Share summary” |
| **Premium gate (if enabled)** | If couple module is paid | Show paywall before enabling API/PDF |

### 4.2 Data Flow (Bloc / Use Case)

1. UI dispatches `FetchCoupleJosiyamRequested` event.
2. Auth state provides current JWT token and `userId` (persisted locally after login).
3. Use case `GetCoupleJosiyam` calls repository:
   - `authRepository.getCoupleJosiyam(token, body)`
4. Repository calls new endpoint on a remote data source (`/josiyam/couple`).
5. On success, Bloc emits `CoupleJosiyamLoaded` with chart + categories + summary.
6. UI renders partner charts + 25 categories.

### 4.3 Remote Data Source (Flutter)

Example:
```dart
abstract class JosiyamRemoteDataSource {
  Future<CoupleJosiyamModel> getCoupleJosiyam(String token, Map<String, dynamic> body);
}
```

Implementation:
```dart
final response = await _apiService.post(
  ApiConstants.coupleJosiyamEndpoint,
  data: body,
  headers: { 'Authorization': 'Bearer $token' },
);
```

### 4.4 UI Behaviour

- **Loading state:** Show spinner while request is in progress.
- **Error state:** Show backend error message; if partner birth inputs are missing, show CTA “Add partner birth details”.
- **Success state:**
  - Show partner A & partner B `Rasi/Nakshatra/Lagnam` clearly.
  - Show 25 categories (group couple-specific categories at top if desired).
  - Optional: “Ask more via AI chat” (Module 9 later).

---

## 5. Validation Rules

### 5.1 Backend Validation

When `useProfiles == false`:

- Validate required partner fields:
  - `partnerA.dateOfBirth`: required, ISO date
  - `partnerA.birthTime`: required, `HH:mm`
  - `partnerA.birthPlace`: required, non-empty
  - `partnerB.dateOfBirth`: required, ISO date
  - `partnerB.birthTime`: required, `HH:mm`
  - `partnerB.birthPlace`: required, non-empty

When `useProfiles == true`:

- Validate `partnerA.profileId` and `partnerB.profileId`.
- Ensure both profiles exist and belong to `req.user.userId`.

### 5.2 Frontend Validation

- If user chooses “Saved profiles”, ensure both partner profiles are selected.
- If user chooses “Manual entry”, validate DOB/time/place before calling API.
- Before calling API, guard access: only show couple feature when auth state is logged-in.

---

## 6. Flow Summary

```text
[User Logged In] → Home
  → Tap "Couple Josiyam"
    → Choose saved partners OR manual birth details
      → Complete → Get JWT token
        → POST /api/josiyam/couple (Authorization: Bearer <token>)
          → Backend: verify JWT → load partner birth data → calculate 25 categories → call Groq → cache result → respond
        → Flutter: parse response → show partner charts + 25 categories
```

---

## 7. Checklist (Implementation)

### Backend (Node Express)

- [ ] Create `josiyamController.couple` and route `POST /josiyam/couple` under `/api`.
- [ ] Use `authenticate` middleware to verify JWT token.
- [ ] Implement validation for `useProfiles` vs manual input.
- [ ] Read partner birth data from MongoDB when `useProfiles == true`.
- [ ] Implement `josiyamService.calculateCouple` to:
  - [ ] Compute both charts (Rasi, Nakshatra, Lagnam, ayanamsa).
  - [ ] Compute raw 25-category structure.
  - [ ] Call Groq to generate `aiText` and summary.
  - [ ] Cache result in `josiyamResults` with `type: "couple"`.
- [ ] Return response in standard `{ success, data, message }` format.

### Frontend (Flutter)

- [ ] Add `ApiConstants.coupleJosiyamEndpoint = '$baseUrl/josiyam/couple';`.
- [ ] Create `CoupleJosiyamModel` (charts + categories + summary).
- [ ] Add `JosiyamRemoteDataSource` method `getCoupleJosiyam`.
- [ ] Add repository + use case for fetching couple josiyam.
- [ ] Implement UI for partner A & B input (saved or manual).
- [ ] Implement “result” screen for partner charts + 25 categories.
- [ ] Guard access based on auth state and (optional) premium gate.

### MongoDB

- [ ] Add `josiyamResults` documents for `type: "couple"`.
- [ ] Add index on (`userId`, `type`).

---

*End of Module 3 document.*

