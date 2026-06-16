# ADR-002: Bring Your Own Key (BYOK) LLM Model

**Date:** 2026-06-16  
**Status:** Decided  
**Decider:** Lawrence Leymarie

---

## Problem

How do we handle LLM API costs — absorb them on the platform, or pass them to users?

## Options Considered

### Option A: Platform-managed keys
- **Pros:** Seamless UX, no user friction at setup
- **Cons:** Significant and unpredictable infrastructure cost; requires billing metering per user; complex abuse prevention

### Option B: BYOK (Bring Your Own Key)
- **Pros:** Zero LLM cost for platform; users pay exactly what they use; simpler billing model; aligns with power-user expectations
- **Cons:** One extra step in onboarding; users must have an Anthropic/OpenAI account

## Decision

**BYOK** — users provide their own API keys.

Lawrence made this call explicitly. Keeps MVP infra cost fixed and predictable (~$30–35/mo).

## Supported Providers (MVP)

- Anthropic (Claude)
- OpenAI (GPT-4o, etc.)

User selects a default model per agent. Can provide keys for both.

## Implementation Requirements

- Key validated on entry (test call before saving)
- Key encrypted at rest (AES-256)
- Key decrypted in-memory only at runtime
- Key never logged, never returned to client after save
- User can update or revoke from Settings at any time

## Consequences

- Onboarding has one extra step (add API key)
- UX copy must make this feel natural, not technical ("Connect your AI provider")
- Future option: platform-managed keys as a premium tier (post-MVP)
