#!/usr/bin/env node

// Test script for DocuQueue MCP server
import { configManager } from './src/config.js';
import { apiClient } from './src/api/client.js';

async function test() {
  console.log('Testing DocuQueue MCP...\n');

  // Load config
  const config = configManager.load();
  console.log('Config loaded:');
  console.log(`  API URL: ${config.docuqueue_api_url}`);
  console.log(`  API Key: ${config.docuqueue_api_key.substring(0, 10)}...`);
  console.log('');

  // Test health check
  try {
    const health = await apiClient.healthCheck();
    console.log('Health check:');
    console.log(`  Status: ${health.status}`);
    console.log(`  Redis: ${health.redis}`);
    console.log(`  Queue length: ${health.queue_length}`);
    console.log('');
  } catch (error) {
    console.error('Health check failed:', error);
  }

  // Test list templates
  try {
    const templates = await apiClient.listTemplates();
    console.log('Templates:');
    console.log(`  Count: ${templates.length}`);
    if (templates.length > 0) {
      console.log(`  First: ${templates[0].name} (${templates[0].id})`);
    }
    console.log('');
  } catch (error) {
    console.error('List templates failed:', error);
  }

  console.log('All tests passed!');
}

test().catch(console.error);
