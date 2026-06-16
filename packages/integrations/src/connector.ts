// Common Connector Interface
// Every integration must implement this
// The runtime speaks only this interface — never integration-specific code

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
}

export interface Tool {
  id: string;           // e.g. "gmail.send"
  name: string;
  description: string;
  riskLevel: 'safe' | 'medium' | 'dangerous';
  inputSchema: Record<string, unknown>; // JSON Schema
  outputSchema: Record<string, unknown>;
}

export interface Connector {
  id: string;                    // e.g. "gmail"
  name: string;
  description: string;
  authType: 'oauth2' | 'apikey';
  scopes: string[];              // OAuth scopes required
  tools: Tool[];

  // Execute a tool with a live token
  executeTool(toolId: string, input: Record<string, unknown>, token: OAuthToken): Promise<Record<string, unknown>>;

  // Verify the connection is healthy
  healthCheck(token: OAuthToken): Promise<boolean>;

  // Refresh OAuth token if needed
  refreshToken?(token: OAuthToken): Promise<OAuthToken>;
}
