/**
 * Integration Service Index for Kobe Workflow Builder
 * 
 * This file exports all integration services to provide a unified interface
 * for the workflow builder to interact with external systems.
 */

import apiService from './apiService';
import emailService from './emailService';
import databaseService from './databaseService';
import fileStorageService from './fileStorageService';
import webhookService from './webhookService';

// Export all services
export {
  apiService,
  emailService,
  databaseService,
  fileStorageService,
  webhookService
};

/**
 * Integration manager to provide a unified interface for all services
 */
class IntegrationManager {
  constructor() {
    this.services = {
      api: apiService,
      email: emailService,
      database: databaseService,
      fileStorage: fileStorageService,
      webhook: webhookService
    };
  }

  /**
   * Execute an integration operation using the appropriate service
   * 
   * @param {string} serviceType - Type of service to use (api, email, database, fileStorage, webhook)
   * @param {string} operation - Operation to perform
   * @param {Object} config - Configuration for the operation
   * @returns {Promise<Object>} - Result of the operation
   */
  async execute(serviceType, operation, config) {
    try {
      console.log(`Executing ${operation} on ${serviceType} service`);
      
      if (!this.services[serviceType]) {
        throw new Error(`Unknown service type: ${serviceType}`);
      }
      
      const service = this.services[serviceType];
      
      if (!service[operation] || typeof service[operation] !== 'function') {
        throw new Error(`Operation ${operation} not supported by ${serviceType} service`);
      }
      
      return await service[operation](config);
    } catch (error) {
      console.error(`Integration execution failed: ${error.message}`);
      throw error;
    }
  }
}

export default new IntegrationManager();
