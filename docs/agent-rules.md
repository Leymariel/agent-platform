# Agent Rules — Development Workflow

> This document defines the agent roster, responsibilities, branching conventions, and PR review loop.  
> Every agent must follow these rules. No exceptions.  
> Last updated: 2026-06-16

---

## 1. Agent Roster

### Engineer Agents

| Agent | ID | Owns |
|---|---|---|
| Frontend Engineer | `frontend_engineer` | Next.js UI, components, pages, onboarding flow, design system |
| Backend Engineer | `backend_engineer` | API routes, business logic, auth middleware, webhooks |
| Runtime Engineer | `runtime_engineer` | Agent runtime (Mastra), LLM provider abstraction, policy engine, action logger |
| Integrations Engineer | `integrations_engineer` | OAuth connectors, Gmail/Calendar/GitHub/Slack/Notion integrations, browser runner |
| Infra Engineer | `infra_engineer` | DB schema, migrations, Vercel config, Railway, Upstash, environment setup |

### Reviewer Agents

| Agent | ID | Reviews |
|---|---|---|
| Code Reviewer | `code_reviewer` | Code quality, architecture compliance, naming, logic, test coverage |
| Security Reviewer | `security_reviewer` | Auth, encryption, OAuth tokens, API key handling, permissions, dangerous actions |

### Orchestrator

| Agent | ID | Role |
|---|---|---|
| Atlas | `atlas` | Chief of staff. Assigns tasks, manages PRs, resolves escalations, consults Lawrence on scope/risk |

---

## 2. Branching Convention

**Format:** `{agent_id}/{short-description}`

**Examples:**
```
frontend_engineer/onboarding-flow
backend_engineer/byok-key-storage
runtime_engineer/provider-abstraction
integrations_engineer/gmail-oauth
infra_engineer/db-schema-migrations
```

**Rules:**
- All branches cut from `main`
- Branch names are lowercase, hyphen-separated
- No direct commits to `main` — everything goes through a PR
- Atlas is the only agent that merges to `main` (after reviewer sign-off)

---

## 3. PR Workflow

```
Engineer creates branch
        ↓
Engineer opens PR (draft ok while WIP)
        ↓
Engineer marks PR ready for review
        ↓
Atlas assigns reviewer(s):
  - code_reviewer always
  - security_reviewer if PR touches: auth, keys, OAuth, permissions, dangerous actions
        ↓
Reviewer posts review on GitHub (approve / request changes)
        ↓
  ┌─────────────────────────────────┐
  │ Changes requested?              │
  │  YES → notify engineer          │
  │       → engineer fixes + pushes │
  │       → reviewer re-reviews     │
  │  NO  → approved                 │
  └─────────────────────────────────┘
        ↓
All reviewers approved → Atlas merges to main
        ↓
Branch deleted
```

**PR rules:**
- PR title format: `{type}: {description}` (e.g. `feat: gmail oauth flow`, `fix: key decryption bug`)
- PR must include: what changed, why, how to test
- PR must link to the task or feature it implements
- PRs with `dangerous` risk-level tools must always involve `security_reviewer`

---

## 4. Review Standards

### Code Reviewer checklist
- [ ] Code follows the architecture layers (no reasoning in channel layer, all actions through policy engine)
- [ ] No hardcoded secrets or API keys
- [ ] Types are correct and complete (no `any` without justification)
- [ ] Functions are focused and named clearly
- [ ] No dead code or commented-out blocks
- [ ] Error handling is explicit (no silent failures)
- [ ] TODO comments are acceptable but must include context

### Security Reviewer checklist
- [ ] API keys are never logged
- [ ] API keys are never returned to the client after initial save
- [ ] OAuth tokens are encrypted at rest
- [ ] All DB queries are scoped to authenticated `user_id`
- [ ] Dangerous-risk tools require approval — never auto-approved
- [ ] No sensitive data in action log `input`/`output` fields (redact before logging)
- [ ] Encryption uses AES-256-GCM (see `src/lib/crypto/keys.ts`)

---

## 5. Task Assignment

Atlas assigns tasks to engineers in this format:

```
Agent: {agent_id}
Task: {description}
Branch: {agent_id}/{branch-name}
Files: list of files to create or modify
Acceptance criteria: what done looks like
Reviewer: code_reviewer [+ security_reviewer if applicable]
```

---

## 6. Escalation Rules

- **Engineer blocked?** → notify Atlas, who resolves or escalates to Lawrence
- **Security concern found in review?** → security_reviewer notifies Atlas immediately; Atlas decides: fix before merge, or consult Lawrence
- **Scope creep in PR?** → code_reviewer flags it; Atlas decides: split PR or proceed
- **Architecture violation?** → code_reviewer blocks merge; Atlas consults architect agent

---

## 7. Agents Under Consideration (not yet active)

These roles may be added as the project grows. Atlas will propose to Lawrence before activating:

| Agent | Trigger condition |
|---|---|
| QA Engineer | When we have enough UI to need structured test plans and E2E coverage |
| DevOps Engineer | When we move beyond Vercel defaults (CI/CD pipelines, staging environments) |
| Technical Writer | When we need user-facing docs or in-app help content |
| Data Engineer | If memory/vector storage grows complex enough to need dedicated ownership |

---

## 8. GitHub Conventions

- Default branch: `main`
- Protected: `main` (no direct push, require PR + review)
- Repo: `github.com/Leymariel/agent-platform`
- Labels to use on PRs: `feat`, `fix`, `chore`, `security`, `wip`, `blocked`, `needs-review`, `approved`
