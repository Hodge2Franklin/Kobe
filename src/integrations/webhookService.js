/**
 * Webhook Handler Service for Kobe Workflow Builder
 * 
 * This service provides functionality to create, manage, and process
 * incoming webhooks for workflow automation.
 */

class WebhookService {
  constructor() {
    this.registeredWebhooks = new Map();
    this.webhookHistory = [];
  }

  /**
   * Register a new webhook endpoint
   * 
   * @param {Object} config - The webhook configuration
   * @param {string} config.path - URL path for the webhook (e.g., '/hooks/my-webhook')
   * @param {string} config.description - Description of the webhook purpose
   * @param {string} config.authType - Authentication type (none, token, hmac)
   * @param {Object} config.authConfig - Authentication configuration
   * @param {Function} config.handler - Function to handle incoming webhook data
   * @returns {Object} - The registered webhook details
   */
  registerWebhook(config) {
    try {
      console.log(`Registering webhook at path: ${config.path}`);
      
      // Validate required fields
      if (!config.path || !config.handler) {
        throw new Error('Webhook path and handler function are required');
      }
      
      // Generate webhook ID
      const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create webhook configuration
      const webhook = {
        id: webhookId,
        path: config.path,
        description: config.description || 'Webhook endpoint',
        authType: config.authType || 'none',
        authConfig: config.authConfig || {},
        handler: config.handler,
        createdAt: new Date().toISOString(),
        url: `https://api.kobeapp.com/webhooks${config.path}`,
      };
      
      // Store webhook
      this.registeredWebhooks.set(webhookId, webhook);
      
      return {
        id: webhook.id,
        path: webhook.path,
        url: webhook.url,
        description: webhook.description,
        authType: webhook.authType,
      };
    } catch (error) {
      console.error('Webhook registration failed:', error);
      throw error;
    }
  }
  
  /**
   * Process incoming webhook data
   * 
   * @param {Object} config - The webhook processing configuration
   * @param {string} config.path - URL path of the incoming webhook
   * @param {Object} config.headers - Request headers
   * @param {Object|string} config.body - Request body
   * @returns {Promise<Object>} - The processing result
   */
  async processWebhook(config) {
    try {
      console.log(`Processing webhook request for path: ${config.path}`);
      
      // Find matching webhook
      const webhook = Array.from(this.registeredWebhooks.values())
        .find(hook => hook.path === config.path);
      
      if (!webhook) {
        throw new Error(`No webhook registered for path: ${config.path}`);
      }
      
      // Validate authentication
      this._validateWebhookAuth(webhook, config.headers);
      
      // Record webhook request in history
      const historyEntry = {
        webhookId: webhook.id,
        path: config.path,
        timestamp: new Date().toISOString(),
        headers: config.headers,
        body: config.body,
      };
      
      this.webhookHistory.push(historyEntry);
      
      // Process webhook data through handler
      const result = await webhook.handler(config.body, config.headers);
      
      return {
        status: 'success',
        webhookId: webhook.id,
        result,
      };
    } catch (error) {
      console.error('Webhook processing failed:', error);
      throw error;
    }
  }
  
  /**
   * Get webhook history
   * 
   * @param {Object} config - The history retrieval configuration
   * @param {string} config.webhookId - Optional ID to filter history by webhook
   * @param {number} config.limit - Maximum number of entries to return
   * @returns {Array} - Webhook history entries
   */
  getWebhookHistory(config = {}) {
    try {
      let history = [...this.webhookHistory];
      
      // Filter by webhook ID if provided
      if (config.webhookId) {
        history = history.filter(entry => entry.webhookId === config.webhookId);
      }
      
      // Sort by timestamp (newest first)
      history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Apply limit if provided
      if (config.limit && config.limit > 0) {
        history = history.slice(0, config.limit);
      }
      
      return history;
    } catch (error) {
      console.error('Error retrieving webhook history:', error);
      throw error;
    }
  }
  
  /**
   * Delete a registered webhook
   * 
   * @param {string} webhookId - ID of the webhook to delete
   * @returns {boolean} - Whether the webhook was successfully deleted
   */
  deleteWebhook(webhookId) {
    try {
      console.log(`Deleting webhook with ID: ${webhookId}`);
      
      if (!this.registeredWebhooks.has(webhookId)) {
        throw new Error(`Webhook with ID ${webhookId} not found`);
      }
      
      return this.registeredWebhooks.delete(webhookId);
    } catch (error) {
      console.error('Webhook deletion failed:', error);
      throw error;
    }
  }
  
  /**
   * Validate webhook authentication
   * 
   * @param {Object} webhook - Webhook configuration
   * @param {Object} headers - Request headers
   * @throws {Error} - If authentication fails
   */
  _validateWebhookAuth(webhook, headers) {
    switch (webhook.authType) {
      case 'token':
        const token = headers['x-webhook-token'] || headers['authorization'];
        if (!token || token !== webhook.authConfig.token) {
          throw new Error('Invalid webhook token');
        }
        break;
        
      case 'hmac':
        const signature = headers['x-webhook-signature'];
        if (!signature) {
          throw new Error('Missing webhook signature');
        }
        // In a real implementation, this would validate the HMAC signature
        // using the webhook secret and request body
        break;
        
      case 'none':
        // No authentication required
        break;
        
      default:
        throw new Error(`Unsupported authentication type: ${webhook.authType}`);
    }
  }
  
  /**
   * Generate a mock webhook request for testing
   * 
   * @param {string} webhookId - ID of the webhook to test
   * @param {Object} payload - Test payload data
   * @returns {Promise<Object>} - The test result
   */
  async testWebhook(webhookId, payload = {}) {
    try {
      console.log(`Testing webhook with ID: ${webhookId}`);
      
      if (!this.registeredWebhooks.has(webhookId)) {
        throw new Error(`Webhook with ID ${webhookId} not found`);
      }
      
      const webhook = this.registeredWebhooks.get(webhookId);
      
      // Create mock headers
      const headers = {
        'content-type': 'application/json',
        'user-agent': 'Kobe-Webhook-Tester/1.0',
      };
      
      // Add authentication if required
      if (webhook.authType === 'token' && webhook.authConfig.token) {
        headers['x-webhook-token'] = webhook.authConfig.token;
      } else if (webhook.authType === 'hmac' && webhook.authConfig.secret) {
        headers['x-webhook-signature'] = 'mock-signature-for-testing';
      }
      
      // Process webhook with test payload
      return await this.processWebhook({
        path: webhook.path,
        headers,
        body: payload,
      });
    } catch (error) {
      console.error('Webhook test failed:', error);
      throw error;
    }
  }
}

export default new WebhookService();
