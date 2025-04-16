/**
 * Main App.js with all enhancements integrated
 * This is the final version with all features implemented
 */

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

// Import integration services
import integrationManager from './integrations';

// Import test integration component
import TestIntegration from './tests/TestIntegration';

// Node types configuration
const nodeTypeDefinitions = {
  // Original node types
  trigger: { label: 'Trigger', color: '#ffcc00' },
  action: { label: 'Action', color: '#00ccff' },
  filter: { label: 'Filter', color: '#cc00ff' },
  flowControl: { label: 'Flow Control', color: '#00ff00' },
  modifier: { label: 'Modifier', color: '#ff6600' },
  validation: { label: 'Validation', color: '#ff0000' },
  
  // Extended node types
  dataSource: { label: 'Data Source', color: '#4287f5' },
  dataModifier: { label: 'Data Modifier', color: '#f542a7' },
  multiBranch: { label: 'Multi-path Branch', color: '#42f5b3' },
};

// Pre-configured workflow for "Friend Catch-up Rotation"
const initialNodes = [
  {
    id: '1',
    type: 'trigger',
    data: {
      label: 'Monthly Schedule',
      config: { schedule: '1st day 8AM', prefilter: 'contacts.active = true', custom_module: 'contacts_api' },
      notes: 'Initiates monthly catch-ups'
    },
    position: { x: 250, y: 25 }
  },
  {
    id: '2',
    type: 'flowControl',
    data: {
      label: 'For Each Friend',
      config: { type: 'loop', input: 'contacts.friends', iterator: 'friend' },
      notes: 'Iterates over friends list'
    },
    position: { x: 250, y: 125 }
  },
  {
    id: '3',
    type: 'filter',
    data: {
      label: 'No Recent Contact',
      config: {
        field: 'friend.last_contact',
        operator: 'greater_than',
        value: '30 days',
        logic: 'AND',
        secondary_field: 'friend.priority',
        secondary_operator: 'equals',
        secondary_value: 'high'
      },
      notes: 'Selects friends overdue for contact'
    },
    position: { x: 250, y: 225 }
  },
  {
    id: '4',
    type: 'action',
    data: {
      label: 'Schedule Call',
      config: {
        api: 'google.calendar',
        fields: 'title: Catch-up with {{friend.name}}, time: next available slot, invitee: {{friend.email}}',
        retries: 1
      },
      notes: 'Books call'
    },
    position: { x: 150, y: 325 }
  },
  {
    id: '5',
    type: 'action',
    data: {
      label: 'Send Invite',
      config: {
        api: 'smtp.send',
        fields: 'to: {{friend.email}}, subject: "Let\'s Catch Up", body: Scheduled call on {{4.time}}'
      },
      notes: 'Sends email invite'
    },
    position: { x: 350, y: 325 }
  },
  {
    id: '6',
    type: 'validation',
    data: {
      label: 'Limit Scheduling',
      config: { rule: 'max 1 call per friend per month', scope: 'friend.id', fallback: 'skip scheduling' },
      notes: 'Prevents over-scheduling'
    },
    position: { x: 250, y: 425 }
  }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6' }
];

// Custom Node component
const CustomNode = ({ data, type }) => {
  const nodeStyle = {
    background: nodeTypeDefinitions[type]?.color || '#ffffff',
    border: '1px solid #1a192b',
    borderRadius: '5px',
    padding: '10px',
    width: '200px',
  };

  return (
    <div style={nodeStyle}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.label}</div>
      <div>{data.notes}</div>
    </div>
  );
};

function FlowWithProvider() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [logs, setLogs] = useState([]);
  const [dataContext, setDataContext] = useState({});
  const [isSimulating, setIsSimulating] = useState(false);

  // Handle connections between nodes
  const onConnect = useCallback(
    (params) => {
      try {
        console.log('Connecting nodes:', params);
        const sourceNode = nodes.find((n) => n.id === params.source);
        const targetNode = nodes.find((n) => n.id === params.target);
        
        if (!sourceNode || !targetNode) {
          console.error('Source or target node not found');
          setLogs((l) => [...l, 'Error: Source or target node not found']);
          return;
        }
        
        if (sourceNode.type === 'action' && targetNode.type === 'trigger') {
          console.error('Actions cannot connect to triggers');
          setLogs((l) => [...l, 'Error: Actions cannot connect to triggers']);
          return;
        }
        
        setEdges((eds) => addEdge(params, eds));
        setLogs((l) => [...l, `Connected ${sourceNode.data.label} to ${targetNode.data.label}`]);
      } catch (error) {
        console.error('Error connecting nodes:', error);
        setLogs((l) => [...l, `Error connecting nodes: ${error.message}`]);
      }
    },
    [nodes, setEdges, setLogs]
  );

  // Handle drop event to add new node
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      
      if (!reactFlowWrapper.current || !reactFlowInstance) {
        console.error('React Flow wrapper or instance not available');
        setLogs((l) => [...l, 'Error: Could not add node - flow not initialized']);
        return;
      }
      
      try {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow') || 
                     event.dataTransfer.getData('text/plain');
        
        console.log(`Drop event with node type: ${type}`);
        
        if (!type) {
          console.error('No node type data in drop event');
          setLogs((l) => [...l, 'Error: Could not add node - missing type data']);
          return;
        }
        
        // Get position from drop coordinates
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        
        // Create new node
        const newNode = {
          id: `${nodes.length + 1}`,
          type,
          position,
          data: { 
            label: `${nodeTypeDefinitions[type]?.label || 'Unknown'} Node`, 
            config: {}, 
            notes: '' 
          },
        };
        
        console.log('Created new node:', newNode);
        setNodes((nds) => nds.concat(newNode));
        setLogs((l) => [...l, `Added new ${nodeTypeDefinitions[type]?.label || type} node`]);
      } catch (error) {
        console.error('Error adding node:', error);
        setLogs((l) => [...l, `Error adding node: ${error.message}`]);
      }
    },
    [reactFlowInstance, nodes, setNodes, setLogs]
  );

  // Handle dragover event
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Add a new node from click (fallback method)
  const addNodeFromClick = (type) => {
    try {
      if (!reactFlowInstance) {
        console.error('React Flow instance not available');
        setLogs((l) => [...l, 'Error: Could not add node - flow not initialized']);
        return;
      }
      
      console.log(`Adding node of type: ${type} via click`);
      
      // Get center position of the viewport
      const viewportCenter = reactFlowInstance.project({
        x: reactFlowWrapper.current.clientWidth / 2,
        y: reactFlowWrapper.current.clientHeight / 2,
      });
      
      // Add some random offset to avoid stacking
      const position = {
        x: viewportCenter.x + (Math.random() * 100 - 50),
        y: viewportCenter.y + (Math.random() * 100 - 50),
      };
      
      const newNode = {
        id: `${nodes.length + 1}`,
        type,
        position,
        data: { 
          label: `${nodeTypeDefinitions[type]?.label || 'Unknown'} Node`, 
          config: {}, 
          notes: '' 
        },
      };
      
      console.log('Created new node via click:', newNode);
      setNodes((nds) => nds.concat(newNode));
      setLogs((l) => [...l, `Added new ${nodeTypeDefinitions[type]?.label || type} node via click`]);
    } catch (error) {
      console.error('Error adding node via click:', error);
      setLogs((l) => [...l, `Error adding node via click: ${error.message}`]);
    }
  };

  // Update node configuration
  const updateNodeConfig = (id, config, notes) => {
    try {
      console.log(`Updating node ${id} with config:`, config);
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, config, label: config.label || node.data.label, notes } }
            : node
        )
      );
      setSelectedNode(null);
      setLogs((l) => [...l, `Updated configuration for node ${id}`]);
    } catch (error) {
      console.error('Error updating node configuration:', error);
      setLogs((l) => [...l, `Error updating node configuration: ${error.message}`]);
    }
  };

  // Save workflow to localStorage
  const saveWorkflow = () => {
    try {
      const workflow = { nodes, edges };
      localStorage.setItem('kobe_workflow', JSON.stringify(workflow));
      console.log('Workflow saved to localStorage');
      setLogs((l) => [...l, 'Workflow saved successfully']);
    } catch (error) {
      console.error('Error saving workflow:', error);
      setLogs((l) => [...l, `Error saving workflow: ${error.message}`]);
    }
  };

  // Load workflow from localStorage
  const loadWorkflow = () => {
    try {
      const saved = localStorage.getItem('kobe_workflow');
      if (saved) {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
        setNodes(savedNodes);
        setEdges(savedEdges);
        console.log('Workflow loaded from localStorage');
        setLogs((l) => [...l, 'Workflow loaded successfully']);
      } else {
        console.warn('No saved workflow found');
        setLogs((l) => [...l, 'No saved workflow found']);
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      setLogs((l) => [...l, `Error loading workflow: ${error.message}`]);
    }
  };

  // Validate a node
  const validateNode = (node) => {
    if (node.type === 'trigger' && !node.data.config.event && !node.data.config.schedule) {
      return 'Trigger requires event or schedule';
    }
    if (node.type === 'action' && !node.data.config.api && !node.data.config.actionType) {
      return 'Action requires API or action type';
    }
    if (node.type === 'filter' && (!node.data.config.field || !node.data.config.operator)) {
      return 'Filter requires field and operator';
    }
    if (node.type === 'dataSource' && !node.data.config.sourceType) {
      return 'Data Source requires a source type';
    }
    if (node.type === 'dataModifier' && (!node.data.config.input || !node.data.config.operationType)) {
      return 'Data Modifier requires input and operation type';
    }
    if (node.type === 'multiBranch' && !node.data.config.branchType) {
      return 'Multi-path Branch requires a branch type';
    }
    return null;
  };

  // Variable resolution utility function
  const resolveVariables = (template, context) => {
    if (!template || typeof template !== 'string') return template;
    
    return template.replace(/{{(.*?)}}/g, (match, path) => {
      try {
        const [nodeId, field] = path.split('.');
        if (!nodeId || !field) return match;
        
        if (!context[nodeId]) {
          console.warn(`Node ID ${nodeId} not found in context`);
          return match;
        }
        
        if (context[nodeId][field] === undefined) {
          console.warn(`Field ${field} not found in node ${nodeId} context`);
          return match;
        }
        
        const value = context[nodeId][field];
        return typeof value === 'object' ? JSON.stringify(value) : String(value);
      } catch (error) {
        console.error('Error resolving variable:', error);
        return match;
      }
    });
  };

  // Execute node with integration services
  const executeNode = async (node, context) => {
    try {
      console.log(`Executing node ${node.id} (${node.type}):`, node.data.label);
      
      switch (node.type) {
        case 'trigger':
          // Triggers don't need execution in simulation
          return { status: 'success', message: `Trigger ${node.data.label} activated` };
          
        case 'action':
          if (node.data.config.actionType === 'email') {
            // Execute email action
            const to = resolveVariables(node.data.config.to, context);
            const subject = resolveVariables(node.data.config.subject, context);
            const body = resolveVariables(node.data.config.fields || '', context);
            
            const emailResult = await integrationManager.execute('email', 'sendEmail', {
              provider: 'mock',
              to,
              subject,
              body,
              template: node.data.config.template,
              templateData: context
            });
            
            return { status: 'success', result: emailResult, message: `Email sent to ${to}` };
          } else if (node.data.config.actionType === 'api_call') {
            // Execute API action
            const url = resolveVariables(node.data.config.url, context);
            const method = node.data.config.method || 'GET';
            const headers = node.data.config.headers ? JSON.parse(resolveVariables(node.data.config.headers, context)) : {};
            
            const apiResult = await integrationManager.execute('api', 'makeRequest', {
              url,
              method,
              headers,
              validateStatus: true
            });
            
            return { status: 'success', result: apiResult, message: `API call to ${url} completed` };
          } else if (node.data.config.actionType === 'database') {
            // Execute database action
            const query = resolveVariables(node.data.config.query, context);
            
            const dbResult = await integrationManager.execute('database', 'executeQuery', {
              type: 'mysql',
              connection: 'mock://localhost:3306/testdb',
              query
            });
            
            return { status: 'success', result: dbResult, message: `Database query executed` };
          }
          
          return { status: 'success', message: `Action ${node.data.label} executed` };
          
        case 'dataSource':
          // Execute data source node
          const sourceType = node.data.config.sourceType;
          const query = resolveVariables(node.data.config.query || '', context);
          const outputVar = node.data.config.outputVar || 'data';
          
          if (sourceType === 'database') {
            const dbResult = await integrationManager.execute('database', 'executeQuery', {
              type: 'mysql',
              connection: 'mock://localhost:3306/testdb',
              query
            });
            
            return { 
              status: 'success', 
              result: { [outputVar]: dbResult.rows }, 
              message: `Retrieved ${dbResult.rows.length} records from database` 
            };
          } else if (sourceType === 'api') {
            const apiUrl = resolveVariables(node.data.config.apiUrl || '', context);
            
            const apiResult = await integrationManager.execute('api', 'makeRequest', {
              url: apiUrl || 'https://jsonplaceholder.typicode.com/posts/1',
              method: 'GET'
            });
            
            return { 
              status: 'success', 
              result: { [outputVar]: apiResult.data }, 
              message: `Retrieved data from API` 
            };
          }
          
          return { 
            status: 'success', 
            result: { [outputVar]: { message: 'Mock data source result' } }, 
            message: `Data source ${node.data.label} executed` 
          };
          
        case 'dataModifier':
          // Execute data modifier node
          const input = resolveVariables(node.data.config.input || '', context);
          const operation = node.data.config.operationType;
          const output = node.data.config.output || 'result';
          
          // Parse input if it's a JSON string
          let inputData;
          try {
            inputData = typeof input === 'string' ? JSON.parse(input) : input;
          } catch (e) {
            inputData = input;
          }
          
          let result;
          if (operation === 'transform') {
            // Apply transformation
            result = Array.isArray(inputData) 
              ? inputData.map(item => ({ ...item, transformed: true }))
              : { ...inputData, transformed: true };
          } else if (operation === 'filter') {
            // Apply filter
            result = Array.isArray(inputData)
              ? inputData.filter(item => item.status === 'active')
              : inputData;
          }
          
          return { 
            status: 'success', 
            result: { [output]: result || inputData }, 
            message: `Applied ${operation} operation to data` 
          };
          
        default:
          return { status: 'success', message: `Node ${node.data.label} executed` };
      }
    } catch (error) {
      console.error(`Error executing node ${node.id}:`, error);
      return { status: 'error', error: error.message };
    }
  };

  // Simulate workflow execution
  const simulateWorkflow = async () => {
    try {
      setIsSimulating(true);
      console.log('Starting workflow simulation');
      setLogs((l) => [...l, 'Starting workflow simulation...']);
      let context = {};
      let errors = [];

      if (nodes.length === 0) {
        console.warn('No nodes to simulate');
        setLogs((l) => [...l, 'Warning: No nodes to simulate']);
        setIsSimulating(false);
        return;
      }

      // Check if workflow has a trigger node
      const triggerNodes = nodes.filter(node => node.type === 'trigger');
      if (triggerNodes.length === 0) {
        console.warn('Workflow has no trigger node');
        setLogs((l) => [...l, 'Warning: Workflow should start with a trigger node']);
      }

      // Start with trigger nodes
      for (const triggerNode of triggerNodes) {
        try {
          console.log(`Simulating trigger node: ${triggerNode.id}`);
          setLogs((l) => [...l, `Trigger: ${triggerNode.data.label} fired`]);
          
          // Add trigger data to context
          context[triggerNode.id] = {
            timestamp: new Date().toISOString(),
            event: triggerNode.data.config.event || 'scheduled_event',
            data: {
              userId: 'user_123',
              customerId: 'cust_456',
              orderId: 'ord_789',
              orderTotal: 149.99,
              orderDate: new Date().toISOString(),
              orderItems: [
                { productId: 'P001', name: 'Product 1', price: 49.99, quantity: 2 },
                { productId: 'P002', name: 'Product 2', price: 29.99, quantity: 1 },
                { productId: 'P003', name: 'Product 3', price: 19.99, quantity: 1 }
              ]
            }
          };
          
          // Find all nodes connected to this trigger
          await processConnectedNodes(triggerNode.id, context, errors);
        } catch (error) {
          console.error(`Error processing trigger node ${triggerNode.id}:`, error);
          errors.push(`Error in ${triggerNode.data.label}: ${error.message}`);
        }
      }

      console.log('Simulation complete, context:', context);
      setDataContext(context);
      setLogs((l) => [...l, ...errors, 'Workflow simulation complete']);
      setIsSimulating(false);
    } catch (error) {
      console.error('Error in workflow simulation:', error);
      setLogs((l) => [...l, `Error in workflow simulation: ${error.message}`]);
      setDataContext({error: error.message});
      setIsSimulating(false);
    }
  };

  // Process nodes connected to a given node
  const processConnectedNodes = async (nodeId, context, errors) => {
    // Find all edges where this node is the source
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    
    // Process each target node
    for (const edge of outgoingEdges) {
      const targetNode = nodes.find(node => node.id === edge.target);
      
      if (!targetNode) {
        console.warn(`Target node ${edge.target} not found`);
        continue;
      }
      
      try {
        // Validate node
        const validationError = validateNode(targetNode);
        if (validationError) {
          console.error(`Validation error in node ${targetNode.id}:`, validationError);
          errors.push(`Error in ${targetNode.data.label}: ${validationError}`);
          continue;
        }
        
        // Special handling for filter nodes
        if (targetNode.type === 'filter') {
          const field = resolveVariables(targetNode.data.config.field, context);
          const operator = targetNode.data.config.operator;
          const value = resolveVariables(targetNode.data.config.value, context);
          
          // Evaluate filter condition (simplified)
          let conditionPassed = true;
          if (operator === 'equals') {
            conditionPassed = field == value;
          } else if (operator === 'greater_than') {
            conditionPassed = parseFloat(field) > parseFloat(value);
          } else if (operator === 'less_than') {
            conditionPassed = parseFloat(field) < parseFloat(value);
          }
          
          context[targetNode.id] = {
            result: conditionPassed,
            condition: `${field} ${operator} ${value}`
          };
          
          setLogs((l) => [...l, `Filter: ${targetNode.data.label} evaluated to ${conditionPassed}`]);
          
          // Only continue if condition passed
          if (conditionPassed) {
            await processConnectedNodes(targetNode.id, context, errors);
          } else {
            console.log(`Filter condition failed for node ${targetNode.id}, stopping this branch`);
          }
          continue;
        }
        
        // Execute the node
        const executionResult = await executeNode(targetNode, context);
        
        // Add result to context
        context[targetNode.id] = {
          ...executionResult.result,
          status: executionResult.status
        };
        
        // Log the execution
        setLogs((l) => [...l, `${targetNode.type}: ${targetNode.data.label} - ${executionResult.message}`]);
        
        // Continue with connected nodes
        await processConnectedNodes(targetNode.id, context, errors);
      } catch (error) {
        console.error(`Error processing node ${targetNode.id}:`, error);
        errors.push(`Error in ${targetNode.data.label}: ${error.message}`);
      }
    }
  };

  // Handle node click
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  // Custom node renderer
  const customNodeTypes = {
    trigger: (props) => <CustomNode {...props} type="trigger" />,
    action: (props) => <CustomNode {...props} type="action" />,
    filter: (props) => <CustomNode {...props} type="filter" />,
    flowControl: (props) => <CustomNode {...props} type="flowControl" />,
    modifier: (props) => <CustomNode {...props} type="modifier" />,
    validation: (props) => <CustomNode {...props} type="validation" />,
    // Extended node types
    dataSource: (props) => <CustomNode {...props} type="dataSource" />,
    dataModifier: (props) => <CustomNode {...props} type="dataModifier" />,
    multiBranch: (props) => <CustomNode {...props} type="multiBranch" />,
  };

  // Node configuration panel component
  const NodeConfigPanel = ({ node, onSave, onCancel }) => {
    const [config, setConfig] = useState(node.data.config);
    const [notes, setNotes] = useState(node.data.notes || '');
    const [error, setError] = useState(null);
    
    const panelStyle = {
      position: 'absolute',
      right: '10px',
      top: '70px',
      background: 'white',
      border: '1px solid #ccc',
      padding: '10px',
      zIndex: 1000,
      width: '300px',
      maxHeight: '80vh',
      overflowY: 'auto',
    };

    const validateConfig = () => {
      const validationError = validateNode({ ...node, data: { ...node.data, config } });
      setError(validationError);
      return !validationError;
    };

    const handleSave = () => {
      if (validateConfig()) {
        onSave(node.id, config, notes);
      }
    };

    const renderTriggerConfig = () => (
      <>
        <label>Schedule: </label>
        <input
          type="text"
          value={config.schedule || ''}
          onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
          placeholder="e.g., daily 8AM"
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        <label>Event: </label>
        <input
          type="text"
          value={config.event || ''}
          onChange={(e) => setConfig({ ...config, event: e.target.value })}
          placeholder="e.g., form.submit"
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        <label>Custom Module: </label>
        <input
          type="text"
          value={config.custom_module || ''}
          onChange={(e) => setConfig({ ...config, custom_module: e.target.value })}
          placeholder="e.g., contacts_api"
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        <label>Pre-Filter: </label>
        <input
          type="text"
          value={config.prefilter || ''}
          onChange={(e) => setConfig({ ...config, prefilter: e.target.value })}
          placeholder="e.g., contacts.active = true"
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        <label>Trigger Type: </label>
        <select
          value={config.triggerType || 'event'}
          onChange={(e) => setConfig({ ...config, triggerType: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        >
          <option value="event">Event-based</option>
          <option value="schedule">Schedule-based</option>
          <option value="webhook">Webhook</option>
          <option value="api">API</option>
          <option value="data_change">Data Change</option>
        </select>
        {config.triggerType === 'webhook' && (
          <>
            <label>Webhook URL: </label>
            <input
              type="text"
              value={config.webhookUrl || ''}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              placeholder="e.g., /api/webhooks/my-trigger"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            <label>Authentication: </label>
            <select
              value={config.webhookAuth || 'none'}
              onChange={(e) => setConfig({ ...config, webhookAuth: e.target.value })}
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            >
              <option value="none">None</option>
              <option value="basic">Basic Auth</option>
              <option value="token">Token</option>
              <option value="oauth">OAuth</option>
            </select>
          </>
        )}
        {config.triggerType === 'schedule' && (
          <>
            <label>Frequency: </label>
            <select
              value={config.frequency || 'daily'}
              onChange={(e) => setConfig({ ...config, frequency: e.target.value })}
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            >
              <option value="minutely">Every Minute</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
            {config.frequency === 'custom' && (
              <>
                <label>Cron Expression: </label>
                <input
                  type="text"
                  value={config.cronExpression || ''}
                  onChange={(e) => setConfig({ ...config, cronExpression: e.target.value })}
                  placeholder="e.g., 0 9 * * 1-5"
                  style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
                />
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  Format: minute hour day-of-month month day-of-week
                </div>
              </>
            )}
          </>
        )}
      </>
    );

    const renderFilterConfig = () => (
      <>
        <label>Field: </label>
        <input
          type="text"
          value={config.field || ''}
          onChange={(e) => setConfig({ ...config, field: e.target.value })}
          placeholder="e.g., friend.last_contact"
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        <label>Operator: </label>
        <select
          value={config.operator || ''}
          onChange={(e) => setConfig({ ...config, operator: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        >
          <option value="">Select</option>
          <option value="equals">Equals</option>
          <option value="contains">Contains</option>
          <option value="greater_than">Greater Than</option>
          <option value="less_than">Less Than</option>
          <option value="within">Within</option>
          <option value="null">Is Null</option>
          <option value="in">In List</option>
          <option value="not_equals">Not Equals</option>
          <option value="not_contains">Not Contains</option>
          <option value="starts_with">Starts With</option>
          <option value="ends_with">Ends With</option>
          <option value="regex">Matches Regex</option>
        </select>
        <label>Value: </label>
        <input
          type="text"
          value={config.value || ''}
          onChange={(e) => setConfig({ ...config, value: e.target.value })}
          placeholder="e.g., 30 days"
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        
        <label>Condition Type: </label>
        <select
          value={config.conditionType || 'simple'}
          onChange={(e) => setConfig({ ...config, conditionType: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        >
          <option value="simple">Simple Condition</option>
          <option value="compound">Compound Condition</option>
          <option value="advanced">Advanced Expression</option>
        </select>
        
        {config.conditionType === 'compound' && (
          <>
            <label>Logic Operator: </label>
            <select
              value={config.logicOperator || 'and'}
              onChange={(e) => setConfig({ ...config, logicOperator: e.target.value })}
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            >
              <option value="and">AND</option>
              <option value="or">OR</option>
            </select>
            
            <div style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Additional Conditions</h4>
              {(config.additionalConditions || []).map((condition, index) => (
                <div key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
                  <label>Field: </label>
                  <input
                    type="text"
                    value={condition.field || ''}
                    onChange={(e) => {
                      const newConditions = [...(config.additionalConditions || [])];
                      newConditions[index] = { ...condition, field: e.target.value };
                      setConfig({ ...config, additionalConditions: newConditions });
                    }}
                    placeholder="e.g., user.status"
                    style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
                  />
                  <label>Operator: </label>
                  <select
                    value={condition.operator || 'equals'}
                    onChange={(e) => {
                      const newConditions = [...(config.additionalConditions || [])];
                      newConditions[index] = { ...condition, operator: e.target.value };
                      setConfig({ ...config, additionalConditions: newConditions });
                    }}
                    style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
                  >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                  </select>
                  <label>Value: </label>
                  <input
                    type="text"
                    value={condition.value || ''}
                    onChange={(e) => {
                      const newConditions = [...(config.additionalConditions || [])];
                      newConditions[index] = { ...condition, value: e.target.value };
                      setConfig({ ...config, additionalConditions: newConditions });
                    }}
                    placeholder="e.g., active"
                    style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
                  />
                  <button
                    onClick={() => {
                      const newConditions = [...(config.additionalConditions || [])];
                      newConditions.splice(index, 1);
                      setConfig({ ...config, additionalConditions: newConditions });
                    }}
                    style={{ padding: '5px 10px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    Remove Condition
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newConditions = [...(config.additionalConditions || []), { field: '', operator: 'equals', value: '' }];
                  setConfig({ ...config, additionalConditions: newConditions });
                }}
                style={{ padding: '5px 10px', background: '#4d79ff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
              >
                Add Condition
              </button>
            </div>
          </>
        )}
        
        {config.conditionType === 'advanced' && (
          <>
            <label>Expression: </label>
            <textarea
              value={config.expression || ''}
              onChange={(e) => setConfig({ ...config, expression: e.target.value })}
              placeholder="e.g., (user.age > 30 && user.status == 'active') || user.isVIP"
              style={{ width: '100%', height: '80px', marginBottom: '10px', padding: '5px' }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              Use JavaScript-like syntax with variables in {'{'}nodeId.field{'}'} format
            </div>
          </>
        )}
      </>
    );

    const renderActionConfig = () => (
      <>
        <label>Action Type: </label>
        <select
          value={config.actionType || 'api_call'}
          onChange={(e) => setConfig({ ...config, actionType: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        >
          <option value="api_call">API Call</option>
          <option value="email">Send Email</option>
          <option value="notification">Send Notification</option>
          <option value="database">Database Operation</option>
          <option value="file">File Operation</option>
          <option value="custom">Custom Action</option>
        </select>
        
        {config.actionType === 'api_call' && (
          <>
            <label>API: </label>
            <input
              type="text"
              value={config.api || ''}
              onChange={(e) => setConfig({ ...config, api: e.target.value })}
              placeholder="e.g., google.calendar"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            <label>Method: </label>
            <select
              value={config.method || 'GET'}
              onChange={(e) => setConfig({ ...config, method: e.target.value })}
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            
            <label>URL: </label>
            <input
              type="text"
              value={config.url || ''}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
              placeholder="e.g., https://api.example.com/data"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            
            <label>Headers: </label>
            <textarea
              value={config.headers || ''}
              onChange={(e) => setConfig({ ...config, headers: e.target.value })}
              placeholder="e.g., Content-Type: application/json"
              style={{ width: '100%', height: '60px', marginBottom: '10px', padding: '5px' }}
            />
          </>
        )}
        
        {config.actionType === 'email' && (
          <>
            <label>To: </label>
            <input
              type="text"
              value={config.to || ''}
              onChange={(e) => setConfig({ ...config, to: e.target.value })}
              placeholder="e.g., {'{'}user.email{'}'}"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            
            <label>Subject: </label>
            <input
              type="text"
              value={config.subject || ''}
              onChange={(e) => setConfig({ ...config, subject: e.target.value })}
              placeholder="e.g., Your appointment is confirmed"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            
            <label>Template: </label>
            <select
              value={config.template || 'custom'}
              onChange={(e) => setConfig({ ...config, template: e.target.value })}
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            >
              <option value="custom">Custom</option>
              <option value="welcome">Welcome Email</option>
              <option value="reminder">Reminder</option>
              <option value="confirmation">Confirmation</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </>
        )}
        
        <label>Dynamic Fields: </label>
        <textarea
          value={config.fields || ''}
          onChange={(e) => setConfig({ ...config, fields: e.target.value })}
          placeholder="e.g., title: {'{'}friend.name{'}'}"
          style={{ width: '100%', height: '80px', marginBottom: '10px', padding: '5px' }}
        />
        
        <label>Success Criteria: </label>
        <input
          type="text"
          value={config.successCriteria || ''}
          onChange={(e) => setConfig({ ...config, successCriteria: e.target.value })}
          placeholder="e.g., response.status === 200"
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        
        <label>Error Handling: </label>
        <select
          value={config.errorHandling || 'stop'}
          onChange={(e) => setConfig({ ...config, errorHandling: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        >
          <option value="stop">Stop Workflow</option>
          <option value="continue">Continue Workflow</option>
          <option value="retry">Retry Action</option>
          <option value="alternate">Use Alternate Path</option>
        </select>
        
        {config.errorHandling === 'retry' && (
          <>
            <label>Max Retries: </label>
            <input
              type="number"
              value={config.maxRetries || 3}
              onChange={(e) => setConfig({ ...config, maxRetries: e.target.value })}
              min="1"
              max="10"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            
            <label>Retry Delay (seconds): </label>
            <input
              type="number"
              value={config.retryDelay || 5}
              onChange={(e) => setConfig({ ...config, retryDelay: e.target.value })}
              min="1"
              max="300"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
          </>
        )}
      </>
    );

    const renderDataSourceConfig = () => (
      <>
        <label>Source Type: </label>
        <select
          value={config.sourceType || ''}
          onChange={(e) => setConfig({ ...config, sourceType: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        >
          <option value="">Select Source Type</option>
          <option value="database">Database</option>
          <option value="api">API</option>
          <option value="file">File</option>
          <option value="spreadsheet">Spreadsheet</option>
        </select>
        
        {config.sourceType === 'database' && (
          <>
            <label>Connection String: </label>
            <input
              type="text"
              value={config.connection || ''}
              onChange={(e) => setConfig({ ...config, connection: e.target.value })}
              placeholder="e.g., mysql://user:pass@host/db"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            
            <label>Query: </label>
            <textarea
              value={config.query || ''}
              onChange={(e) => setConfig({ ...config, query: e.target.value })}
              placeholder="e.g., SELECT * FROM users WHERE status = 'active'"
              style={{ width: '100%', height: '80px', marginBottom: '10px', padding: '5px' }}
            />
            
            <label>Parameters: </label>
            <textarea
              value={config.parameters || ''}
              onChange={(e) => setConfig({ ...config, parameters: e.target.value })}
              placeholder="e.g., status: {'{'}user.status{'}'}"
              style={{ width: '100%', height: '60px', marginBottom: '10px', padding: '5px' }}
            />
          </>
        )}
        
        {config.sourceType === 'api' && (
          <>
            <label>API URL: </label>
            <input
              type="text"
              value={config.apiUrl || ''}
              onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
              placeholder="e.g., https://api.example.com/data"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            
            <label>Method: </label>
            <select
              value={config.method || 'GET'}
              onChange={(e) => setConfig({ ...config, method: e.target.value })}
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            
            <label>Headers: </label>
            <textarea
              value={config.headers || ''}
              onChange={(e) => setConfig({ ...config, headers: e.target.value })}
              placeholder="e.g., Authorization: Bearer {'{'}auth.token{'}'}"
              style={{ width: '100%', height: '60px', marginBottom: '10px', padding: '5px' }}
            />
            
            <label>Request Body: </label>
            <textarea
              value={config.body || ''}
              onChange={(e) => setConfig({ ...config, body: e.target.value })}
              placeholder="e.g., { 'query': '{search.term}' }"
              style={{ width: '100%', height: '60px', marginBottom: '10px', padding: '5px' }}
            />
          </>
        )}
        
        <label>Output Variable: </label>
        <input
          type="text"
          value={config.outputVar || ''}
          onChange={(e) => setConfig({ ...config, outputVar: e.target.value })}
          placeholder="e.g., userData"
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        
        <label>Cache Results: </label>
        <select
          value={config.cache || 'none'}
          onChange={(e) => setConfig({ ...config, cache: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        >
          <option value="none">No Caching</option>
          <option value="session">Session Cache</option>
          <option value="persistent">Persistent Cache</option>
        </select>
        
        {config.cache !== 'none' && (
          <>
            <label>Cache Duration (minutes): </label>
            <input
              type="number"
              value={config.cacheDuration || 30}
              onChange={(e) => setConfig({ ...config, cacheDuration: e.target.value })}
              min="1"
              max="1440"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
          </>
        )}
      </>
    );

    const renderDataModifierConfig = () => (
      <>
        <label>Input Variable: </label>
        <input
          type="text"
          value={config.input || ''}
          onChange={(e) => setConfig({ ...config, input: e.target.value })}
          placeholder="e.g., {'{'}dataSource.userData{'}'}"
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        
        <label>Operation Type: </label>
        <select
          value={config.operationType || ''}
          onChange={(e) => setConfig({ ...config, operationType: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        >
          <option value="">Select Operation</option>
          <option value="transform">Transform</option>
          <option value="filter">Filter</option>
          <option value="sort">Sort</option>
          <option value="aggregate">Aggregate</option>
          <option value="format">Format</option>
        </select>
        
        <label>Transformation Script: </label>
        <textarea
          value={config.script || ''}
          onChange={(e) => setConfig({ ...config, script: e.target.value })}
          placeholder="e.g., data.map(item => ({ ...item, fullName: item.firstName + ' ' + item.lastName }))"
          style={{ width: '100%', height: '80px', marginBottom: '10px', padding: '5px' }}
        />
        
        <label>Output Variable: </label>
        <input
          type="text"
          value={config.output || ''}
          onChange={(e) => setConfig({ ...config, output: e.target.value })}
          placeholder="e.g., transformedData"
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
      </>
    );

    const renderMultiBranchConfig = () => (
      <>
        <label>Branch Type: </label>
        <select
          value={config.branchType || ''}
          onChange={(e) => setConfig({ ...config, branchType: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        >
          <option value="">Select Branch Type</option>
          <option value="condition">Condition-based</option>
          <option value="switch">Switch/Case</option>
          <option value="percentage">Percentage Split</option>
        </select>
        
        <label>Paths: </label>
        {(config.paths || []).map((path, index) => (
          <div key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <label>Path {index + 1} Condition: </label>
            <input
              type="text"
              value={path.condition || ''}
              onChange={(e) => {
                const newPaths = [...(config.paths || [])];
                newPaths[index] = { ...path, condition: e.target.value };
                setConfig({ ...config, paths: newPaths });
              }}
              placeholder="e.g., {'{'}data.status{'}'} == 'active'"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            
            <label>Path {index + 1} Label: </label>
            <input
              type="text"
              value={path.label || ''}
              onChange={(e) => {
                const newPaths = [...(config.paths || [])];
                newPaths[index] = { ...path, label: e.target.value };
                setConfig({ ...config, paths: newPaths });
              }}
              placeholder="e.g., Active Users"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            
            <button
              onClick={() => {
                const newPaths = [...(config.paths || [])];
                newPaths.splice(index, 1);
                setConfig({ ...config, paths: newPaths });
              }}
              style={{ padding: '5px 10px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
            >
              Remove Path
            </button>
          </div>
        ))}
        
        <button
          onClick={() => {
            const newPaths = [...(config.paths || []), { condition: '', label: '' }];
            setConfig({ ...config, paths: newPaths });
          }}
          style={{ padding: '5px 10px', background: '#4d79ff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginBottom: '10px' }}
        >
          Add Path
        </button>
        
        <label>Default Path Label: </label>
        <input
          type="text"
          value={config.defaultPath || ''}
          onChange={(e) => setConfig({ ...config, defaultPath: e.target.value })}
          placeholder="e.g., Default"
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
      </>
    );

    return (
      <div style={panelStyle}>
        <h3>Configure {nodeTypeDefinitions[node.type]?.label}</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <label>Label: </label>
        <input
          type="text"
          value={config.label || node.data.label}
          onChange={(e) => setConfig({ ...config, label: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        
        {node.type === 'trigger' && renderTriggerConfig()}
        {node.type === 'filter' && renderFilterConfig()}
        {node.type === 'action' && renderActionConfig()}
        {node.type === 'dataSource' && renderDataSourceConfig()}
        {node.type === 'dataModifier' && renderDataModifierConfig()}
        {node.type === 'multiBranch' && renderMultiBranchConfig()}
        
        <label>Notes: </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: '100%', height: '60px', marginBottom: '10px', padding: '5px' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleSave} style={{ padding: '5px 10px' }}>Save</button>
          <button onClick={onCancel} style={{ padding: '5px 10px' }}>Cancel</button>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Kobe - Workflow Builder</h1>
        <div className="header-buttons">
          <button onClick={saveWorkflow}>Save Workflow</button>
          <button onClick={loadWorkflow}>Load Workflow</button>
          <button 
            onClick={simulateWorkflow} 
            disabled={isSimulating}
            style={{ opacity: isSimulating ? 0.7 : 1 }}
          >
            {isSimulating ? 'Simulating...' : 'Simulate Workflow'}
          </button>
        </div>
      </div>
      <div className="main-container">
        <div className="sidebar">
          <h3>Node Library</h3>
          <div className="node-types">
            {Object.entries(nodeTypeDefinitions).map(([type, info]) => (
              <div 
                key={type} 
                className="node-type-item"
                draggable="true"
                onDragStart={(event) => {
                  console.log(`Dragging node type: ${type}`);
                  event.dataTransfer.setData('application/reactflow', type);
                  event.dataTransfer.setData('text/plain', type);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => addNodeFromClick(type)}
                style={{ 
                  backgroundColor: info.color || '#ffffff',
                  cursor: 'pointer',
                  padding: '10px',
                  margin: '5px 0',
                  borderRadius: '5px'
                }}
              >
                {info.label}
              </div>
            ))}
          </div>
          <div className="log-panel">
            <h3>Execution Log</h3>
            <div className="logs">
              {logs.map((log, i) => (
                <div key={i} className="log-entry">{log}</div>
              ))}
            </div>
          </div>
          <div className="data-preview">
            <h3>Data Context</h3>
            <pre>{JSON.stringify(dataContext, null, 2)}</pre>
          </div>
        </div>
        <div className="flow-container" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={customNodeTypes}
            onNodeClick={onNodeClick}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
          {selectedNode && (
            <NodeConfigPanel
              node={selectedNode}
              onSave={updateNodeConfig}
              onCancel={() => setSelectedNode(null)}
            />
          )}
        </div>
      </div>
      
      {/* Test Integration Component */}
      <TestIntegration />
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <FlowWithProvider />
    </ReactFlowProvider>
  );
}

export default App;
