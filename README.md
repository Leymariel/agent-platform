# Agent Platform

> Creating an autonomous AI employee should be as easy as creating a Shopify store.

A SaaS platform that lets non-technical users create, deploy, and manage autonomous AI agents through a polished web UI — no code, no documentation, no infrastructure knowledge required.

**North star:** signup → deployed agent in < 10 minutes.

---

## What It Does

Users create agents by:
1. Choosing a template (Executive Assistant, GitHub Engineer, etc.)
2. Connecting their accounts (Gmail, Calendar, GitHub…)
3. Installing skills from the marketplace
4. Configuring approval permissions
5. Deploying

The agent starts working immediately.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind, shadcn/ui |
| Backend | Node.js, TypeScript |
| Database | Neon (Postgres) |
| Auth | Clerk |
| Queue | Upstash (BullMQ) |
| Cache | Upstash (Redis) |
| Agent Framework | Mastra |
| Browser Automation | Playwright on Railway |
| Hosting | Vercel |
| LLM | BYOK — Anthropic + OpenAI |

---

## Docs

- [`docs/architecture.md`](docs/architecture.md) — System design
- [`docs/decisions/`](docs/decisions/) — Architecture Decision Records
- [`CONTEXT.md`](CONTEXT.md) — Current build state (start here if picking up mid-project)

---

## Status

🟡 Phase 1: Architecture & Scaffold
