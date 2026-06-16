-- Agent Platform — Database Schema
-- Neon (Postgres)
-- Run once to initialize

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users (mirrors Clerk user)
CREATE TABLE users (
  id            TEXT PRIMARY KEY,          -- Clerk user_id
  email         TEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Agents
CREATE TABLE agents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  template      TEXT NOT NULL DEFAULT 'custom',
  instructions  TEXT,
  llm_provider  TEXT NOT NULL DEFAULT 'anthropic',  -- 'anthropic' | 'openai'
  llm_model     TEXT NOT NULL DEFAULT 'claude-opus-4-5',
  status        TEXT NOT NULL DEFAULT 'active',     -- 'active' | 'paused' | 'error'
  config        JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Encrypted API Keys (BYOK)
CREATE TABLE api_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,             -- 'anthropic' | 'openai'
  encrypted_key TEXT NOT NULL,             -- AES-256-GCM encrypted
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Connected OAuth Accounts
CREATE TABLE connected_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  integration_id  TEXT NOT NULL,           -- 'gmail' | 'google-calendar' | 'github' | etc.
  encrypted_token JSONB NOT NULL,          -- encrypted OAuthToken object
  scope           TEXT,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, integration_id)
);

-- Policy Rules (per agent)
CREATE TABLE policy_rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,               -- e.g. 'gmail.send'
  policy_type TEXT NOT NULL,               -- 'always_ask' | 'auto_approve' | 'rule_based'
  condition   TEXT,                        -- for rule_based
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, action_type)
);

-- Action Log (append-only, never delete)
CREATE TABLE action_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id          UUID NOT NULL REFERENCES agents(id),
  user_id           TEXT NOT NULL REFERENCES users(id),
  skill             TEXT NOT NULL,
  tool              TEXT NOT NULL,
  input             JSONB NOT NULL,
  output            JSONB,
  policy_decision   TEXT NOT NULL,         -- 'auto_approve' | 'approved' | 'denied' | 'pending'
  replay_payload    JSONB NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Queue
CREATE TABLE approvals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID NOT NULL REFERENCES agents(id),
  user_id     TEXT NOT NULL REFERENCES users(id),
  skill       TEXT NOT NULL,
  tool        TEXT NOT NULL,
  input       JSONB NOT NULL,
  risk_level  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'denied'
  decided_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Memory (long-term)
CREATE TABLE memories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'fact',     -- 'fact' | 'preference' | 'working'
  content     TEXT NOT NULL,
  embedding   vector(1536),                     -- for semantic search (pgvector)
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX ON agents(user_id);
CREATE INDEX ON api_keys(user_id);
CREATE INDEX ON connected_accounts(user_id);
CREATE INDEX ON action_logs(agent_id, created_at DESC);
CREATE INDEX ON action_logs(user_id, created_at DESC);
CREATE INDEX ON approvals(user_id, status);
CREATE INDEX ON memories(agent_id);
