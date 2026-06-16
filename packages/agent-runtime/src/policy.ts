// Policy Engine
// Every action passes through here before execution
// No action should bypass this

import type { RiskLevel, PolicyType, PolicyDecision, ApprovalRequest } from './types';

export interface PolicyRule {
  actionType: string;      // e.g. "gmail.send", "github.create_pr"
  policyType: PolicyType;
  condition?: string;      // for rule_based: e.g. "changed_lines < 50"
}

export interface PolicyEvalInput {
  agentId: string;
  userId: string;
  skill: string;
  tool: string;
  riskLevel: RiskLevel;
  input: Record<string, unknown>;
  rules: PolicyRule[];
}

export interface PolicyEvalResult {
  decision: PolicyDecision;
  approvalRequest?: ApprovalRequest; // set if decision === 'pending'
}

export function evaluatePolicy(input: PolicyEvalInput): PolicyEvalResult {
  // 1. Dangerous actions always require approval — non-negotiable
  if (input.riskLevel === 'dangerous') {
    return {
      decision: 'pending',
      approvalRequest: buildApprovalRequest(input),
    };
  }

  // 2. Find matching rule
  const actionKey = `${input.skill}.${input.tool}`;
  const rule = input.rules.find(r => r.actionType === actionKey);

  if (!rule) {
    // Default: safe → auto_approve, medium → always_ask
    if (input.riskLevel === 'safe') return { decision: 'auto_approve' };
    return { decision: 'pending', approvalRequest: buildApprovalRequest(input) };
  }

  switch (rule.policyType) {
    case 'auto_approve':
      return { decision: 'auto_approve' };
    case 'always_ask':
      return { decision: 'pending', approvalRequest: buildApprovalRequest(input) };
    case 'rule_based':
      // TODO: evaluate rule.condition against input
      // For now, fall back to always_ask
      return { decision: 'pending', approvalRequest: buildApprovalRequest(input) };
  }
}

function buildApprovalRequest(input: PolicyEvalInput): ApprovalRequest {
  return {
    id: crypto.randomUUID(),
    agentId: input.agentId,
    userId: input.userId,
    skill: input.skill,
    tool: input.tool,
    input: input.input,
    riskLevel: input.riskLevel,
    createdAt: new Date(),
  };
}
