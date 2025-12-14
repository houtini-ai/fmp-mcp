#!/usr/bin/env node

/**
 * Simple test script to verify the FMP MCP server works
 * Run with: node test-server.js
 */

import { spawn } from 'child_process';

const server = spawn('node', ['./build/index.js'], {
  env: {
    ...process.env,
    FMP_API_KEY: '4bqSxSXvO3TBUszm6VqRMKszhq5M0SmF'
  },
  stdio: ['pipe', 'pipe', 'inherit']
});

server.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
});

server.on('exit', (code) => {
  console.log('Server exited with code:', code);
});

// Give it 2 seconds to start
setTimeout(() => {
  console.log('Server should be running now. Check stderr for "FMP MCP Server running on stdio"');
  process.exit(0);
}, 2000);
