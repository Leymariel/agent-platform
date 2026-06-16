# System Architecture — Autonomous Agent Platform

> **Last updated:** 2026-06-16  
> **Author:** Architect Agent  
> **Status:** Draft v1 — approved by Lawrence Leymarie

---

## 1. Overview

The Autonomous Agent Platform is a SaaS product that lets non-technical users create, deploy, and manage autonomous AI agents through a web UI — no code, no infrastructure knowledge, no documentation required.

North star: **signup → deployed agent in < 10 minutes.**

---

## 2. Layer Architecture

```
┌─────────────────────────────────────┐
│           Channel Layer             │  Web App (MVP), future: WhatsApp, Telegram, Slack
│   Transport only — no reasoning     │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│          Agent Runtime              │  Mastra orchestration, LLM calls, memory, policy
│   Stateless execution engine        │
└──────┬───────────┬──────────────────┘
       │           │
┌──────▼──────┐  ┌─▼───────────────────┐
│ Skill Layer │  │   Policy Engine      │  Every action passes through here
│ Composable  │  │   Approval system    │
│ task units  │  └─────────────────────┘
└──────┬──────┘
       │
┌──────▼──────────────────────────────┐
│           Tool Layer                │  Atomic operations (send email, create event, etc.)
└──────┬──────────────────────────────┘
       │
┌──────▼──────────────────────────────┐
│       Integrations Layer            │  Gmail, Calendar, GitHub, Slack, Notion, Browser
│   Common connector interface        │
└─────────────────────────────────────┘
```

**Rule:** No business logic or reasoning lives in the Channel Layer. Channels are transport only.

---

## 3. Core Components

### 3.1 Agent Object Model

Each user owns one or more agents. An agent is a persistent entity with:

```
Agent
├── id (uuid)
├── profile
│   ├── name
│   ├── avatar
│   └── template (executive_assistant | github_engineer | custom)
├── instructions (system prompt, user-defined)
├── memory
│   ├── working (ephemeral, per-session)
│   ├── long_term (persistent, Postgres + vector)
│   └── preferences (user prefs: meeting hours, writing style, contacts)
├── skills (installed skills from marketplace)
├── mcp_servers (installed MCP integrations)
├── policies (approval rules per action type)
├── connected_accounts (OAuth tokens, encrypted)
├── llm_config
│   ├── provider (anthropic | openai)
│   ├── model (claude-opus-4 | gpt-4o | etc.)
│   └── api_key_ref (pointer to encrypted user key)
└── logs (action log, paginated)
```

### 3.2 Agent Runtime (Mastra)

- **Framework:** Mastra (Node.js/TypeScript native, built for autonomous agents)
- **Execution:** Stateless per-run; state is persisted to Postgres between runs
- **LLM calls:** Routed through a provider abstraction layer (swap Anthropic ↔ OpenAI with no runtime change)
- **Every action** flows through the Policy Engine before execution
- **Every action** is written to the Action Log after execution

### 3.3 Policy Engine

Three policy types per action:
- `always_ask` — surface to user in Approval Queue before executing
- `auto_approve` — execute immediately, log it
- `rule_based` — evaluate condition (e.g., "PR under 50 changed lines") then auto or ask

Risk levels gate the defaults:
- **Safe** → default `auto_approve`
- **Medium** → default `always_ask`
- **Dangerous** → hard `always_ask`, user must explicitly downgrade

### 3.4 Action Log

Every autonomous action is written with:
```json
{
  "id": "uuid",
  "agent_id": "uuid",
  "user_id": "uuid",
  "timestamp": "ISO8601",
  "skill": "inbox_manager",
  "tool": "gmail.send",
  "input": { ... },
  "output": { ... },
  "policy_decision": "auto_approve | approved | denied",
  "replay_payload": { ... }
}
```

Actions must be replayable. This is a product requirement, not optional.

### 3.5 BYOK (Bring Your Own Key)

- User provides Anthropic and/or OpenAI API key during onboarding
- Key is validated on entry (test call, not stored until valid)
- Key is encrypted at rest using AES-256 before writing to DB
- Key is decrypted in-memory only at runtime, never logged
- User can update or revoke keys from settings at any time

---

## 4. Data Architecture

### 4.1 Database (Neon — Postgres)

Core tables:
- `users` — Clerk user_id, subscription, created_at
- `agents` — agent objects (JSON column for flexible fields)
- `connected_accounts` — encrypted OAuth tokens per user per provider
- `api_keys` — encrypted BYOK keys per user per provider
- `action_logs` — append-only action log
- `memories` — long-term agent memory (text + embeddings)
- `approvals` — pending approval queue items

### 4.2 Cache / Queue (Upstash — Redis + BullMQ)

- **Queue:** Agent task queue (triggered by schedule, webhook, or user action)
- **Cache:** Session working memory, rate limit state
- **Pub/sub:** Real-time Action Center updates to frontend

### 4.3 File Storage

- Vercel Blob (or Cloudflare R2) for agent-generated file artifacts

---

## 5. Integration Architecture

### 5.1 Common Connector Interface

Every integration implements:
```typescript
interface Connector {
  id: string;                          // e.g. "gmail"
  name: string;
  authType: "oauth2" | "apikey";
  scopes: string[];                    // OAuth scopes required
  tools: Tool[];                       // atomic operations exposed
  healthCheck(): Promise<boolean>;
  refreshToken?(token: OAuthToken): Promise<OAuthToken>;
}
```

Adding a new integration = implementing this interface. No changes to runtime.

### 5.2 MVP Integrations

| Integration | Auth | Tools |
|---|---|---|
| Gmail | OAuth2 | read, draft, send, archive, label |
| Google Calendar | OAuth2 | read, create, modify, delete |
| Google Drive | OAuth2 | search, read, upload, organize |
| GitHub | OAuth2 | repo read, issues, PRs, branches |
| Slack | OAuth2 | read channels, post messages |
| Notion | OAuth2 | read pages, create pages, update DB |
| Browser (Playwright) | N/A | open, navigate, fill, scrape |

### 5.3 Browser Automation

- Runs on **Railway** (Vercel cannot run Playwright)
- Isolated Chromium sandbox per execution
- Exposed as a tool to the runtime via internal API
- Always **Dangerous** risk level — requires explicit user approval

---

## 6. Authentication & Security

- **Auth:** Clerk (handles sign-up, OAuth, sessions)
- **API keys:** Encrypted at rest (AES-256), never logged or returned to client
- **OAuth tokens:** Encrypted at rest, refreshed automatically
- **Row-level security:** All DB queries scoped to authenticated user_id
- **Action log:** Append-only, never deletable by user (trust requirement)

---

## 7. Frontend Architecture

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Real-time:** Upstash pub/sub → server-sent events → Action Center UI
- **Key screens:**
  1. Onboarding (template picker → connect accounts → add API key → install skills → deploy)
  2. Agent Dashboard (status, recent actions, approval queue)
  3. Action Center (full action log, replay)
  4. Skills Marketplace
  5. MCP Marketplace
  6. Settings (agent config, permissions, API keys, connected accounts)

---

## 8. Deployment Architecture

| Service | Platform | Notes |
|---|---|---|
| Web app + API | Vercel | Edge functions for API routes |
| Postgres | Neon | Serverless Postgres, Vercel integration |
| Redis + Queue | Upstash | Serverless Redis, Vercel integration |
| Auth | Clerk | Vercel integration |
| Browser runner | Railway | Persistent container, Playwright |

---

## 9. Open Questions (to resolve before build)

- [ ] **Memory storage:** Pure Postgres vectors (pgvector) or dedicated vector DB (Pinecone)? Start with pgvector for simplicity.
- [ ] **Agent scheduling:** Cron-triggered or event-driven only for MVP? Recommend event-driven only for MVP.
- [ ] **Skill packaging format:** How are skills distributed/installed? File-based bundles vs. registry API?
- [ ] **Multi-agent:** MVP is single agent per user. Multi-agent collaboration is post-MVP.

---

## 10. What Is Not In MVP

- Mobile apps
- Multi-agent coordination
- Voice interface
- Bring Your Own Model (beyond Anthropic + OpenAI)
- Self-hosted / on-premise
- Team/org accounts (single user only at launch)
