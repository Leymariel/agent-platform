# ADR-003: Infrastructure Stack

**Date:** 2026-06-16  
**Status:** Decided  
**Decider:** Lawrence Leymarie + Atlas

---

## Decision

| Layer | Choice | Rationale |
|---|---|---|
| Hosting | Vercel | Lawrence's preference; best-in-class Next.js deployment |
| Database | Neon (Postgres) | Native Vercel integration; serverless; free tier sufficient for MVP |
| Cache + Queue | Upstash (Redis + BullMQ) | Native Vercel integration; serverless-friendly; no always-on cost |
| Auth | Clerk | Fastest path to OAuth flows; handles Google/GitHub OAuth; non-technical UX |
| Browser Automation | Playwright on Railway | Vercel cannot run headless Chromium; Railway persistent container solves this |
| Repo | Lawrence's personal GitHub | Starting fresh, no existing org |

## What This Costs

**MVP / Prototype phase:** ~$30–35/mo fixed (Vercel Pro $20 + Railway $5–10 + free tiers everywhere else). LLM costs borne by users (BYOK).

## Consequences

- Browser automation requires a separate Railway service and internal API between it and the Vercel runtime
- All other services integrate natively via Vercel integrations (minimal config)
- Stack is entirely serverless — no always-on infra to manage
