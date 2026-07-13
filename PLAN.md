# PT Clinic App — Build Plan (A to Z)

A patient progress tracking platform for physical therapy clinics. Patients log pain, symptoms, exercises, and milestones between appointments; therapists see trends and alerts in real time; clinics get analytics and shareable/exportable reports.

This plan is written for a non-technical founder. Every choice includes the "why" in plain language.

---

## The Big Picture: How We'll Build This

We build in **phases**, starting with the smallest version that a real patient and therapist could actually use (the "MVP"), then layer on features. Why: shipping something usable early lets you show it to a real clinic, get feedback, and avoid spending months building features nobody asked for.

**One important reality check before we start (HIPAA):** while we're building and testing with *fake/demo data*, we can use normal developer tools freely. Before any *real patient data* touches the app, the companies hosting your data must sign a "Business Associate Agreement" (BAA) with you — that's the legal core of HIPAA compliance. The tools chosen below all offer BAAs on their paid/team plans, so we won't have to rebuild anything later — we just upgrade the plan and sign the paperwork before launch. This is Phase 7.

---

## The Technology Choices (and Why, Simply)

| Choice | What it is | Why this one |
|---|---|---|
| **Next.js (with React)** | The framework the app is built with | One codebase gives you both the website and a phone-friendly app (installable on home screens as a "PWA"). Biggest ecosystem, easiest to hire help for later. |
| **Supabase** | The database + login system + file storage | One service covers patient records, secure logins, and storing exercise videos/photos. It has built-in "row-level security" (a patient can only ever see their own data — enforced by the database itself, not just the app). Offers HIPAA compliance with a signed BAA on its Team plan. |
| **Tailwind CSS + shadcn/ui** | Pre-built, professional-looking screen components | Gets a polished, trustworthy medical look fast without a designer. |
| **Recharts** | The graphing library | Clean, simple progress charts — the heart of the patient's "I can see myself getting better" experience. |
| **Three.js (react-three-fiber)** | The 3D engine for the interactive anatomy viewer | The standard way to put interactive 3D in a web app — runs on any phone or laptop browser, no download needed. We load professional 3D anatomy models into it and highlight the muscles each exercise targets. |
| **3D anatomy models: open-source (Z-Anatomy) first, licensed (e.g., BioDigital) if needed** | The actual 3D body models | Open-source medical models keep costs at $0 and give us full ownership; if a pilot clinic demands photorealistic quality, we can swap in a licensed provider later without rebuilding the app. |
| **Vercel** | Where the app lives on the internet | Made by the Next.js team; deploys automatically every time we push code to GitHub. (Offers HIPAA/BAA on its Enterprise plan; if that's too pricey at launch, we can host on AWS instead — the app code doesn't change.) |
| **Resend (email) + Twilio (SMS)** | Sends appointment & exercise reminders | Both are HIPAA-eligible with a BAA. Reminders will be worded to contain no health details ("You have an exercise session today") which keeps things simpler and safer. |

Why not a no-code tool (Bubble, Glide, etc.)? Health data + role-based access + HIPAA is exactly where no-code platforms hit walls. Real code, built by AI with you directing it, gives you ownership and no ceiling.

---

## The Phases

### Phase 1 — Foundation & Design (what we build first)
- Set up the project, the database, and secure login with **three roles**: Patient, Therapist, Clinic Admin.
- Design the database tables: patients, therapists, clinics, pain logs, symptom logs, exercises, exercise completions, milestones, messages, appointments, questionnaires.
- **Why first:** the roles and data structure are the skeleton — everything else hangs on them, and getting security right from day one is much easier than bolting it on later.

### Phase 2 — The Patient MVP (the core loop)
- **Daily pain check-in** (0–10 slider — takes 10 seconds, because if logging is a chore, patients stop).
- **Body-map pain logging**: tap a body diagram to pinpoint exactly where it hurts — faster than typing for patients, and cleaner, chartable data for therapists.
- **Symptom logging** (new pain / worse / better, with notes).
- **Exercise adherence** (today's assigned exercises: done / skipped / difficulty 1–5).
- **Patient recovery dashboard**: progress graphs of pain over time, exercise streaks, and milestone badges.
- **Why this order:** this is the psychological engine of the product — patients seeing their own progress. If this loop works, everything else has data to feed on.

### Phase 3 — The Therapist Side
- **Therapist dashboard**: patient list with trend sparklines, sorted by "who needs attention."
- **Alerts** for concerning changes (e.g., pain rising 2+ points over 3 days, missed exercises 4 days in a row).
- **Home exercise program builder**: therapist assigns exercises and uploads **videos/photos** demonstrating them (stored in Supabase Storage, private per patient).
- **Milestone & measurement tracking**: range of motion, strength grades, functional milestones entered at appointments — these appear on the patient's progress graphs too.
- **Secure messaging / check-ins** between patient and therapist (inside the app, not email/SMS — that's what keeps it HIPAA-safe).

### Phase 4 — Interactive 3D Anatomy & Exercise Education
The signature feature: patients don't just do their exercises — they *see and understand* what each one is doing to their body. Research on home-exercise adherence consistently shows patients stick with programs far better when they understand the "why."

Built in two stages, because 3D is the most technically ambitious part of the app:

- **Stage A — the interactive viewer:**
  - Every patient gets a 3D model of their injured region (shoulder, knee, hip, spine, etc.) they can rotate, zoom, and explore on any phone or computer — no app download.
  - Tap any muscle, tendon, or bone to see its name and a plain-language explanation of what it does.
  - **Exercise mapping:** open any exercise in your plan and the muscles it strengthens or stretches light up on the model, with an explanation of *why* — e.g., "this strengthens your gluteus medius, which stabilizes your pelvis so your knee stops collapsing inward."
  - An "Understand your injury" view: the injured structure is highlighted with a short explanation of what happened and how it heals.
- **Stage B — effects and progress on the body:**
  - Simple animations showing the movement each exercise produces and the muscle doing its job during it.
  - **Progress overlay:** as strength measurements improve (from Phase 3), the muscles you've been building visually change on your model — your progress graphs and your 3D body telling the same story.

**Honest expectations:** this is the most complex feature in the plan — it's why it gets its own phase after the core product works. We start with open-source medical 3D models (free, we own everything) and one or two body regions (e.g., knee and shoulder, the most common PT injuries), prove patients love it, then expand region by region. Educational anatomy content isn't patient data, so this adds zero HIPAA burden.

### Phase 5 — Questionnaires & Reminders
- **Patient-reported outcome questionnaires**: standard, insurance-recognized ones (e.g., pain, function, quality-of-life scales), scheduled automatically (e.g., every 2 weeks). Why standard forms: insurers and physicians already trust them, which makes your reports credible.
- **Appointment reminders + home-exercise reminders** via email/SMS (content-free of health details).
- **Wearable integration (Apple Health, Fitbit, Oura)**: steps, activity and sleep sync in automatically — less manual logging for patients, and objective adherence/recovery signals for therapists.

### Phase 6 — Reports & Clinic Analytics
- **Progress reports** (PDF): pain trend, adherence %, milestones, questionnaire scores — shareable with **referring physicians** (patient consents with one tap) and exportable for **insurance documentation**.
- **Clinic analytics dashboard**: average recovery timelines by condition, adherence rates, outcome improvements — with an "export for marketing" view that shows only aggregate, de-identified numbers (safe to publish).

### Phase 7 — HIPAA Hardening & Launch
- Sign BAAs (Supabase Team plan; Vercel Enterprise or move hosting to AWS; Twilio; Resend).
- Turn on the compliance checklist: audit logs (who viewed what, when), automatic session timeouts, encrypted backups, data-export/delete for patients, a privacy policy and consent flow.
- Security review of the whole codebase (I have a built-in security-review skill for exactly this).
- **Pilot with one friendly clinic**, fix what they trip over, then open up.

### Phase 8 — Later / Nice-to-Have
- Native iOS/Android apps (only if the installable web app proves insufficient), EHR integrations (Epic/Cerner), more 3D body regions and photorealistic licensed anatomy models — these are expensive; wait for real demand.

---

## What You Need to Connect (and How)

Connections are added at **claude.ai → Settings → Connectors → "Browse connectors" or "Add custom connector"**, then enabled per-chat with the paperclip/connector toggle. Also enable **"connector suggestions"** in Settings so I can recommend and link them directly in chat.

| Tool | Why I need it | Status |
|---|---|---|
| **GitHub** | Where the code lives; I read/write it and open pull requests for you | ✅ Already connected |
| **Google Drive** | I can pull in any docs you have (clinic workflows, questionnaire forms, branding) | ✅ Already connected |
| **Supabase** (when we start Phase 1) | Lets me create and manage your database directly | Sign up at supabase.com (free to start), then add its connector |
| **Vercel** (when we first deploy) | Lets me deploy the app and check it's live | Sign up at vercel.com (free to start), then add its connector |
| **Twilio / Resend** (Phase 4) | Sending SMS/email reminders | Sign up when we get there; I just need the API keys added as project secrets |

You don't need Supabase/Vercel accounts today — I'll tell you exactly when and walk you through each signup (each takes ~5 minutes).

---

## What It Costs (Rough Guide)

- **While building/testing (fake data):** ~$0/month — free tiers cover everything.
- **At launch with real patients:** Supabase Team ~$599/mo (this is the HIPAA/BAA tier), hosting ~$20–150/mo (or AWS alternative), SMS ~1¢/message. Realistically **a few hundred to ~$800/month** to be properly HIPAA-compliant — this is the real cost of handling patient data, and it's what clinics will expect you to have.

## How You and I Work Together

1. You describe what you want in plain English; I write all the code, commit it to GitHub, and show you previews.
2. Each phase ends with something you can click around in and react to.
3. I'll use my built-in skills as we go: **dataviz** (for designing the progress charts well), **verify** and **code-review** (checking my own work), and **security-review** (before launch).

**Next step:** say the word and I'll start Phase 1 — project setup, database design, and login with the three roles.
