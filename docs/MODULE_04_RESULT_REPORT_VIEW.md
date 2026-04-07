# Module 4 — Result & Report View

**Scope:** Frontend (Flutter), Backend (Node Express), DB (MongoDB)  
**Rule:** Users must be authenticated (JWT valid). Report actions that generate/export full documents must respect premium gate (if enabled).

---

## 1. Overview

This module focuses on how the computed josiyam results are displayed and shared:

| Area | Responsibility |
|------|----------------|
| **Flutter UI** | Show chart details and category-wise predictions; provide share/deep link; provide print/save UX; premium UI gating |
| **Node Express** | Generate PDF report (premium) from stored result or request payload; return downloadable link/bytes |
| **MongoDB** | Store generated josiyam results (Module 2/3) so the report view can re-fetch by `resultId` |

---

## 2. Inputs & Outputs (Functional Requirements)

### 2.1 Inputs

- Authenticated user (`userId` attached by JWT middleware).
- A josiyam result source:
  - **From API response payload** right after calculation, OR
  - **By `resultId`** if you want to open result later via deep link/share.

### 2.2 Outputs

1. **Result screen (always)**
   - Basic details:
     - `rasi`, `nakshatra`, `lagnam`, `ayanamsa` (single or partner-specific for couple)
   - Category-wise predictions:
     - 20 categories (single) OR 25 categories (couple)
   - Summary (AI narrative)

2. **Report export (premium)**
   - `PDF` download for the same content shown in the UI.

3. **Sharing**
   - Share a safe summary (no personal/birth-data leakage).
   - Optional: deep link that re-opens the report using `resultId`.

---

## 3. Backend Plan (Node Express)

### 3.1 API Design

Reference endpoint from `MODULES.md`:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/report/pdf` | Token | Generate PDF report for a stored result (premium) |

**Auth:** JWT middleware (`authenticate`) from Module 1.  
**Base URL:** `http://localhost:3000/api/report/pdf` (dev).

### 3.2 Request Contract

- **Headers:**
  - `Authorization: Bearer <jwtToken>`

- **Query params:**
  - `resultId`: string (ObjectId)
  - `type`: optional string (`"single"` | `"couple"`)
  - `language`: optional (`ta-IN` / `en-US` / Tanglish marker)

Example:
`GET /api/report/pdf?resultId=RPT_RESULT_OBJECT_ID&type=single&language=ta-IN`

### 3.3 Response Contract

Premium PDF export:

- Response returns PDF bytes/stream or a temporary download URL (implementation choice).

Standard error format:
```json
{
  "success": false,
  "message": "Not premium",
  "errors": []
}
```

### 3.4 Controller & Service Responsibilities

- **Controller (`reportController.pdf`):**
  - Validate `resultId` and optional `language`.
  - Check premium gate (if enabled).
  - Verify the result belongs to `req.user.userId`.
  - Load result data from MongoDB.
  - Generate PDF and return it (or return a signed link).

- **Service (`reportService.generatePdf`):**
  - Render result into a deterministic PDF template:
    - header (app name, language)
    - chart details
    - category list
    - summary
  - Ensure consistent formatting for Tamil text (font/encoding).

### 3.5 Database Collections

Reuse `josiyamResults` from Module 2/3:
- Use `resultId` + `userId` to fetch stored chart/categories/summary.

---

## 4. Frontend Plan (Flutter)

### 4.1 Screens / Routes

| Screen | When shown | Action |
|--------|-------------|--------|
| **Single/Couple Result Screen** | After josiyam calculation | Render chart + categories + summary |
| **PDF Export Screen (optional modal)** | When user taps “Export PDF” | Premium check + call `/report/pdf` |
| **Share Sheet** | When user taps “Share summary” | Share safe summary or deep link |

### 4.2 Result UI Requirements

- **Basic details display** (top section):
  - `Rasi`, `Nakshatra`, `Lagnam`, `Ayanamsa`
  - For couple: show both partners in two columns/cards
- **Category-wise predictions** (body section):
  - Collapsible cards for categories (smooth scroll)
  - Couple-specific categories can be highlighted
- **Summary** (bottom section):
  - One overall paragraph (AI narrative)

### 4.3 PDF Export UX

- If premium gate is enabled:
  - If user is not premium: show paywall CTA.
  - If premium: call `/report/pdf` and download/open/share PDF.

### 4.4 Share / Deep Link UX

- Share summary:
  - Include `summary.aiText` (and optional chart highlights) only.
  - Avoid sharing raw DOB/time/place.
- Deep link (optional):
  - Generate/share a link with `resultId`.
  - App opens result screen by fetching from backend using JWT.

---

## 5. Validation Rules

### 5.1 Backend Validation

When requesting `/report/pdf`:

- Validate `resultId` is a valid ObjectId format.
- Check premium gate if configured.
- Ensure `josiyamResults.userId == req.user.userId`.

### 5.2 Frontend Validation

- Guard all report actions with JWT presence.
- Handle network errors gracefully:
  - PDF generation failures -> show “Try again” + log error message.

---

## 6. Flow Summary

```text
User opens Result screen
  → Reads stored categories + summary
  → User taps "Export PDF"
    → (Optional premium check)
    → GET /api/report/pdf?resultId=<id> (Authorization: Bearer <jwtToken>)
      → Backend: verify JWT → verify ownership → generate PDF → return PDF
    → Flutter: download/open/share PDF
  → User taps "Share summary"
    → Flutter: share safe summary text (no DOB/time/place)
```

---

## 7. Checklist (Implementation)

### Backend (Node Express)

- [ ] Create `reportController.pdf` and route `/report/pdf` under `/api`.
- [ ] Use `authenticate` middleware to verify JWT token.
- [ ] Validate `resultId` and ownership.
- [ ] Implement premium gate check (if enabled).
- [ ] Implement PDF rendering service and return PDF bytes/stream.

### Frontend (Flutter)

- [ ] Implement Result UI for:
  - [ ] Single (20 categories)
  - [ ] Couple (25 categories)
- [ ] Implement “Export PDF” button with premium gating.
- [ ] Add API call for `/report/pdf`.
- [ ] Implement “Share summary” (safe text only) and optional deep link open.
- [ ] Add loading/error states for export/share actions.

### MongoDB

- [ ] Ensure `josiyamResults` documents store everything needed for report rendering.
- [ ] Ensure index supports lookup by (`_id`, `userId`) or equivalent.

---

*End of Module 4 document.*

