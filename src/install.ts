#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { createInterface } from 'readline';

const CONFIGS: Record<string, { path: string; rootKey: string; urlField: string }> = {
  'claude-desktop': {
    path: join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
    rootKey: 'mcpServers',
    urlField: 'url',
  },
  'cursor': {
    path: join(homedir(), '.cursor', 'mcp.json'),
    rootKey: 'mcpServers',
    urlField: 'url',
  },
  'windsurf': {
    path: join(homedir(), '.codeium', 'windsurf', 'mcp_config.json'),
    rootKey: 'mcpServers',
    urlField: 'serverUrl',
  },
  'vscode': {
    path: join(homedir(), '.cursor', 'mcp.json'),  // VS Code uses same location as Cursor
    rootKey: 'servers',  // Note: VS Code uses 'servers' not 'mcpServers'
    urlField: 'url',
  },
  'opencode': {
    path: 'opencode.json',  // Project-level config
    rootKey: 'mcp',
    urlField: 'url',
  },
};

function detectInstalled(): string[] {
  const installed: string[] = [];
  for (const [name, config] of Object.entries(CONFIGS)) {
    if (existsSync(config.path)) {
      // Skip VS Code if Cursor is already detected (they share config)
      if (name === 'vscode' && installed.includes('cursor')) {
        continue;
      }
      installed.push(name);
    }
  }
  return installed;
}

function readConfig(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return {};
  }
}

function writeConfig(path: string, config: Record<string, unknown>): void {
  const dir = require('path').dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(path, JSON.stringify(config, null, 2));
}

function mergeServer(config: Record<string, unknown>, rootKey: string, urlField: string, apiKey: string): Record<string, unknown> {
  const servers = (config[rootKey] as Record<string, unknown>) || {};
  
  servers['docuqueue'] = {
    url: 'https://mcp.docuqueue.com/sse',
    headers: {
      'api-key': apiKey,
    },
  };
  
  config[rootKey] = servers;
  return config;
}

async function promptApiKey(): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  
  return new Promise((resolve) => {
    rl.question('Enter your DocuQueue API key: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('DocuQueue MCP Installer\n');
  
  // Detect installed platforms
  const installed = detectInstalled();
  
  if (installed.length === 0) {
    console.log('No supported AI platforms detected.');
    console.log('Supported platforms: Claude Desktop, Cursor, Windsurf');
    console.log('\nYou can manually add DocuQueue MCP to your platform config.');
    process.exit(0);
  }
  
  console.log(`Detected ${installed.length} platform(s): ${installed.join(', ')}\n`);
  
  // Get API key
  const apiKey = await promptApiKey();
  if (!apiKey) {
    console.log('No API key provided. Exiting.');
    process.exit(1);
  }
  
  // Configure each platform
  for (const platform of installed) {
    const config = CONFIGS[platform];
    const existing = readConfig(config.path);
    const updated = mergeServer(existing, config.rootKey, config.urlField, apiKey);
    writeConfig(config.path, updated);
    console.log(`Configured: ${platform}`);
  }
  
  console.log('\nDone! DocuQueue MCP is now configured.');
  console.log('Restart your AI platform to start using DocuQueue.');
}

main().catch(console.error);
