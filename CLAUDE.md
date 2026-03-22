# Tresor Hunt — Project Context

## What This Is
Tresor Hunt is a real-world scavenger hunt / ARG (Alternate Reality Game) platform. Players compete in live, location-based treasure hunts with clues, rankings, and post-game content.

## Domains
- **Primary:** tresorhunt.com
- **Redirect:** tresorhunter.com
- Both registered on Hostinger. DNS pointed to Netlify.

## Current Phase: 1 — Waitlist Landing Page
A branded landing page collecting email + city/region signups before the platform launches. Emails are verified via Resend. Location data is stored to map interest by city.

## Tech Stack
- **Frontend:** HTML + CSS + JS (no framework)
- **Hosting:** Netlify (free tier, GitHub-connected)
- **Database:** Supabase (Postgres) — table: `waitlist`
- **Email:** Resend.com — sender: hello@tresorhunt.com
- **Serverless:** Netlify Functions (subscribe.js, verify.js)

## Supabase Table: landing_waitlist
```sql
id          uuid primary key default gen_random_uuid()
email       text unique not null
zipcode     bigint
verified    boolean default false
token       text
created_at  timestamptz default now()
```

## Brand
- Colors: #0d0d1a (bg), #FFD93D (gold), #FF6B6B (red), #FF9A3C (orange)
- Fonts: Bebas Neue (headings), Nunito (body)
- Logo: compass + treasure chest + QR corner markers
- Vibe: dark, mysterious, fun — real-world adventure game

## Phase 2 Roadmap
- Participant portal (login, clue submission)
- Live leaderboard / rankings
- In-hunt communication tools
- Post-game YouTube video + leaderboard reveal
- AI-assisted clue checking and video editing
