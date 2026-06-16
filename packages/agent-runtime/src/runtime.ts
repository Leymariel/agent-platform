// Agent Runtime Core
// Orchestrates skill execution, policy checks, and action logging

import { evaluatePolicy, type PolicyRule } from './policy';
import { callLLM } from './provider';
import type { AgentProfile, ActionLogEntry } from './types';

export interface SkillExecutionContext {
  agent: AgentProfile;
  skill: string;
  tool: string;
  input: Record<string, unknown>;
  decryptedApiKey: string; // injected by secure key service — never persisted
  policyRules: PolicyRule[];
}

export interface SkillExecutionResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
  logEntry: ActionLogEntry;
}

export async function executeSkill(ctx: SkillExecutionContext): Promise<SkillExecutionResult> {
  // 1. Evaluate policy — every action must pass through
  const riskLevel = resolveRiskLevel(ctx.skill, ctx.tool);
  const policyResult = evaluatePolicy({
    agentId: ctx.agent.id,
    userId: ctx.agent.userId,
    skill: ctx.skill,
    tool: ctx.tool,
    riskLevel,
    input: ctx.input,
    rules: ctx.policyRules,
  });

  if (policyResult.decision === 'pending') {
    // Surface to approval queue — do not execute
    return {
      success: false,
      error: 'Awaiting user approval',
      logEntry: buildLogEntry(ctx, {}, 'pending'),
    };
  }

  // 2. Execute the tool
  // TODO: route to appropriate integration handler
  const output = {};

  // 3. Log the action (append-only)
  const logEntry = buildLogEntry(ctx, output, policyResult.decision);

  return { success: true, output, logEntry };
}

function resolveRiskLevel(skill: string, tool: string) {
  // TODO: load from skill/tool registry
  // Defaults to safe until registry is built
  return 'safe' as const;
}

function buildLogEntry(
  ctx: SkillExecutionContext,
  output: Record<string, unknown>,
  decision: string
): ActionLogEntry {
  return {
    id: crypto.randomUUID(),
    agentId: ctx.agent.id,
    userId: ctx.agent.userId,
    timestamp: new Date(),
    skill: ctx.skill,
    tool: ctx.tool,
    input: ctx.input,
    output,
    policyDecision: decision as ActionLogEntry['policyDecision'],
    replayPayload: {
      skill: ctx.skill,
      tool: ctx.tool,
      input: ctx.input,
      agentId: ctx.agent.id,
    },
  };
}
