/**
 * API Integration Service for Kobe Workflow Builder
 * 
 * This service provides a framework for connecting to external APIs
 * and handling various authentication methods, request formats, and responses.
 */

class ApiService {
  /**
   * Make an API request with the specified parameters
   * 
   * @param {Object} config - The API request configuration
   * @param {string} config.url - The API endpoint URL
   * @param {string} config.method - The HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {Object} config.headers - Request headers
   * @param {Object|string} config.body - Request body (for POST, PUT, etc.)
   * @param {string} config.authType - Authentication type (none, basic, oauth, apikey)
   * @param {Object} config.authConfig - Authentication configuration
   * @param {number} config.timeout - Request timeout in milliseconds
   * @param {boolean} config.validateStatus - Whether to validate response status
   * @returns {Promise<Object>} - The API response
   */
  async makeRequest(config) {
    try {
      // Prepare request options
      const options = {
        method: config.method || 'GET',
        headers: this._prepareHeaders(config.headers, config.authType, config.authConfig),
        timeout: config.timeout || 30000,
      };

      // Add body for non-GET requests
      if (config.method !== 'GET' && config.body) {
        options.body = typeof config.body === 'string' 
          ? config.body 
          : JSON.stringify(config.body);
      }

      // Make the request
      console.log(`Making ${options.method} request to ${config.url}`);
      const response = await fetch(config.url, options);

      // Validate response if required
      if (config.validateStatus && !response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      // Parse response based on content type
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: this._headersToObject(response.headers),
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Prepare request headers including authentication
   * 
   * @param {Object} headers - Base headers
   * @param {string} authType - Authentication type
   * @param {Object} authConfig - Authentication configuration
   * @returns {Object} - Prepared headers
   */
  _prepareHeaders(headers = {}, authType, authConfig = {}) {
    const preparedHeaders = { ...headers };

    // Add content-type if not specified
    if (!preparedHeaders['Content-Type']) {
      preparedHeaders['Content-Type'] = 'application/json';
    }

    // Add authentication headers
    switch (authType) {
      case 'basic':
        if (authConfig.username && authConfig.password) {
          const credentials = btoa(`${authConfig.username}:${authConfig.password}`);
          preparedHeaders['Authorization'] = `Basic ${credentials}`;
        }
        break;
      case 'oauth':
        if (authConfig.token) {
          preparedHeaders['Authorization'] = `Bearer ${authConfig.token}`;
        }
        break;
      case 'apikey':
        if (authConfig.key && authConfig.headerName) {
          preparedHeaders[authConfig.headerName] = authConfig.key;
        } else if (authConfig.key) {
          preparedHeaders['X-API-Key'] = authConfig.key;
        }
        break;
    }

    return preparedHeaders;
  }

  /**
   * Convert Headers object to plain object
   * 
   * @param {Headers} headers - Response headers
   * @returns {Object} - Headers as plain object
   */
  _headersToObject(headers) {
    const headersObj = {};
    headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    return headersObj;
  }
}

export default new ApiService();
