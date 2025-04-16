/**
 * Test Suite for Kobe Workflow Builder
 * 
 * This file contains test workflows and utilities to verify that all
 * implemented features work correctly together.
 */

import integrationManager from '../integrations';

/**
 * Test the API integration service
 */
async function testApiIntegration() {
  console.log('Testing API Integration Service...');
  
  try {
    // Test basic API request
    const apiResult = await integrationManager.execute('api', 'makeRequest', {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'GET',
      validateStatus: true
    });
    
    console.log('API Integration Test Result:', apiResult);
    return {
      success: true,
      service: 'api',
      result: apiResult
    };
  } catch (error) {
    console.error('API Integration Test Failed:', error);
    return {
      success: false,
      service: 'api',
      error: error.message
    };
  }
}

/**
 * Test the Email integration service
 */
async function testEmailIntegration() {
  console.log('Testing Email Integration Service...');
  
  try {
    // Test email sending (using mock provider for testing)
    const emailResult = await integrationManager.execute('email', 'sendEmail', {
      provider: 'mock',
      to: 'test@example.com',
      subject: 'Test Email from Kobe',
      body: '<h1>Test Email</h1><p>This is a test email from the Kobe workflow builder.</p>',
      template: 'test',
      templateData: {
        name: 'Test User',
        action: 'Testing'
      }
    });
    
    console.log('Email Integration Test Result:', emailResult);
    return {
      success: true,
      service: 'email',
      result: emailResult
    };
  } catch (error) {
    console.error('Email Integration Test Failed:', error);
    return {
      success: false,
      service: 'email',
      error: error.message
    };
  }
}

/**
 * Test the Database integration service
 */
async function testDatabaseIntegration() {
  console.log('Testing Database Integration Service...');
  
  try {
    // Test database query (using mock database for testing)
    const dbResult = await integrationManager.execute('database', 'executeQuery', {
      type: 'mysql',
      connection: 'mock://localhost:3306/testdb',
      query: 'SELECT * FROM users WHERE status = "active"',
      params: ['active']
    });
    
    console.log('Database Integration Test Result:', dbResult);
    return {
      success: true,
      service: 'database',
      result: dbResult
    };
  } catch (error) {
    console.error('Database Integration Test Failed:', error);
    return {
      success: false,
      service: 'database',
      error: error.message
    };
  }
}

/**
 * Test the File Storage integration service
 */
async function testFileStorageIntegration() {
  console.log('Testing File Storage Integration Service...');
  
  try {
    // Test file upload (using mock storage for testing)
    const uploadResult = await integrationManager.execute('fileStorage', 'uploadFile', {
      provider: 'mock',
      file: 'Test file content',
      fileName: 'test-file.txt',
      path: '/uploads/'
    });
    
    // Test file listing
    const listResult = await integrationManager.execute('fileStorage', 'listFiles', {
      provider: 'mock',
      path: '/uploads/'
    });
    
    console.log('File Storage Integration Test Results:', { uploadResult, listResult });
    return {
      success: true,
      service: 'fileStorage',
      result: { uploadResult, listResult }
    };
  } catch (error) {
    console.error('File Storage Integration Test Failed:', error);
    return {
      success: false,
      service: 'fileStorage',
      error: error.message
    };
  }
}

/**
 * Test the Webhook integration service
 */
async function testWebhookIntegration() {
  console.log('Testing Webhook Integration Service...');
  
  try {
    // Register a test webhook
    const webhook = await integrationManager.execute('webhook', 'registerWebhook', {
      path: '/test-webhook',
      description: 'Test webhook for integration testing',
      authType: 'token',
      authConfig: { token: 'test-token' },
      handler: (body, headers) => {
        console.log('Webhook handler called with body:', body);
        return { processed: true, data: body };
      }
    });
    
    // Test the webhook with a sample payload
    const testResult = await integrationManager.execute('webhook', 'testWebhook', 
      webhook.id, 
      { event: 'test', data: { value: 'test-value' } }
    );
    
    console.log('Webhook Integration Test Result:', testResult);
    return {
      success: true,
      service: 'webhook',
      result: testResult
    };
  } catch (error) {
    console.error('Webhook Integration Test Failed:', error);
    return {
      success: false,
      service: 'webhook',
      error: error.message
    };
  }
}

/**
 * Test the variable template system with integrations
 */
async function testVariableTemplateSystem() {
  console.log('Testing Variable Template System with Integrations...');
  
  try {
    // Create a mock context with variables
    const context = {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active'
      },
      order: {
        id: '12345',
        items: [
          { name: 'Product 1', price: 29.99 },
          { name: 'Product 2', price: 49.99 }
        ],
        total: 79.98
      }
    };
    
    // Test resolving variables in a template
    const template = 'Hello {{user.name}}, your order #{{order.id}} for ${{order.total}} has been processed.';
    
    // This would normally use the resolveVariables function from App.js
    const resolveVariables = (template, context) => {
      if (!template || typeof template !== 'string') return template;
      
      return template.replace(/{{(.*?)}}/g, (match, path) => {
        try {
          const parts = path.split('.');
          let value = context;
          
          for (const part of parts) {
            if (value === undefined || value === null) return match;
            value = value[part];
          }
          
          return value !== undefined ? String(value) : match;
        } catch (error) {
          console.error('Error resolving variable:', error);
          return match;
        }
      });
    };
    
    const resolved = resolveVariables(template, context);
    
    console.log('Variable Template System Test Result:', {
      template,
      resolved,
      context
    });
    
    return {
      success: true,
      template,
      resolved,
      context
    };
  } catch (error) {
    console.error('Variable Template System Test Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test a complete workflow with multiple node types and integrations
 */
async function testCompleteWorkflow() {
  console.log('Testing Complete Workflow...');
  
  try {
    // Simulate a workflow with multiple node types and integrations
    const workflow = {
      nodes: [
        {
          id: '1',
          type: 'trigger',
          data: {
            label: 'New Order Received',
            config: { 
              triggerType: 'webhook',
              webhookUrl: '/webhooks/new-order'
            }
          }
        },
        {
          id: '2',
          type: 'dataSource',
          data: {
            label: 'Get Customer Data',
            config: {
              sourceType: 'database',
              query: 'SELECT * FROM customers WHERE id = {{1.customerId}}'
            }
          }
        },
        {
          id: '3',
          type: 'filter',
          data: {
            label: 'Check Order Value',
            config: {
              field: '{{1.orderTotal}}',
              operator: 'greater_than',
              value: '100',
              conditionType: 'simple'
            }
          }
        },
        {
          id: '4',
          type: 'action',
          data: {
            label: 'Send Confirmation Email',
            config: {
              actionType: 'email',
              to: '{{2.email}}',
              subject: 'Your Order #{{1.orderId}} Confirmation',
              template: 'order_confirmation',
              templateData: {
                customerName: '{{2.name}}',
                orderId: '{{1.orderId}}',
                orderTotal: '{{1.orderTotal}}',
                orderDate: '{{1.orderDate}}'
              }
            }
          }
        },
        {
          id: '5',
          type: 'dataModifier',
          data: {
            label: 'Format Order Data',
            config: {
              operationType: 'transform',
              input: '{{1.orderItems}}',
              script: 'data.map(item => ({ ...item, totalPrice: item.quantity * item.price }))',
              output: 'formattedItems'
            }
          }
        },
        {
          id: '6',
          type: 'action',
          data: {
            label: 'Update Inventory',
            config: {
              actionType: 'database',
              query: 'UPDATE inventory SET stock = stock - {{item.quantity}} WHERE product_id = {{item.productId}}',
              iterateOver: '{{5.formattedItems}}'
            }
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e3-5', source: '3', target: '5' },
        { id: 'e5-6', source: '5', target: '6' }
      ]
    };
    
    // Simulate workflow execution with mock data
    const mockTriggerData = {
      customerId: '12345',
      orderId: 'ORD-67890',
      orderTotal: 149.99,
      orderDate: '2025-04-16T10:30:00Z',
      orderItems: [
        { productId: 'P001', name: 'Product 1', price: 49.99, quantity: 2 },
        { productId: 'P002', name: 'Product 2', price: 29.99, quantity: 1 },
        { productId: 'P003', name: 'Product 3', price: 19.99, quantity: 1 }
      ]
    };
    
    const mockCustomerData = {
      id: '12345',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      address: '123 Main St, Anytown, USA'
    };
    
    // Simulate workflow execution context
    const context = {
      '1': mockTriggerData
    };
    
    // Simulate execution of each node
    console.log('Executing node 1 (Trigger):', workflow.nodes[0].data.label);
    // Trigger node already executed with mockTriggerData
    
    console.log('Executing node 2 (Data Source):', workflow.nodes[1].data.label);
    // Simulate database query
    context['2'] = mockCustomerData;
    
    console.log('Executing node 3 (Filter):', workflow.nodes[2].data.label);
    // Evaluate filter condition
    const orderTotal = parseFloat(mockTriggerData.orderTotal);
    const filterValue = 100;
    const filterResult = orderTotal > filterValue;
    context['3'] = { result: filterResult, condition: `${orderTotal} > ${filterValue}` };
    
    if (filterResult) {
      console.log('Filter condition passed, continuing workflow');
      
      console.log('Executing node 4 (Action - Email):', workflow.nodes[3].data.label);
      // Simulate email sending
      const emailResult = await integrationManager.execute('email', 'sendEmail', {
        provider: 'mock',
        to: mockCustomerData.email,
        subject: `Your Order #${mockTriggerData.orderId} Confirmation`,
        body: `<h1>Order Confirmation</h1><p>Thank you for your order, ${mockCustomerData.name}!</p>`,
        template: 'order_confirmation',
        templateData: {
          customerName: mockCustomerData.name,
          orderId: mockTriggerData.orderId,
          orderTotal: mockTriggerData.orderTotal,
          orderDate: mockTriggerData.orderDate
        }
      });
      context['4'] = { result: emailResult };
      
      console.log('Executing node 5 (Data Modifier):', workflow.nodes[4].data.label);
      // Transform order items
      const formattedItems = mockTriggerData.orderItems.map(item => ({
        ...item,
        totalPrice: item.quantity * item.price
      }));
      context['5'] = { formattedItems };
      
      console.log('Executing node 6 (Action - Database):', workflow.nodes[5].data.label);
      // Simulate database updates for each item
      const dbUpdates = [];
      for (const item of formattedItems) {
        const dbResult = await integrationManager.execute('database', 'executeQuery', {
          type: 'mysql',
          connection: 'mock://localhost:3306/inventory',
          query: `UPDATE inventory SET stock = stock - ${item.quantity} WHERE product_id = '${item.productId}'`
        });
        dbUpdates.push(dbResult);
      }
      context['6'] = { results: dbUpdates };
    } else {
      console.log('Filter condition failed, workflow branches not executed');
    }
    
    console.log('Complete Workflow Test Result:', {
      workflow: 'Order Processing Workflow',
      context,
      executedNodes: Object.keys(context).length
    });
    
    return {
      success: true,
      workflow: 'Order Processing Workflow',
      context,
      executedNodes: Object.keys(context).length
    };
  } catch (error) {
    console.error('Complete Workflow Test Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run all tests and collect results
 */
async function runAllTests() {
  console.log('Running all integration tests...');
  
  const results = {
    apiIntegration: await testApiIntegration(),
    emailIntegration: await testEmailIntegration(),
    databaseIntegration: await testDatabaseIntegration(),
    fileStorageIntegration: await testFileStorageIntegration(),
    webhookIntegration: await testWebhookIntegration(),
    variableTemplateSystem: await testVariableTemplateSystem(),
    completeWorkflow: await testCompleteWorkflow()
  };
  
  const summary = {
    totalTests: Object.keys(results).length,
    passed: Object.values(results).filter(r => r.success).length,
    failed: Object.values(results).filter(r => !r.success).length,
    results
  };
  
  console.log('Test Summary:', summary);
  return summary;
}

// Export test functions
export {
  testApiIntegration,
  testEmailIntegration,
  testDatabaseIntegration,
  testFileStorageIntegration,
  testWebhookIntegration,
  testVariableTemplateSystem,
  testCompleteWorkflow,
  runAllTests
};
