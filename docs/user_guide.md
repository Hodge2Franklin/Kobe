# Kobe Workflow Builder - User Guide

## Introduction

This user guide provides step-by-step instructions for using the enhanced Kobe Workflow Builder. It covers basic operations as well as how to leverage the new features to create powerful automated workflows.

## Getting Started

### Accessing the Workflow Builder

The Kobe Workflow Builder is available at: [https://nealfgrs.manus.space](https://nealfgrs.manus.space)

### Interface Overview

The Kobe Workflow Builder interface consists of:

1. **Header Bar** - Contains the application title and workflow management buttons
2. **Node Library** - Left sidebar with available node types
3. **Canvas** - Main area where you build your workflow
4. **Execution Log** - Displays workflow execution information
5. **Data Context** - Shows data values during workflow simulation
6. **Test Panel** - Accessible via buttons in the bottom right corner

## Basic Operations

### Creating a New Workflow

1. The canvas starts with a default "Friend Catch-up Rotation" workflow
2. To start fresh, you can delete all nodes and start from scratch

### Adding Nodes

There are two ways to add nodes to your workflow:

1. **Drag and Drop**:
   - Click and drag a node type from the Node Library to the canvas
   - Release the mouse button to place the node

2. **Click to Add**:
   - Click on a node type in the Node Library
   - The node will be added to the center of the canvas

### Connecting Nodes

1. Hover over a node to see its connection points
2. Click and drag from an output handle to an input handle of another node
3. Release to create a connection

### Configuring Nodes

1. Click on a node to select it
2. A configuration panel will appear on the right side
3. Fill in the required fields and options
4. Click "Save" to apply your changes

### Saving and Loading Workflows

1. Click "Save Workflow" in the header to save your workflow to local storage
2. Click "Load Workflow" to restore a previously saved workflow

### Simulating Workflows

1. Click "Simulate Workflow" in the header
2. The execution log will show the progress of the simulation
3. The data context will display the data at each step

## Working with Node Types

### Trigger Nodes

Trigger nodes are the starting points of your workflow.

**Configuration Options:**
- Trigger Type: Event-based, Schedule-based, Webhook, API, or Data Change
- Event: The event that triggers the workflow
- Schedule: For time-based triggers
- Custom Module: For integration with external systems

**Example Use Case:**
Configure a trigger to run on the first day of each month to initiate a friend catch-up rotation.

### Action Nodes

Action nodes perform operations like sending emails or making API calls.

**Configuration Options:**
- Action Type: API Call, Email, Notification, Database Operation, or File Operation
- API/Endpoint: For API calls
- Email Details: For email actions
- Dynamic Fields: Data to include in the action

**Example Use Case:**
Send an email invitation to a friend when it's time to catch up.

### Filter Nodes

Filter nodes create conditional branches in your workflow.

**Configuration Options:**
- Field: The data field to evaluate
- Operator: Equals, Contains, Greater Than, etc.
- Value: The comparison value
- Condition Type: Simple, Compound, or Advanced Expression

**Example Use Case:**
Check if a friend hasn't been contacted in over 30 days.

### Data Source Nodes

Data Source nodes retrieve data from external sources.

**Configuration Options:**
- Source Type: Database, API, File, or Spreadsheet
- Connection Details: How to connect to the source
- Query: What data to retrieve
- Output Variable: Where to store the results

**Example Use Case:**
Retrieve a list of friends from a database to process in your workflow.

### Data Modifier Nodes

Data Modifier nodes transform and manipulate data.

**Configuration Options:**
- Operation Type: Transform, Filter, Sort, Aggregate, or Format
- Input Variable: The data to modify
- Transformation Script: How to modify the data
- Output Variable: Where to store the results

**Example Use Case:**
Format friend contact information for display in an email.

### Multi-path Branch Nodes

Multi-path Branch nodes create multiple conditional paths.

**Configuration Options:**
- Branch Type: Condition-based, Switch/Case, or Percentage Split
- Paths: Multiple conditions and labels
- Default Path: What happens when no conditions match

**Example Use Case:**
Route friends to different follow-up actions based on their contact preferences.

## Using the Variable Template System

The variable template system allows you to reference data from previous nodes using the `{{nodeId.field}}` syntax.

### Basic Usage

1. In any text field that supports variables, use the syntax `{{nodeId.field}}`
2. Replace `nodeId` with the ID of the node (visible when hovering over a node)
3. Replace `field` with the specific data field you want to reference

### Examples

- Email recipient: `{{2.email}}`
- API URL parameter: `https://api.example.com/users/{{1.userId}}`
- Condition: `{{3.status}} == 'active'`

### Tips for Using Variables

- Use the Data Context panel to see available variables during simulation
- Variables are only available from nodes that have already executed
- You can access nested properties with dot notation: `{{1.user.address.city}}`

## Integration Capabilities

### Setting Up API Integrations

1. Add an Action node with type "API Call"
2. Configure the URL, method, headers, and body
3. Use variables to include dynamic data: `{{nodeId.field}}`

### Configuring Email Services

1. Add an Action node with type "Email"
2. Configure the recipient, subject, and template
3. Use variables to personalize the email: `{{nodeId.field}}`

### Working with Databases

1. Add a Data Source node with type "Database"
2. Configure the connection string and query
3. Use variables in your query: `SELECT * FROM users WHERE id = {{nodeId.userId}}`

### File Storage Operations

1. Add an Action node with type "File Operation"
2. Select the operation (upload, download, list)
3. Configure the provider and file details

### Using Webhooks

1. Add a Trigger node with type "Webhook"
2. Configure the webhook path and authentication
3. The webhook URL will be displayed for external systems to call

## Testing Your Workflows

### Running Integration Tests

1. Click "Show Test Panel" in the bottom right corner
2. Click "Run Integration Tests"
3. View the test results to ensure all integrations are working

### Validating Workflows

1. Click "Show Test Panel" in the bottom right corner
2. Click "Validate Sample Workflow" or build your own workflow
3. Review any validation errors or warnings

### Troubleshooting

If your workflow isn't working as expected:

1. Check the Execution Log for error messages
2. Verify that all nodes are properly configured
3. Ensure that variables reference valid node IDs and fields
4. Test individual integrations to isolate issues

## Best Practices

1. **Start Simple**: Begin with a basic workflow and add complexity gradually
2. **Use Descriptive Labels**: Give your nodes clear, descriptive labels
3. **Add Notes**: Use the notes field to document what each node does
4. **Test Frequently**: Simulate your workflow after each significant change
5. **Validate Variables**: Ensure all variables reference valid data
6. **Handle Errors**: Configure error handling for critical actions
7. **Document Your Workflow**: Keep a record of how your workflow operates

## Conclusion

The enhanced Kobe Workflow Builder provides powerful tools for creating sophisticated automated workflows. By combining different node types, using the variable template system, and leveraging integration capabilities, you can automate complex processes with minimal effort.

For more detailed information about specific features, refer to the [New Features Documentation](/docs/new_features_documentation.md).
