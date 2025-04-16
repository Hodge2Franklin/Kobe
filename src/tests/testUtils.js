/**
 * Test Utilities for Kobe Workflow Builder
 * 
 * This file provides utility functions for testing the workflow builder.
 */

/**
 * Generate mock data for testing based on node type
 * 
 * @param {string} nodeType - Type of node to generate data for
 * @returns {Object} - Mock data for the specified node type
 */
export function generateMockData(nodeType) {
  switch (nodeType) {
    case 'trigger':
      return {
        event: 'form_submission',
        timestamp: new Date().toISOString(),
        data: {
          formId: 'contact-form',
          fields: {
            name: 'Test User',
            email: 'test@example.com',
            message: 'This is a test message'
          }
        }
      };
      
    case 'dataSource':
      return {
        records: [
          { id: 1, name: 'Record 1', value: 100, status: 'active' },
          { id: 2, name: 'Record 2', value: 200, status: 'inactive' },
          { id: 3, name: 'Record 3', value: 300, status: 'active' }
        ],
        metadata: {
          totalCount: 3,
          source: 'mock-database',
          query: 'SELECT * FROM records'
        }
      };
      
    case 'filter':
      return {
        inputCount: 3,
        outputCount: 2,
        condition: 'status === "active"',
        filteredItems: [
          { id: 1, name: 'Record 1', value: 100, status: 'active' },
          { id: 3, name: 'Record 3', value: 300, status: 'active' }
        ]
      };
      
    case 'action':
      return {
        actionType: 'email',
        recipient: 'test@example.com',
        subject: 'Test Email',
        status: 'sent',
        messageId: `msg_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
    case 'dataModifier':
      return {
        operation: 'transform',
        inputCount: 3,
        outputCount: 3,
        transformedData: [
          { id: 1, name: 'Record 1', value: 100, status: 'active', calculated: 200 },
          { id: 2, name: 'Record 2', value: 200, status: 'inactive', calculated: 400 },
          { id: 3, name: 'Record 3', value: 300, status: 'active', calculated: 600 }
        ]
      };
      
    case 'multiBranch':
      return {
        condition: 'value > 200',
        paths: [
          { id: 'path1', label: 'High Value', condition: 'value > 200', count: 1 },
          { id: 'path2', label: 'Medium Value', condition: '100 < value <= 200', count: 1 },
          { id: 'path3', label: 'Low Value', condition: 'value <= 100', count: 1 }
        ],
        activePath: 'path1'
      };
      
    default:
      return {
        type: nodeType,
        timestamp: new Date().toISOString(),
        data: { message: 'Mock data for testing' }
      };
  }
}

/**
 * Validate a workflow configuration
 * 
 * @param {Object} workflow - The workflow configuration to validate
 * @returns {Object} - Validation result with errors if any
 */
export function validateWorkflow(workflow) {
  const errors = [];
  
  // Check if workflow has nodes
  if (!workflow.nodes || workflow.nodes.length === 0) {
    errors.push('Workflow must have at least one node');
  }
  
  // Check if workflow has a trigger node
  if (!workflow.nodes.some(node => node.type === 'trigger')) {
    errors.push('Workflow must have at least one trigger node');
  }
  
  // Check for disconnected nodes
  const connectedNodeIds = new Set();
  
  if (workflow.edges && workflow.edges.length > 0) {
    workflow.edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
  }
  
  const disconnectedNodes = workflow.nodes.filter(node => 
    node.type !== 'trigger' && !connectedNodeIds.has(node.id)
  );
  
  if (disconnectedNodes.length > 0) {
    errors.push(`Found ${disconnectedNodes.length} disconnected nodes`);
  }
  
  // Check for circular references
  const nodeMap = {};
  workflow.nodes.forEach(node => {
    nodeMap[node.id] = {
      id: node.id,
      type: node.type,
      outgoing: [],
      visited: false,
      inPath: false
    };
  });
  
  if (workflow.edges) {
    workflow.edges.forEach(edge => {
      if (nodeMap[edge.source]) {
        nodeMap[edge.source].outgoing.push(edge.target);
      }
    });
  }
  
  function checkCircular(nodeId, path = []) {
    const node = nodeMap[nodeId];
    if (!node) return false;
    
    if (node.inPath) {
      errors.push(`Circular reference detected: ${[...path, nodeId].join(' -> ')}`);
      return true;
    }
    
    if (node.visited) return false;
    
    node.visited = true;
    node.inPath = true;
    path.push(nodeId);
    
    for (const targetId of node.outgoing) {
      if (checkCircular(targetId, path)) {
        return true;
      }
    }
    
    node.inPath = false;
    path.pop();
    return false;
  }
  
  // Start DFS from each trigger node
  workflow.nodes
    .filter(node => node.type === 'trigger')
    .forEach(node => checkCircular(node.id));
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format test results for display
 * 
 * @param {Object} results - Test results to format
 * @returns {string} - Formatted test results
 */
export function formatTestResults(results) {
  let output = '=== TEST RESULTS ===\n\n';
  
  output += `Total Tests: ${results.totalTests}\n`;
  output += `Passed: ${results.passed}\n`;
  output += `Failed: ${results.failed}\n\n`;
  
  output += '=== DETAILED RESULTS ===\n\n';
  
  Object.entries(results.results).forEach(([testName, result]) => {
    const formattedName = testName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
    
    output += `${formattedName}: ${result.success ? 'PASSED' : 'FAILED'}\n`;
    
    if (!result.success) {
      output += `  Error: ${result.error}\n`;
    }
    
    output += '\n';
  });
  
  return output;
}

/**
 * Create a sample workflow for testing
 * 
 * @returns {Object} - Sample workflow configuration
 */
export function createSampleWorkflow() {
  return {
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'New Customer Registration',
          config: {
            triggerType: 'event',
            event: 'user.registered'
          },
          notes: 'Triggered when a new user registers'
        }
      },
      {
        id: '2',
        type: 'dataSource',
        position: { x: 250, y: 150 },
        data: {
          label: 'Get User Profile',
          config: {
            sourceType: 'database',
            query: 'SELECT * FROM users WHERE id = {{1.userId}}'
          },
          notes: 'Retrieves user profile data'
        }
      },
      {
        id: '3',
        type: 'filter',
        position: { x: 250, y: 250 },
        data: {
          label: 'Check Subscription Status',
          config: {
            field: '{{2.subscription_status}}',
            operator: 'equals',
            value: 'premium'
          },
          notes: 'Checks if user has premium subscription'
        }
      },
      {
        id: '4',
        type: 'action',
        position: { x: 100, y: 350 },
        data: {
          label: 'Send Welcome Email',
          config: {
            actionType: 'email',
            to: '{{2.email}}',
            subject: 'Welcome to Our Service',
            template: 'welcome_email'
          },
          notes: 'Sends welcome email to new user'
        }
      },
      {
        id: '5',
        type: 'action',
        position: { x: 400, y: 350 },
        data: {
          label: 'Send Premium Welcome',
          config: {
            actionType: 'email',
            to: '{{2.email}}',
            subject: 'Welcome to Premium Membership',
            template: 'premium_welcome'
          },
          notes: 'Sends premium welcome email'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4', animated: true, label: 'No' },
      { id: 'e3-5', source: '3', target: '5', animated: true, label: 'Yes' }
    ]
  };
}
