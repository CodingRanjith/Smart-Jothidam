# Module 2 — Single-Person Josiyam (20 Categories)

**Scope:** Frontend (Flutter), Backend (Node Express), DB (MongoDB), AI (Groq)  
**Rule:** Single-person josiyam is only available **after login + profile (birth data) exists**. Calculations must be **transparent and repeatable** (no random results).

---

## 1. Overview

| Layer | Responsibility |
|-------|----------------|
| **Flutter** | Josiyam request UI, result display (chart + 20 categories), loading/error states, pulls profile birth data. |
| **Node Express** | Validate request, run astrology calculations (Lahiri + local logic), call Groq for narrative, store/cached result. |
| **MongoDB** | Store user profiles and cached josiyam results (per user). |
| **Groq AI** | Turn raw category scores/keywords into human-readable joshiyam text (Tamil/English). |

**Flow:** User logs in → Home → taps “My Josiyam” → app uses stored profile (DOB, time, place) → calls backend → backend calculates chart + 20 categories → optional AI narrative → UI shows **Rasi, Nakshatra, Lagnam** + 20-category result.

---

## 2. Input & Output (Functional Requirements)

### 2.1 Inputs (from profile or manual)

Mandatory for accurate single-person josiyam:

| Field | Source | Notes |
|-------|--------|-------|
| **DOB** | Profile (`dateOfBirth`) | e.g. `1990-05-15` |
| **Birth time** | Profile (`birthTime`) | `HH:mm` 24-hour string |
| **Birth place** | Profile (`birthPlace`) | City + country or coordinates |
| **Gender** | (future) | Optional for wording only |
| **Language** | App setting | Tamil / English / Tanglish |

If profile is missing DOB/time/place, Module 2 should **redirect** user back to profile completion (Module 1).

### 2.2 Outputs (to UI)

Backend returns:

- **Basic chart details:**
  - Rasi
  - Nakshatra
  - Lagnam
  - Ayanamsa (Lahiri) or equivalent
- **20 categories** (keys + scores + raw interpretation fields):
  1. Career  
  2. Business  
  3. Finance  
  4. Education  
  5. Marriage  
  6. Love  
  7. Family  
  8. Children  
  9. Health  
  10. Mental strength  
  11. Spiritual  
  12. Foreign travel  
  13. Property  
  14. Legal  
  15. Enemy  
  16. Social status  
  17. Friends  
  18. Luck  
  19. Remedies  
  20. Overall life path
- **AI narrative (optional for each category + summary):**
  - Short, clear text per category.
  - One overall summary paragraph.

---

## 3. Backend Plan (Node Express)

### 3.1 API Design

Endpoint from `MODULES.md`:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/josiyam/single` | Token | Calculate 20-category single-person josiyam |

**Auth:** Same Firebase token middleware (`authenticate`) as Module 1.  
**Base URL:** `http://localhost:3000/api/josiyam/single` (dev).

### 3.2 Request Contract

- **Headers:**
  - `Authorization: Bearer <firebase_id_token>`
  - `Content-Type: application/json`
- **Body:**

Option A (recommended) — Use saved profile only:

```json
{
  "useProfile": true
}
```

Option B — Allow override (manual entry for this run):

```json
{
  "useProfile": false,
  "dateOfBirth": "1990-05-15",
  "birthTime": "08:30",
  "birthPlace": "Chennai, India"
}
```

### 3.3 Response Contract

```json
{
  "success": true,
  "data": {
    "chart": {
      "rasi": "Mesha",
      "nakshatra": "Ashwini",
      "lagnam": "Mesha",
      "ayanamsa": "Lahiri"
    },
    "categories": [
      {
        "key": "career",
        "score": 4,
        "trend": "positive",
        "aiText": "Your career path is stable with opportunities for growth...",
        "raw": { "house": 10, "lord": "Saturn", "notes": "..." }
      }
      // … 19 more categories …
    ],
    "summary": {
      "aiText": "Overall, your chart shows good potential for career and foreign travel...",
      "language": "ta-IN"
    }
  },
  "message": "Single-person josiyam generated successfully"
}
```

Errors use the standard backend format:

```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    { "field": "dateOfBirth", "message": "Required when useProfile is false" }
  ]
}
```

### 3.4 Controller & Service Responsibilities

- **Controller (`josiyamController.single`):**
  - Validate body (`useProfile` + optional dateOfBirth/birthTime/birthPlace).
  - Fetch profile from DB when `useProfile == true` using `req.user.uid`.
  - Call `josiyamService.calculateSingle(...)` with final birth data.
  - Return formatted response with `successResponse(...)`.

- **Service (`josiyamService.calculateSingle`):**
  - Input: `{ dateOfBirth, birthTime, birthPlace, userId }`.
  - Steps:
    1. Compute chart (Rasi, Nakshatra, Lagnam, ayanamsa).
    2. Compute raw scores/flags per 20 categories.
    3. Optionally check cache in Mongo (`josiyamResults` collection) and reuse result if present and inputs unchanged.
    4. Build a compact payload to send to Groq (chart + category skeleton).
    5. Call Groq to generate `aiText` per category + summary.
    6. Save final result to MongoDB cache.
  - Output: `chart`, `categories[]`, `summary`.

### 3.5 Database Collections

Reuse `users` from Module 1 and add:

#### 3.5.1 Collection: `josiyamResults`

| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId or firebaseUid | Link to user |
| `type` | string | `"single"` (future: `"couple"`, etc.) |
| `input` | object | DOB, birthTime, birthPlace, language |
| `chart` | object | rasi, nakshatra, lagnam, ayanamsa, etc. |
| `categories` | array | 20 category objects (see response) |
| `summary` | object | aiText, language |
| `createdAt` | date | When result was generated |
| `updatedAt` | date | Last refresh |

Index on (`userId`, `type`) for fast lookup.

---

## 4. Frontend Plan (Flutter)

### 4.1 Screens / Routes

| Screen | When shown | Action |
|--------|------------|--------|
| **Josiyam list / entry** | From Home, user taps “My Josiyam” | Checks if user is logged in and profile has DOB/time/place; if not, redirect to “Profile” (Module 1). |
| **Josiyam result** | After successful API call | Show chart + 20 categories list; allow “Recalculate” or “Share summary”. |

You can implement single-person josiyam as:

- A dedicated page, e.g. `SingleJosiyamPage`.
- Accessible only when `AuthState` is authenticated and profile is complete.

### 4.2 Data Flow (Bloc / Use Case)

1. UI dispatches `FetchSingleJosiyamRequested` event.
2. Auth layer provides current Firebase user and token:
   - `final token = await FirebaseAuth.instance.currentUser?.getIdToken();`
3. Use case `GetSingleJosiyam` (to be created) calls repository:
   - `authRepository.getSingleJosiyam(token)`.
4. Repository calls a new method in `AuthRemoteDataSource` (or separate `JosiyamRemoteDataSource`) to hit `/josiyam/single`.
5. On success, Bloc emits `SingleJosiyamLoaded` with chart + categories + summary.
6. UI renders data.

### 4.3 Remote Data Source (Flutter)

Add a new data source or extend an existing one. Example with a separate `JosiyamRemoteDataSource`:

```dart
abstract class JosiyamRemoteDataSource {
  Future<SingleJosiyamModel> getSingleJosiyam(String token, {bool useProfile = true});
}
```

Implementation:

```dart
final response = await _apiService.post(
  ApiConstants.singleJosiyamEndpoint,
  data: { 'useProfile': true },
  headers: {
    'Authorization': 'Bearer $token',
  },
);
```

Parse into `SingleJosiyamModel` (chart + categories + summary).

### 4.4 UI Behaviour

- **Loading state:** Show spinner while request is in progress.
- **Error state:** Show backend error message; if error is missing DOB/time/place, show CTA “Complete your profile”.
- **Success state:** 
  - Show **Rasi, Nakshatra, Lagnam** prominently.
  - Show 20 categories as a scrollable list or expandable cards.
  - Optional: “Ask more via AI chat” button that opens contextual chat with chart as context (Module 9 later).

---

## 5. Validation Rules

### 5.1 Backend Validation

When `useProfile == true`:

- Ensure user profile exists and has:
  - `dateOfBirth` (non-null).
  - `birthTime` (valid `HH:mm`).
  - `birthPlace` (non-empty string).
- If missing, return 400:

```json
{
  "success": false,
  "message": "Profile incomplete for josiyam calculation",
  "errors": [
    { "field": "dateOfBirth", "message": "Required in profile" },
    { "field": "birthTime", "message": "Required in profile" }
  ]
}
```

When `useProfile == false`:

- Validate body fields:
  - `dateOfBirth`: required, ISO date.
  - `birthTime`: required, `HH:mm`.
  - `birthPlace`: required, non-empty.

### 5.2 Frontend Validation

- Before calling API, check profile object (from Module 1) for DOB/time/place.
- If missing, show alert: “To get your josiyam, please complete your birth details first” and navigate to Profile screen.

---

## 6. Flow Summary

```text
[User Logged In] → Home
   → Tap "My Josiyam"
       → Check profile completeness (DOB, time, place)
           → Incomplete → Navigate to Profile (Module 1)
           → Complete → Get Firebase ID token
               → POST /api/josiyam/single (useProfile: true, Authorization: Bearer <token>)
                   → Backend: verify token → load profile → calculate chart + 20 categories → call Groq for AI text → cache result → respond
               → Flutter: parse response → show chart + 20 categories
```

---

## 7. Checklist (Implementation)

### Backend (Node Express)

- [ ] Create `josiyamController.single` and route `POST /josiyam/single` under `/api`.
- [ ] Use `authenticate` middleware to verify Firebase token.
- [ ] Implement validation for `useProfile` vs manual input.
- [ ] Read profile from `users` collection when `useProfile == true`.
- [ ] Implement `josiyamService.calculateSingle` to:
  - [ ] Compute chart (Rasi, Nakshatra, Lagnam, ayanamsa).
  - [ ] Compute raw 20-category structure.
  - [ ] Call Groq to generate `aiText` and summary.
  - [ ] Cache result in `josiyamResults` collection.
- [ ] Return response in standard `{ success, data, message }` format.

### Frontend (Flutter)

- [ ] Add `ApiConstants.singleJosiyamEndpoint = '$baseUrl/josiyam/single';`.
- [ ] Create `SingleJosiyamModel` (chart + categories + summary).
- [ ] Add `JosiyamRemoteDataSource` (or extend an existing data source) with `getSingleJosiyam`.
- [ ] Add repository and use case for fetching single-person josiyam.
- [ ] Extend Bloc (new events/states) to trigger API call and hold result.
- [ ] Create/extend UI screen for “My Josiyam” and result display.
- [ ] Guard access: only allow when auth state is logged-in and profile has DOB/time/place.

### MongoDB

- [ ] Add `josiyamResults` collection with schema described above.
- [ ] Add index on (`userId`, `type`).

---

*End of Module 2 document.*

