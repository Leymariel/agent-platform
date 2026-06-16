# CONTEXT.md — Project State (Auto-updated)

> Read this first if you're a reset Atlas or a new agent picking up the project.

---

## What We're Building

**Autonomous Agent Platform** — a SaaS that lets non-technical users create, deploy, and manage autonomous AI agents through a web UI. No code, no docs required.

North star: signup → deployed agent in < 10 minutes.

Founder / operator: **Lawrence Leymarie**

---

## Current Phase

🟡 **Phase 1: Architecture & Scaffold**

---

## What's Done

- [x] Product vision defined (see `docs/product_vision.md`)
- [x] MVP scope defined (see `docs/mvp_scope.md`)
- [x] System architecture designed (see `docs/architecture.md`)
- [x] ADR-001: Agent framework → Mastra
- [x] ADR-002: LLM model → BYOK (Anthropic + OpenAI)
- [x] ADR-003: Infra stack → Vercel + Neon + Upstash + Clerk + Railway

## What's Next

- [ ] Create GitHub repo
- [ ] Scaffold monorepo (Next.js app, API, shared packages)
- [ ] Set up Vercel project + Neon + Upstash + Clerk
- [ ] Implement BYOK key management (encrypt/store/validate)
- [ ] Build agent runtime core (Mastra + provider abstraction)
- [ ] Gmail + Google Calendar OAuth integration
- [ ] Onboarding UI flow

---

## Key Decisions (summary)

- **Framework:** Mastra (TypeScript-native agent orchestration)
- **LLM:** BYOK — users bring Anthropic and/or OpenAI keys
- **Infra:** Vercel, Neon, Upstash, Clerk, Railway (for Playwright)
- **Repo:** Lawrence's personal GitHub, starting from scratch
- **Docs:** All design docs and ADRs live in `/docs` in the repo

---

## Where Docs Live

```
docs/
  architecture.md          ← system design
  decisions/               ← ADRs (why we chose things)
  integrations/            ← per-integration specs (coming)
  api/                     ← API contracts (coming)
  onboarding/              ← UX flows (coming)
CONTEXT.md                 ← this file
```
