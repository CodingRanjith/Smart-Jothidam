# Smart-Jothidam — Module Topics & Architecture

**Tech Stack:** Flutter (Mobile) | Firebase (Auth) | Node.js + Express (Backend) | Groq AI  
**Last Updated:** March 9, 2025

---

## Overview

This document defines all module topics mapped to the tech stack. Use it for sprint planning, task breakdown, and implementation.

| Platform | Stack |
|----------|--------|
| **Mobile App** | Flutter (Dart) |
| **Authentication** | Firebase Auth |
| **Backend API** | Node.js + Express |
| **AI / Chat** | Groq AI |
| **Database** | Via Node Express (user profiles, birth data, usage) |

---

## Module Map (By Platform)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUTTER (Mobile App)                          │
│  Modules: 1–11, 13 (UI + API calls)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌─────────────────────┐  ┌──────────────────┐
│   FIREBASE    │  │  NODE + EXPRESS     │  │    GROQ AI       │
│     AUTH      │  │     BACKEND         │  │                  │
│  Module 11    │  │  Modules: 2–10, 12  │  │  Modules: 2–10   │
└───────────────┘  └─────────────────────┘  └──────────────────┘
```

---

## 1. User Onboarding & Profile

| Topic | Platform | Details |
|-------|----------|---------|
| **1.1** Birth data form | Flutter | DOB, time, place, gender, language input (date picker, time picker, place search/geo) |
| **1.2** Profile persistence | Node Express | REST API: `POST /profile`, `GET /profile`, `PUT /profile`; store in DB |
| **1.3** Profile sync | Flutter | Link Firebase UID to profile; fetch/update on login |
| **1.4** Multi-profile (optional) | Flutter + Backend | Support family members; `GET /profiles`, `POST /profiles` |
| **1.5** Onboarding flow UI | Flutter | Wizard/stepper; validation; skip/resume |

---

## 2. Single-Person Josiyam

| Topic | Platform | Details |
|-------|----------|---------|
| **2.1** Birth data validation | Flutter + Node | Validate DOB, time, place; reject invalid |
| **2.2** Astrology calculation | Node Express | Lahiri ayanamsa; Rasi, Nakshatra, Lagnam; 20 categories |
| **2.3** Calculation API | Node Express | `POST /josiyam/single` → returns chart + 20 categories |
| **2.4** AI narrative generation | Groq AI + Node | Per-category or overall narrative; system prompt for joshiyam |
| **2.5** Result UI | Flutter | Display Rasi, Nakshatra, Lagnam; 20 categories (Career, Business, Finance, Education, Marriage, Love, Family, Children, Health, Mental strength, Spiritual, Foreign travel, Property, Legal, Enemy, Social status, Friends, Luck, Remedies, Overall life path) |
| **2.6** Caching / reuse | Node + DB | Store last result; avoid recompute for same birth data |

---

## 3. Couple Josiyam (Compatibility)

| Topic | Platform | Details |
|-------|----------|---------|
| **3.1** Dual birth data entry | Flutter | Two profiles or manual entry for partner |
| **3.2** Compatibility calculation | Node Express | Same 20 categories + 5 couple-specific (Compatibility score, Emotional bond, Financial stability, Family harmony, Long-term growth) |
| **3.3** API endpoint | Node Express | `POST /josiyam/couple` |
| **3.4** AI narrative for couple | Groq AI | Couple-specific prompts |
| **3.5** Result UI | Flutter | Side-by-side or combined view; 25 categories |
| **3.6** Premium gate | Flutter + Node | Check subscription; allow only if premium |

---

## 4. Result & Report View

| Topic | Platform | Details |
|-------|----------|---------|
| **4.1** Basic details display | Flutter | Rasi, Nakshatra, Lagnam, ayanamsa; user-verifiable |
| **4.2** Category-wise predictions | Flutter | Expandable/collapsible sections; scroll |
| **4.3** PDF export (premium) | Node Express + Flutter | `GET /report/pdf`; generate PDF server-side or use Flutter package |
| **4.4** Share / deep link | Flutter | Share summary (no PII); deep link to report |
| **4.5** Print / save | Flutter | Platform print; save to gallery if PDF |

---

## 5. Daily Horoscope

| Topic | Platform | Details |
|-------|----------|---------|
| **5.1** Date + Rasi + language | Flutter | Use stored profile; select date; language (Tamil/English/Tanglish) |
| **5.2** Daily content generation | Groq AI + Node | 14 categories: overview, career, business, finance, health, relationships, family, education, travel, legal, lucky numbers/color/time, remedies |
| **5.3** API | Node Express | `GET /daily/horoscope?date=YYYY-MM-DD&rasi=...&lang=...` |
| **5.4** Caching | Node + DB/Redis | Cache per (date, rasi, lang); avoid repeat AI calls |
| **5.5** UI | Flutter | Date picker; Rasi from profile; card-based layout |

---

## 6. Daily Do's and Don'ts

| Topic | Platform | Details |
|-------|----------|---------|
| **6.1** Rasi-based do's & don'ts | Groq AI + Node | Short list; tone: guidance, not guaranteed |
| **6.2** API | Node Express | `GET /daily/dos-donts?date=...&rasi=...&lang=...` |
| **6.3** UI | Flutter | Simple list; icons for do/don't; optional notification reminder |
| **6.4** Caching | Node | Same as daily horoscope; consider combined endpoint |

---

## 7. Tamil Calendar

| Topic | Platform | Details |
|-------|----------|---------|
| **7.1** Calendar view | Flutter | Tamil calendar dates; month/year navigation |
| **7.2** Auspicious days | Node + DB | Pre-computed or on-demand; mark good/bad days |
| **7.3** API | Node Express | `GET /calendar?month=...&year=...` |
| **7.4** Localization | Flutter | Tamil numerals/dates; language toggle |
| **7.5** Events / holidays | Node + DB | Tamil festivals; optional user reminders |

---

## 8. Astrology Calculator

| Topic | Platform | Details |
|-------|----------|---------|
| **8.1** Input forms | Flutter | Date, time, place; quick Rasi/Nakshatra/Lagnam |
| **8.2** Calculation API | Node Express | `POST /calculator` → returns Rasi, Nakshatra, Lagnam, etc. |
| **8.3** AI explanations | Groq AI | Explain result in plain language; `POST /calculator/explain` |
| **8.4** UI | Flutter | Form + result; copy/share; optional save to profile |

---

## 9. AI Chat (Contextual)

| Topic | Platform | Details |
|-------|----------|---------|
| **9.1** Context assembly | Flutter + Node | Chart + last N messages + current question |
| **9.2** System prompt | Node + Groq | Joseyam expert; chart-aware; Tamil/English |
| **9.3** API | Node Express | `POST /chat/contextual` with chart context + messages |
| **9.4** Chat UI | Flutter | Inline in result page; message list; typing indicator |
| **9.5** Usage limits | Node + DB | Premium: more messages; free: e.g. 3–5 per report |
| **9.6** Safety / moderation | Node | System prompt constraints; optional content filter |

---

## 10. AI Chat (Standalone)

| Topic | Platform | Details |
|-------|----------|---------|
| **10.1** General joshiyam Q&A | Groq AI + Node | No birth-data context; general astrology questions |
| **10.2** API | Node Express | `POST /chat/standalone` |
| **10.3** UI | Flutter | Dedicated chat screen; history (optional) |
| **10.4** Usage limits (free) | Node + DB | E.g. 5 messages/day for free tier |
| **10.5** System prompt | Node | General joshiyam guidance; disclaimers; no guaranteed predictions |

---

## 11. Auth & Subscription

| Topic | Platform | Details |
|-------|----------|---------|
| **11.1** Firebase Auth | Flutter + Firebase | Login/signup: Email, Google, Phone (optional) |
| **11.2** Auth state sync | Node Express | Verify Firebase token; map UID to user in DB |
| **11.3** Middleware | Node Express | `auth` middleware: validate token, attach user |
| **11.4** Free vs premium | Node + DB | `subscription` or `plan` field; check before premium features |
| **11.5** In-app purchase | Flutter | Play Store IAP; link purchase to backend |
| **11.6** "Little bit pay" flow | Flutter | Paywall UI; unlock full report, more chat, PDF, couple josiyam |
| **11.7** Subscription API | Node Express | `GET /subscription`; `POST /webhook/play-billing` (if applicable) |

---

## 12. Backend & Database

| Topic | Platform | Details |
|-------|----------|---------|
| **12.1** User accounts | Node + DB | `users` table: firebase_uid, email, created_at, subscription |
| **12.2** Birth data / profiles | Node + DB | `profiles` table: user_id, name, DOB, time, place, gender, language, rasi, nakshatra, lagnam |
| **12.3** Usage limits | Node + DB | `usage` or `quotas`: chat_messages_today, reports_generated, etc. |
| **12.4** Analytics (optional) | Node + DB | Events: report_viewed, daily_opened, chat_used; for product metrics |
| **12.5** Rate limiting | Node Express | Per-user / IP; protect Groq and DB |
| **12.6** Security | Node | CORS, Helmet; env vars for keys; no PII in logs |
| **12.7** Groq integration | Node | Groq SDK; centralize prompts; cost monitoring |

---

## 13. Hindu Devotional & God-Based (Region / God / Prayers / Songs / Books)

*Feature pick list: see **DEVOTIONAL_FEATURES_LIST.md** (65 options). Below module covers implement-now + future topics.*

### 13.A God & Deity

| Topic | Platform | Details |
|-------|----------|---------|
| **13.A.1** God directory | Flutter + Node | List gods with bio, region (Tamil/Kerala/North), attributes; filter by region |
| **13.A.2** Which day which god | Node + DB | Monday=Shiva, Tuesday=Hanuman, Wednesday=Ganesh, etc.; regional variants (Tamil: Murugan days) |
| **13.A.3** Weekday–god mapping API | Node Express | `GET /devotional/today-god` → today’s deity + quick mantra/prayer link |
| **13.A.4** God of the day widget | Flutter | Home: “Today pray to: [God]”; link to mantra/song |
| **13.A.5** God stories (brief) | Node + DB / Groq | Short story/legend per god; Tamil/English |
| **13.A.6** Rasi/Nakshatra deity (future) | Node + Groq | User’s chart → recommended deity; link from josiyam |

### 13.B Prayers, Mantras & Slokas

| Topic | Platform | Details |
|-------|----------|---------|
| **13.B.1** Mantra by god | Node + DB | List mantras/slokas per god (Ganesh, Hanuman, Lakshmi, Murugan, etc.) |
| **13.B.2** Daily mantra / sloka | Node + DB | One mantra/sloka per day; text + optional audio link |
| **13.B.3** Mantra audio | Flutter | Play/pause; links to curated audio (or embed) |
| **13.B.4** Pooja steps (text) | Node + DB | Step-by-step pooja for common gods |
| **13.B.5** Stotram list | Node + DB | Lalita Sahasranamam, Vishnu Sahasranamam, etc.; text + external links |
| **13.B.6** API | Node Express | `GET /devotional/mantras?god=...`, `GET /devotional/daily-mantra`, `GET /devotional/pooja-steps?god=...` |

### 13.C Songs & Music

| Topic | Platform | Details |
|-------|----------|---------|
| **13.C.1** Devotional songs by god | Node + DB | Curated song links (YouTube/Spotify) per deity; Tamil + Hindi |
| **13.C.2** Song of the day | Node + DB | One devotional song daily; by god or theme |
| **13.C.3** Regional songs filter | Flutter | Filter: Tamil keerthanai, Malayalam, Telugu, Hindi bhajans |
| **13.C.4** Aarti collection | Node + DB | Aarti lyrics + audio/video links by god |
| **13.C.5** API | Node Express | `GET /devotional/songs?god=...&lang=...`, `GET /devotional/daily-song` |

### 13.D Videos

| Topic | Platform | Details |
|-------|----------|---------|
| **13.D.1** God videos | Node + DB | Short clips / documentaries per god (curated links) |
| **13.D.2** Pooja videos | Node + DB | Full pooja video links per god |
| **13.D.3** Video of the day | Node + DB | One devotional video daily |
| **13.D.4** API | Node Express | `GET /devotional/videos?god=...`, `GET /devotional/daily-video` |

### 13.E Books & Reading

| Topic | Platform | Details |
|-------|----------|---------|
| **13.E.1** God-related books list | Node + DB | Books per god (Ramayana, Shiva Purana, etc.); Tamil + Sanskrit/English |
| **13.E.2** Scripture list | Node + DB | Bhagavad Gita, Vedas, Upanishads, Puranas; summary + “where to read” |
| **13.E.3** Tamil religious books | Node + DB | Kandapuranam, Thevaram, Divya Prabandham, etc. |
| **13.E.4** Book categories | Flutter | Filter: Stories, Mantras, Philosophy, Tamil, Sanskrit |
| **13.E.5** API | Node Express | `GET /devotional/books?god=...&category=...` |

### 13.F Calendar & Days (God / Vrat)

| Topic | Platform | Details |
|-------|----------|---------|
| **13.F.1** Vrat / fasting calendar | Node + DB | Ekadashi, Pradosham, Sankata Chaturthi; integrate with Tamil calendar (Module 7) |
| **13.F.2** God-specific festival days | Node + DB | Shivaratri, Ganesh Chaturthi, Vaikunta Ekadashi, Thai Pusam, etc. |
| **13.F.3** Tamil festival + god | Node + DB | Pongal, Thai Pusam → which god to pray; show in calendar |
| **13.F.4** Monthly god calendar | Flutter | Month view: which god on which day |
| **13.F.5** API | Node Express | `GET /devotional/vrat-calendar?month=...`, `GET /devotional/festivals?month=...` |

### 13.G Temples & Places

| Topic | Platform | Details |
|-------|----------|---------|
| **13.G.1** Famous temples by god | Node + DB | List famous temples per deity (TN, Kerala, India) |
| **13.G.2** 108 Divya Desam / Arupadai Veedu | Node + DB | List with short info + link to more |
| **13.G.3** API | Node Express | `GET /devotional/temples?god=...`, `GET /devotional/divya-desam` |

### 13.H Integration & UX

| Topic | Platform | Details |
|-------|----------|---------|
| **13.H.1** Devotional home section | Flutter | Home: Today’s god, Song of the day, Mantra of the day (one card/section) |
| **13.H.2** Link horoscope to god | Node + Groq | In daily horoscope: “Today favourable to pray to [God]” (by weekday/Rasi) |
| **13.H.3** Remedy → god/mantra | Node | Josiyam remedy suggests deity or mantra; link to devotional |
| **13.H.4** AI Q&A on gods | Groq + Node | Chat: “Which god to pray for job?”; extend chat/standalone |
| **13.H.5** Share god/song/mantra | Flutter | Share “Today’s god” or song/mantra to WhatsApp/social |
| **13.H.6** Language for devotional | Flutter + Node | Tamil, Hindi, English toggle; all devotional content respects lang |

---

## Summary: Total Modules & Topics

| Module | Name | Topics | Primary Tech |
|--------|------|--------|--------------|
| 1 | User onboarding & profile | 5 | Flutter, Node, DB |
| 2 | Single-person Josiyam | 6 | Flutter, Node, Groq |
| 3 | Couple Josiyam | 6 | Flutter, Node, Groq |
| 4 | Result & report view | 5 | Flutter, Node |
| 5 | Daily horoscope | 5 | Flutter, Node, Groq |
| 6 | Daily do's and don'ts | 4 | Flutter, Node, Groq |
| 7 | Tamil calendar | 5 | Flutter, Node, DB |
| 8 | Calculator | 4 | Flutter, Node, Groq |
| 9 | AI chat (contextual) | 6 | Flutter, Node, Groq |
| 10 | AI chat (standalone) | 5 | Flutter, Node, Groq |
| 11 | Auth & subscription | 7 | Flutter, Firebase, Node |
| 12 | Backend & DB | 7 | Node, DB |
| 13 | Hindu devotional & god-based | 35+ | Flutter, Node, DB, Groq |

**Total:** 13 modules, **100+ topics** (approx.)

*Module 13 pick list (implement now vs future): **DEVOTIONAL_FEATURES_LIST.md** (65 options).*

---

## API Endpoints (Reference)

| Method | Endpoint | Module |
|--------|----------|--------|
| POST | `/auth/verify` | 11 |
| GET  | `/profile` | 1 |
| POST | `/profile` | 1 |
| PUT  | `/profile` | 1 |
| POST | `/josiyam/single` | 2 |
| POST | `/josiyam/couple` | 3 |
| GET  | `/daily/horoscope` | 5 |
| GET  | `/daily/dos-donts` | 6 |
| GET  | `/calendar` | 7 |
| POST | `/calculator` | 8 |
| POST | `/calculator/explain` | 8 |
| POST | `/chat/contextual` | 9 |
| POST | `/chat/standalone` | 10 |
| GET  | `/subscription` | 11 |
| GET  | `/report/pdf` | 4 |
| GET  | `/devotional/today-god` | 13 |
| GET  | `/devotional/mantras` | 13 |
| GET  | `/devotional/daily-mantra` | 13 |
| GET  | `/devotional/pooja-steps` | 13 |
| GET  | `/devotional/songs` | 13 |
| GET  | `/devotional/daily-song` | 13 |
| GET  | `/devotional/videos` | 13 |
| GET  | `/devotional/daily-video` | 13 |
| GET  | `/devotional/books` | 13 |
| GET  | `/devotional/vrat-calendar` | 13 |
| GET  | `/devotional/festivals` | 13 |
| GET  | `/devotional/temples` | 13 |
| GET  | `/devotional/divya-desam` | 13 |

---

*End of document.*
