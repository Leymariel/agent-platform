// Gmail Connector
// Implements the Connector interface for Gmail via Google APIs

import type { Connector, OAuthToken, Tool } from './connector';

export const gmailConnector: Connector = {
  id: 'gmail',
  name: 'Gmail',
  description: 'Read, draft, send, archive, and label emails',
  authType: 'oauth2',
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
  ],
  tools: [
    {
      id: 'gmail.list_messages',
      name: 'List Messages',
      description: 'List recent emails from inbox',
      riskLevel: 'safe',
      inputSchema: { type: 'object', properties: { maxResults: { type: 'number' }, query: { type: 'string' } } },
      outputSchema: { type: 'object' },
    },
    {
      id: 'gmail.get_message',
      name: 'Get Message',
      description: 'Read a specific email by ID',
      riskLevel: 'safe',
      inputSchema: { type: 'object', properties: { messageId: { type: 'string' } }, required: ['messageId'] },
      outputSchema: { type: 'object' },
    },
    {
      id: 'gmail.draft',
      name: 'Draft Email',
      description: 'Create a draft email (does not send)',
      riskLevel: 'medium',
      inputSchema: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['to', 'subject', 'body'],
      },
      outputSchema: { type: 'object' },
    },
    {
      id: 'gmail.send',
      name: 'Send Email',
      description: 'Send an email on behalf of the user',
      riskLevel: 'dangerous',
      inputSchema: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['to', 'subject', 'body'],
      },
      outputSchema: { type: 'object' },
    },
    {
      id: 'gmail.archive',
      name: 'Archive Email',
      description: 'Archive an email (removes from inbox)',
      riskLevel: 'medium',
      inputSchema: { type: 'object', properties: { messageId: { type: 'string' } }, required: ['messageId'] },
      outputSchema: { type: 'object' },
    },
    {
      id: 'gmail.label',
      name: 'Label Email',
      description: 'Apply a label to an email',
      riskLevel: 'safe',
      inputSchema: {
        type: 'object',
        properties: { messageId: { type: 'string' }, labelName: { type: 'string' } },
        required: ['messageId', 'labelName'],
      },
      outputSchema: { type: 'object' },
    },
  ],

  async executeTool(toolId, input, token) {
    // TODO: implement with googleapis client
    throw new Error(`Gmail tool not yet implemented: ${toolId}`);
  },

  async healthCheck(token) {
    // TODO: lightweight profile fetch to verify token is valid
    return false;
  },

  async refreshToken(token) {
    // TODO: refresh via Google OAuth2 token endpoint
    throw new Error('Token refresh not yet implemented');
  },
};
