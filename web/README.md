# Stride — web app

The real application for the PT patient progress tracking platform. This is the
functional build; the polished visual design (see `../prototype/index.html`) is
applied as the final phase.

## Stack

- **Next.js 16** (App Router, React Server Components) — one codebase for web + installable mobile
- **Prisma 7** ORM — type-safe database access
- **SQLite** for local development (zero setup); **Supabase Postgres** in production
- **Tailwind CSS v4** for styling
- **Recharts** for progress graphs

## Run it locally

```bash
cd web
cp .env.example .env      # sets the local SQLite path
npm install               # also generates the Prisma client (postinstall)
npm run db:setup          # creates the database and loads demo data
npm run dev               # http://localhost:3000
```

Open http://localhost:3000 and pick a role (Patient / Therapist / Clinic).

## What works today (Phase 1)

- Full database schema for the whole product (patients, therapists, clinics,
  pain logs, symptoms, exercises + completions, measurements, milestones,
  messages, appointments, questionnaires, wearables). See `prisma/schema.prisma`.
- Seeded demo world (Sarah's ACL recovery, therapist James, Riverside clinic,
  a patient roster). See `prisma/seed.ts`.
- **Patient** dashboard: recovery score, stat tiles, pain-trend chart, daily
  check-in with body-region **(writes to the database)**, today's exercises with
  mark done/skip + difficulty **(writes to the database)**, milestones, wearable summary.
- **Therapist** dashboard: patient roster with pain sparklines and a
  pain-rising alert rule.
- **Clinic** overview: aggregate stats.

## Not built yet (next steps)

- Real authentication and per-user accounts (currently a role picker stands in)
- Secure messaging UI, the interactive 3D anatomy view, PDF reports
- Move to Supabase (Postgres + Auth + Storage) with row-level security
- The polished visual design

## Project layout

```
prisma/schema.prisma   the data model (source of truth)
prisma/seed.ts         demo data
src/lib/db.ts          Prisma client
src/lib/queries.ts     data-access + recovery-score logic
src/app/               pages: / (role picker), /patient, /therapist, /clinic
src/app/patient/actions.ts   server actions (check-in, mark exercise) — real DB writes
src/components/        UI building blocks + charts
```
