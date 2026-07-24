import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { Config, ConfigSchema, Branding } from './types/index.js';

const CONFIG_DIR = join(homedir(), '.docuqueue');
const CONFIG_FILE = join(CONFIG_DIR, 'mcp-config.yaml');

// Simple YAML parser (for our config needs)
function parseYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentSection: Record<string, unknown> = result;
  let currentKey = '';

  for (const line of content.split('\n')) {
    if (line.startsWith('#') || line.trim() === '') continue;

    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();

    if (trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();

      if (indent === 0) {
        currentKey = key;
        if (value) {
          result[key] = parseValue(value);
        } else {
          result[key] = {};
          currentSection = result[key] as Record<string, unknown>;
        }
      } else {
        if (value) {
          currentSection[key] = parseValue(value);
        }
      }
    }
  }

  return result;
}

function parseValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function toYaml(obj: Record<string, unknown>, indent = 0): string {
  let result = '';
  const prefix = '  '.repeat(indent);

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;

    if (typeof value === 'object' && !Array.isArray(value)) {
      result += `${prefix}${key}:\n${toYaml(value as Record<string, unknown>, indent + 1)}`;
    } else if (Array.isArray(value)) {
      result += `${prefix}${key}:\n`;
      for (const item of value) {
        result += `${prefix}  - ${item}\n`;
      }
    } else {
      result += `${prefix}${key}: ${value}\n`;
    }
  }

  return result;
}

export class ConfigManager {
  private config: Config | null = null;

  constructor() {
    this.ensureConfigDir();
  }

  private ensureConfigDir(): void {
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  load(): Config {
    if (this.config) return this.config;

    if (!existsSync(CONFIG_FILE)) {
      throw new Error(
        `Config file not found at ${CONFIG_FILE}. ` +
        'Create it with your DocuQueue API key.'
      );
    }

    const content = readFileSync(CONFIG_FILE, 'utf-8');
    const raw = parseYaml(content);

    this.config = ConfigSchema.parse(raw);
    return this.config;
  }

  save(config: Config): void {
    const content = toYaml(config as unknown as Record<string, unknown>);
    writeFileSync(CONFIG_FILE, content, 'utf-8');
    this.config = config;
  }

  updateBranding(branding: Partial<Branding>): void {
    const config = this.load();
    config.brand = {
      ...config.brand,
      ...branding,
      saved_at: new Date().toISOString(),
    };
    this.save(config);
  }

  getBranding(): Branding | undefined {
    return this.load().brand;
  }

  getApiKey(): string {
    return this.load().docuqueue_api_key;
  }

  getApiUrl(): string {
    return this.load().docuqueue_api_url;
  }

  reload(): Config {
    this.config = null;
    return this.load();
  }
}

export const configManager = new ConfigManager();
