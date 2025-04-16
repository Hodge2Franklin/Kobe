/**
 * Test Runner for Kobe Workflow Builder
 * 
 * This file provides a UI for running integration tests and viewing results.
 */

import React, { useState } from 'react';
import { runAllTests } from './integrationTests';

const TestRunner = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const runTests = async () => {
    try {
      setIsRunning(true);
      setError(null);
      setTestResults(null);
      
      console.log('Starting integration tests...');
      const results = await runAllTests();
      
      setTestResults(results);
      console.log('Tests completed:', results);
    } catch (err) {
      console.error('Test execution failed:', err);
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="test-runner">
      <h2>Integration Tests</h2>
      
      <div className="test-controls">
        <button 
          onClick={runTests} 
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: isRunning ? '#cccccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'default' : 'pointer',
            fontSize: '16px',
            margin: '10px 0'
          }}
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>
      
      {error && (
        <div className="error-message" style={{ color: 'red', margin: '10px 0', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {isRunning && (
        <div className="loading" style={{ margin: '20px 0', textAlign: 'center' }}>
          Running tests, please wait...
        </div>
      )}
      
      {testResults && (
        <div className="test-results">
          <h3>Test Summary</h3>
          <div className="summary" style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            margin: '20px 0',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <div>
              <strong>Total Tests:</strong> {testResults.totalTests}
            </div>
            <div style={{ color: 'green' }}>
              <strong>Passed:</strong> {testResults.passed}
            </div>
            <div style={{ color: 'red' }}>
              <strong>Failed:</strong> {testResults.failed}
            </div>
          </div>
          
          <h3>Detailed Results</h3>
          <div className="detailed-results">
            {Object.entries(testResults.results).map(([testName, result]) => (
              <div 
                key={testName} 
                className="test-result-item"
                style={{
                  margin: '10px 0',
                  padding: '15px',
                  backgroundColor: result.success ? '#e8f5e9' : '#ffebee',
                  borderRadius: '4px',
                  borderLeft: `5px solid ${result.success ? '#4CAF50' : '#F44336'}`
                }}
              >
                <h4 style={{ margin: '0 0 10px 0' }}>
                  {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  <span style={{ 
                    float: 'right', 
                    color: result.success ? 'green' : 'red',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {result.success ? 'PASSED' : 'FAILED'}
                  </span>
                </h4>
                
                {!result.success && (
                  <div className="error-details" style={{ color: 'red', marginTop: '10px' }}>
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
                
                {result.success && result.service && (
                  <div className="service-info" style={{ marginTop: '10px', fontSize: '14px' }}>
                    <strong>Service:</strong> {result.service}
                  </div>
                )}
                
                {result.success && result.workflow && (
                  <div className="workflow-info" style={{ marginTop: '10px', fontSize: '14px' }}>
                    <strong>Workflow:</strong> {result.workflow}
                    <br />
                    <strong>Executed Nodes:</strong> {result.executedNodes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunner;
