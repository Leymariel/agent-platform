// LLM Provider Abstraction Layer
// Swap Anthropic ↔ OpenAI with zero runtime changes
// Add new providers here without touching anything else

import type { LLMProvider } from './types';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMCallOptions {
  provider: LLMProvider;
  model: string;
  apiKey: string; // decrypted at runtime, never persisted
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
}

export async function callLLM(options: LLMCallOptions): Promise<LLMResponse> {
  switch (options.provider) {
    case 'anthropic':
      return callAnthropic(options);
    case 'openai':
      return callOpenAI(options);
    default:
      throw new Error(`Unsupported LLM provider: ${options.provider}`);
  }
}

async function callAnthropic(options: LLMCallOptions): Promise<LLMResponse> {
  // Implementation: Anthropic Messages API
  // TODO: implement with @anthropic-ai/sdk
  throw new Error('Not yet implemented');
}

async function callOpenAI(options: LLMCallOptions): Promise<LLMResponse> {
  // Implementation: OpenAI Chat Completions API
  // TODO: implement with openai sdk
  throw new Error('Not yet implemented');
}
