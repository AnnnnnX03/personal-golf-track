# ⛳ Golf Practice Tracker

A personal training log for golf practice — built because every golf app on the market tracks your *round scores*, not the *practice quality* that actually improves your swing.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose-4285F4?logo=google&logoColor=white)

---

##  Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Next.js + TypeScript |
| Backend / Database | Supabase (Postgres + Storage) |
| Computer vision | MediaPipe Pose (runs client-side, in-browser) |
| Charts | Recharts |
| Deployment | Vercel |

---
## 📝 Background & The Problem

Every mainstream golf app (18Birdies, Golfshot, etc.) is built around **rounds**: score, handicap, stats per hole. That's useful once you can already play but it says nothing about *how* you're practicing. There's no good way to log a range session, note what a specific swing felt like, or track a technical cue across weeks of drills. So I built the tool I actually wanted: a **practice journal**, not a scorecard.

This is a working personal tool I made for my own practice, not a polished multi-user product (row-level security is currently permissive, since it's single-user). The video analysis is the parts I'm most likely to keep extending, next on the list is tracking a metric like X-Factor across sessions to see real trend lines, not just a one-off snapshot per swing.


##  What it does

- **Session logging** — log practice sessions by club(s), drill type (full swing, half swing, short game, putting, warm-up), distance, ball flight direction, and free-text notes on how the swing felt
- **Trend dashboard** — Recharts visualizations of practice frequency and patterns over time, filterable by club
- **Swing video library** — upload swing videos to Supabase Storage, organized by club and drill type
- **AI swing analysis** — the standout feature: videos are run through **MediaPipe Pose** entirely in the browser (no server-side processing) to extract body landmarks, then compute real coaching metrics:
  - **X-Factor** (shoulder–hip separation angle)
  - **Wrist angle** at impact
  - **Finish balance** score
  - Plain-language insights generated from the computed metrics
- **Side-by-side video compare** — sync two swing videos to play/pause/reset together, for comparing technique across sessions

##  Architecture notes

- Swing analysis runs **fully client-side**: MediaPipe's model is loaded from CDN and pose estimation happens in the browser, so no video ever needs to leave the client for AI processing
- The pipeline samples every 5th video frame, feeds it to the Pose model, then post-processes the landmark sequence to find the impact frame and derive joint angles — see `lib/swingAnalysis.ts`
- Video files live in Supabase Storage; session/video metadata lives in Postgres

```
┌────────────┐   upload   ┌──────────────────┐
│  Swing     │ ─────────▶ │ Supabase Storage  │
│  video     │            │  (swing-videos)   │
└────────────┘            └──────────────────┘
       │
       │ on "Analyze"
       ▼
┌─────────────────────────┐
│  MediaPipe Pose         │  ← runs in-browser, no server round-trip
│  (frame sampling →      │
│   landmark extraction)  │
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Angle math             │
│ (X-Factor, wrist angle, │
│   finish balance)       │
└─────────────────────────┘
```

##  Project structure

```
app/
  page.tsx                # Home
  log/page.tsx            # Practice session logging
  dashboard/page.tsx      # Trend charts
  videos/page.tsx         # Swing video library + upload
  compare/page.tsx        # Side-by-side video comparison
components/
  SwingAnalysis.tsx       # AI analysis UI
lib/
  supabase.ts             # Supabase client + types
  swingAnalysis.ts        # MediaPipe pose pipeline + angle math
```

##  Running locally

```bash
npm install
cp .env.local.example .env.local
# fill in your own Supabase project URL + anon key
npm run dev
```

Run the SQL in the project's setup notes against your Supabase project to create the `sessions` and `videos` tables and the `swing-videos` storage bucket.

---

