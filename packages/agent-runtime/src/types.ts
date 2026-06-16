// Core types for the Agent Runtime

export type LLMProvider = 'anthropic' | 'openai';

export type RiskLevel = 'safe' | 'medium' | 'dangerous';

export type PolicyType = 'always_ask' | 'auto_approve' | 'rule_based';

export type PolicyDecision = 'auto_approve' | 'approved' | 'denied' | 'pending';

export interface AgentLLMConfig {
  provider: LLMProvider;
  model: string;
  apiKeyRef: string; // reference to encrypted key in DB — never the raw key
}

export interface AgentProfile {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  template: string;
  instructions: string;
  llmConfig: AgentLLMConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionLogEntry {
  id: string;
  agentId: string;
  userId: string;
  timestamp: Date;
  skill: string;
  tool: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  policyDecision: PolicyDecision;
  replayPayload: Record<string, unknown>;
}

export interface ApprovalRequest {
  id: string;
  agentId: string;
  userId: string;
  skill: string;
  tool: string;
  input: Record<string, unknown>;
  riskLevel: RiskLevel;
  createdAt: Date;
  decidedAt?: Date;
  decision?: 'approved' | 'denied';
}
