# Kobe Workflow Builder - New Features Documentation

## Introduction

The Kobe Workflow Builder has been enhanced with several powerful new features that significantly expand its capabilities. This document provides a comprehensive overview of these new features and how to use them effectively.

## Table of Contents

1. [Extended Node Types](#extended-node-types)
2. [Variable Template System](#variable-template-system)
3. [Advanced Configuration Options](#advanced-configuration-options)
4. [Integration Capabilities](#integration-capabilities)
5. [Testing Framework](#testing-framework)

## Extended Node Types

Three new node types have been added to the Kobe Workflow Builder to enable more sophisticated workflows:

### Data Source Nodes

Data Source nodes allow you to retrieve data from various external sources.

**Key Features:**
- Support for multiple source types (database, API, file, spreadsheet)
- Connection configuration for each source type
- Query building with parameter support
- Authentication options
- Caching configuration

**Usage Example:**
1. Drag a Data Source node onto the canvas
2. Configure the source type (e.g., database)
3. Set up the connection details
4. Define your query (e.g., `SELECT * FROM users WHERE status = 'active'`)
5. Specify an output variable name to store the results

### Data Modifier Nodes

Data Modifier nodes allow you to transform, filter, sort, aggregate, and format data within your workflow.

**Key Features:**
- Multiple operation types (transform, filter, sort, aggregate, format)
- Transformation script support
- Input and output variable configuration
- Support for complex data manipulations

**Usage Example:**
1. Drag a Data Modifier node onto the canvas
2. Select the operation type (e.g., transform)
3. Specify the input variable (e.g., `{{dataSource.userData}}`)
4. Define a transformation script (e.g., `data.map(item => ({ ...item, fullName: item.firstName + ' ' + item.lastName }))`)
5. Specify an output variable name to store the transformed data

### Multi-path Branch Nodes

Multi-path Branch nodes allow you to create complex conditional workflows with multiple paths.

**Key Features:**
- Multiple branch types (condition-based, switch/case, percentage split)
- Dynamic path configuration with conditions and labels
- Default path configuration
- Support for complex routing logic

**Usage Example:**
1. Drag a Multi-path Branch node onto the canvas
2. Select the branch type (e.g., condition-based)
3. Add multiple paths with conditions (e.g., `{{data.status}} == 'active'`)
4. Label each path for clarity
5. Configure a default path for cases where no conditions match

## Variable Template System

The variable template system allows for dynamic data flow between nodes using the `{{variable}}` notation.

**Key Features:**
- Reference data from any previous node in the workflow
- Automatic type handling (strings, objects, arrays)
- Nested property access (e.g., `{{node.data.property}}`)
- Error handling for missing variables

**Usage Examples:**

1. **In Email Actions:**
   ```
   To: {{user.email}}
   Subject: Welcome, {{user.name}}!
   ```

2. **In Database Queries:**
   ```
   SELECT * FROM orders WHERE customer_id = {{user.id}}
   ```

3. **In API Calls:**
   ```
   https://api.example.com/users/{{user.id}}/profile
   ```

4. **In Conditional Logic:**
   ```
   {{order.total}} > 100
   ```

**How It Works:**
1. When a node executes, its output is stored in the workflow context
2. Subsequent nodes can reference this data using the `{{nodeId.field}}` syntax
3. The variable resolver automatically replaces these references with actual values
4. If a referenced variable doesn't exist, the template remains unchanged

## Advanced Configuration Options

All node types now have more sophisticated configuration panels with additional fields and validation rules.

### Trigger Nodes

**New Configuration Options:**
- Multiple trigger types (event-based, schedule-based, webhook, API, data change)
- Webhook configuration with authentication options
- Schedule configuration with frequency options and cron expression support
- Event configuration with custom module support

### Filter Nodes

**New Configuration Options:**
- Three condition types: simple, compound, and advanced expression
- Multiple operators (equals, contains, greater than, less than, etc.)
- Compound conditions with AND/OR logic
- Advanced expression support with JavaScript-like syntax

### Action Nodes

**New Configuration Options:**
- Multiple action types (API call, email, notification, database operation, file operation)
- Method selection for API calls
- Email configuration with templates
- Error handling with retry mechanisms and alternate paths
- Success criteria configuration

## Integration Capabilities

The Kobe Workflow Builder now includes robust integration capabilities with external services.

### API Integration

**Key Features:**
- Support for all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Custom header configuration
- Authentication support (Basic, Bearer Token, OAuth, API Key)
- Request body formatting
- Response handling and parsing

**Usage Example:**
```javascript
// In an Action node with API call type
{
  url: 'https://api.example.com/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {{auth.token}}'
  },
  body: {
    name: '{{user.name}}',
    email: '{{user.email}}'
  }
}
```

### Email Service Integration

**Key Features:**
- Support for multiple providers (SendGrid, Mailchimp, SMTP)
- Template-based emails
- Attachment support
- HTML and plain text formatting
- Recipient management

**Usage Example:**
```javascript
// In an Action node with email type
{
  to: '{{user.email}}',
  subject: 'Welcome to Our Service',
  template: 'welcome_email',
  templateData: {
    userName: '{{user.name}}',
    accountType: '{{user.accountType}}'
  }
}
```

### Database Integration

**Key Features:**
- Support for multiple database types (MySQL, PostgreSQL, MongoDB, SQLite)
- Query execution with parameter binding
- Transaction support
- Result processing and transformation
- Connection pooling

**Usage Example:**
```javascript
// In a Data Source node with database type
{
  type: 'mysql',
  connection: 'mysql://user:pass@host/db',
  query: 'SELECT * FROM users WHERE status = ?',
  params: ['active']
}
```

### File Storage Integration

**Key Features:**
- Support for multiple storage providers (S3, Dropbox, Google Drive, local)
- File upload and download operations
- Directory listing and management
- File metadata handling
- Access control configuration

**Usage Example:**
```javascript
// In an Action node with file operation type
{
  provider: 's3',
  operation: 'upload',
  file: '{{data.fileContent}}',
  fileName: '{{data.fileName}}',
  path: '/uploads/'
}
```

### Webhook Integration

**Key Features:**
- Webhook registration and management
- Authentication options (none, token, HMAC)
- Request validation
- Response formatting
- History tracking

**Usage Example:**
```javascript
// In a Trigger node with webhook type
{
  path: '/webhooks/new-order',
  description: 'Trigger for new orders',
  authType: 'token',
  authConfig: {
    token: '{{config.webhookToken}}'
  }
}
```

## Testing Framework

The Kobe Workflow Builder now includes a comprehensive testing framework to verify that workflows function correctly.

### Test Runner

**Key Features:**
- UI for running tests and viewing results
- Detailed test result display
- Test history tracking
- Error reporting

**How to Access:**
1. Click the "Show Test Panel" button in the bottom right corner of the workflow builder
2. Select "Run Integration Tests" to test all integration capabilities
3. Select "Validate Sample Workflow" to check a workflow for errors

### Integration Tests

The testing framework includes tests for all integration capabilities:

- API Integration Tests
- Email Service Tests
- Database Connector Tests
- File Storage Tests
- Webhook Handler Tests
- Variable Template System Tests
- Complete Workflow Simulation Tests

### Workflow Validation

The testing framework can validate workflows for:

- Missing required configurations
- Disconnected nodes
- Circular references
- Invalid node configurations

## Conclusion

These new features significantly enhance the capabilities of the Kobe Workflow Builder, allowing you to create more sophisticated and powerful workflows. The extended node types, variable template system, advanced configuration options, and integration capabilities work together to provide a comprehensive workflow automation platform.

For any questions or issues, please refer to the GitHub repository or contact the development team.
