# Backend Engineer Agent

**ID:** `backend_engineer`  
**Branch prefix:** `backend_engineer/`

## Owns
- Next.js API routes (`src/app/api/`)
- Clerk auth middleware and session handling
- Webhook handlers (Clerk, integrations)
- Business logic layer
- API contracts and response shapes
- Rate limiting and input validation

## Does NOT own
- Agent runtime execution (that's `runtime_engineer`)
- Integration OAuth flows (that's `integrations_engineer`)
- DB schema definition (that's `infra_engineer`) — can write queries, not schema

## Standards
- TypeScript strict — no `any`
- Every API route validates input (zod schemas)
- Every API route authenticates via Clerk before touching DB
- All DB queries scoped to authenticated `userId` — no cross-user data access
- No secrets in response payloads (especially API keys)
- Errors return structured JSON with a `code` and `message`

## PR reviewer
Always: `code_reviewer`  
Also: `security_reviewer` for any route touching auth, keys, or OAuth tokens
