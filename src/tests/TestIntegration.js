/**
 * Test Integration Component for Kobe Workflow Builder
 * 
 * This component integrates the test runner into the main application.
 */

import React, { useState } from 'react';
import TestRunner from './TestRunner';
import { createSampleWorkflow, validateWorkflow } from './testUtils';

const TestIntegration = () => {
  const [showTests, setShowTests] = useState(false);
  const [testMode, setTestMode] = useState('integration'); // 'integration' or 'workflow'
  const [validationResult, setValidationResult] = useState(null);

  const toggleTestPanel = () => {
    setShowTests(!showTests);
  };

  const validateSampleWorkflow = () => {
    const sampleWorkflow = createSampleWorkflow();
    const result = validateWorkflow(sampleWorkflow);
    setValidationResult(result);
    setTestMode('workflow');
    setShowTests(true);
  };

  const runIntegrationTests = () => {
    setValidationResult(null);
    setTestMode('integration');
    setShowTests(true);
  };

  return (
    <div className="test-integration">
      <div className="test-buttons" style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000
      }}>
        <button 
          onClick={toggleTestPanel}
          style={{
            padding: '10px 15px',
            backgroundColor: showTests ? '#f44336' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {showTests ? 'Hide Test Panel' : 'Show Test Panel'}
        </button>
        
        <button 
          onClick={validateSampleWorkflow}
          style={{
            padding: '10px 15px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          Validate Sample Workflow
        </button>
        
        <button 
          onClick={runIntegrationTests}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          Run Integration Tests
        </button>
      </div>
      
      {showTests && (
        <div className="test-panel" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: '800px',
          maxHeight: '80vh',
          overflowY: 'auto',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          zIndex: 1001
        }}>
          <div className="test-panel-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px'
          }}>
            <h2 style={{ margin: 0 }}>
              {testMode === 'integration' ? 'Integration Tests' : 'Workflow Validation'}
            </h2>
            <button 
              onClick={toggleTestPanel}
              style={{
                padding: '5px 10px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
          
          <div className="test-panel-content">
            {testMode === 'integration' ? (
              <TestRunner />
            ) : (
              <div className="workflow-validation">
                <h3>Sample Workflow Validation</h3>
                
                {validationResult && (
                  <div className="validation-result" style={{
                    padding: '15px',
                    backgroundColor: validationResult.valid ? '#e8f5e9' : '#ffebee',
                    borderRadius: '4px',
                    marginTop: '15px'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 10px 0',
                      color: validationResult.valid ? '#2e7d32' : '#c62828'
                    }}>
                      {validationResult.valid ? 'Workflow is Valid' : 'Workflow has Errors'}
                    </h4>
                    
                    {!validationResult.valid && (
                      <ul style={{ margin: '0', paddingLeft: '20px' }}>
                        {validationResult.errors.map((error, index) => (
                          <li key={index} style={{ color: '#c62828' }}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
                <div className="sample-workflow-info" style={{ marginTop: '20px' }}>
                  <h4>Sample Workflow Structure</h4>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '12px'
                  }}>
                    {JSON.stringify(createSampleWorkflow(), null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestIntegration;
