# ADR-001: Agent Framework Selection

**Date:** 2026-06-16  
**Status:** Decided  
**Decider:** Atlas (Architect Agent) + Lawrence Leymarie

---

## Problem

We need an agent orchestration framework that:
- Is Node.js/TypeScript native (matches our stack)
- Supports autonomous, multi-step task execution
- Has a clean abstraction for tools and integrations
- Is actively maintained and production-ready
- Does not impose heavy lock-in

## Options Considered

### Option A: OpenClaw Runtime
- **Pros:** Already familiar (it's our own host runtime), battle-tested in this workspace
- **Cons:** Not designed for multi-user SaaS; tightly coupled to OpenClaw's channel model; not open for user-facing product

### Option B: LangGraph (JS)
- **Pros:** Powerful graph-based orchestration, good for complex flows
- **Cons:** Python-first (JS port is behind), steeper learning curve, overkill for MVP

### Option C: Mastra
- **Pros:** TypeScript-native, built for autonomous agents, clean tool/integration model, active development, designed for production SaaS
- **Cons:** Newer project, smaller community than LangChain/LangGraph

### Option D: Custom Orchestration Layer
- **Pros:** Full control, no external dependency
- **Cons:** Significant build time, reinventing solved problems, maintenance burden

## Decision

**Mastra**

TypeScript-native, matches our stack exactly, purpose-built for the autonomous agent use case we're targeting. Community is small but growing fast and the API is clean enough that switching costs are low if needed.

## Tradeoffs

- Accepting some early-adopter risk on Mastra maturity
- Faster to ship than custom; more idiomatic than LangGraph JS

## Consequences

- Agent Runtime is built on Mastra's orchestration primitives
- Provider abstraction layer wraps Mastra's LLM calls (so Anthropic/OpenAI are pluggable)
- If Mastra proves limiting, the abstraction layer makes migration surgical rather than a full rewrite
