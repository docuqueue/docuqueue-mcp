---
name: docuqueue-mcp
description: Generate PDFs, fill forms, and manage documents from AI chat using DocuQueue. Works with Claude, ChatGPT, Cursor, and any MCP-compatible client.
homepage: https://docuqueue.com/mcp
repository: https://github.com/docuqueue/docuqueue-mcp
---

# DocuQueue MCP Server

[![npm version](https://img.shields.io/npm/v/docuqueue-mcp.svg)](https://www.npmjs.com/package/docuqueue-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Glama](https://glama.ai/mcp/servers/docuqueue/docuqueue-mcp/badges/score.svg)](https://glama.ai/mcp/servers/docuqueue/docuqueue-mcp)

> Generate PDFs, fill forms, and manage documents from AI chat. Works with Claude, ChatGPT, Cursor, and any MCP-compatible client.

## TL;DR

```bash
claude mcp add docuqueue -e DOCUQUEUE_API_KEY=your_api_key -- npx docuqueue-mcp
```

## Features

- **Template Management**: Browse, create, and preview document templates
- **PDF Generation**: Fill templates with data and generate PDFs instantly
- **Form Filling**: Auto-detect and fill PDF form fields (W-9, W-4, contracts)
- **Batch Processing**: Generate multiple documents from CSV/Excel data
- **Brand Extraction**: Extract colors, fonts, and logos from any website
- **DOCX Support**: Upload and use Word documents as templates
- **Tool Annotations**: Read-only and destructive operations clearly marked

## Quick Start

### Option 1: Hosted (Recommended)

No installation required. Add this URL to your AI client:

```
https://docuqueue.com/mcp/sse
```

### Option 2: Local Install

```bash
# Claude Code
claude mcp add docuqueue -e DOCUQUEUE_API_KEY=your_api_key -- npx docuqueue-mcp

# Or install globally
npm install -g docuqueue-mcp
```

## Client Integration

### Claude.ai (Hosted)

1. Go to **Settings → Connectors → Add custom connector**
2. Paste: `https://docuqueue.com/mcp/sse`
3. Click **Authorize** in the browser popup
4. Start generating documents

### Claude Desktop

Add to `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "docuqueue": {
      "command": "npx",
      "args": ["docuqueue-mcp"],
      "env": {
        "DOCUQUEUE_API_KEY": "your_api_key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add docuqueue -e DOCUQUEUE_API_KEY=your_api_key -- npx docuqueue-mcp
```

### Codex

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.docuqueue]
command = "npx"
args = ["docuqueue-mcp"]

[mcp_servers.docuqueue.env]
DOCUQUEUE_API_KEY = "your_api_key"
```

### OpenCode

Add to `~/.config/opencode/opencode.jsonc`:

```json
{
  "mcp": {
    "docuqueue": {
      "type": "local",
      "command": ["npx", "docuqueue-mcp"],
      "env": {
        "DOCUQUEUE_API_KEY": "your_api_key"
      }
    }
  }
}
```

### Cursor / Windsurf

Add to `~/.cursor/mcp.json` or `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "docuqueue": {
      "command": "npx",
      "args": ["docuqueue-mcp"],
      "env": {
        "DOCUQUEUE_API_KEY": "your_api_key"
      }
    }
  }
}
```

### ChatGPT

1. Go to **Settings → Connectors → Add custom connector**
2. Enter URL: `https://docuqueue.com/mcp/sse`
3. Add header: `Authorization: Bearer YOUR_API_KEY`

## Available Tools

### Templates

| Tool | Description | Annotations |
|------|-------------|-------------|
| `list_templates` | Browse available document designs | Read-only |
| `create_template` | Design a new document layout | Write |
| `preview_template` | See how your document will look | Read-only |
| `upload_docx_template` | Use your own Word document as a design | Write |

### Document Generation

| Tool | Description | Annotations |
|------|-------------|-------------|
| `fill_template` | Create a document with your data | Write |
| `get_status` | Check if your document is ready | Read-only |
| `download_pdf` | Get your finished document | Read-only |

### Branding

| Tool | Description | Annotations |
|------|-------------|-------------|
| `extract_branding` | Match your company's visual style from their website | Read-only (external) |
| `get_branding` | View your saved style settings | Read-only |

## Tool Annotations

DocuQueue MCP tools include [MCP ToolAnnotations](https://modelcontextprotocol.io/specification/2025-03-26/server/tools#toolannotations) so clients can:

- Distinguish **read-only** tools from write-capable tools
- Understand which operations are **destructive**
- Identify tools that access **external resources**

| Tool | `readOnlyHint` | `destructiveHint` | `idempotentHint` | `openWorldHint` |
|------|----------------|-------------------|------------------|-----------------|
| `list_templates` | `true` | `false` | `true` | `false` |
| `create_template` | `false` | `false` | `false` | `false` |
| `preview_template` | `true` | `false` | `true` | `false` |
| `fill_template` | `false` | `false` | `false` | `false` |
| `get_status` | `true` | `false` | `true` | `false` |
| `download_pdf` | `true` | `false` | `true` | `false` |
| `extract_branding` | `true` | `false` | `true` | `true` |
| `get_branding` | `true` | `false` | `true` | `false` |
| `upload_docx_template` | `false` | `false` | `false` | `false` |

## Usage Examples

Each example is a prompt you can paste directly into your AI chat:

### Generate an invoice

> Create an invoice for Acme Corp, 3 widgets at $50 each, 10% tax

The AI will list templates, preview the invoice, generate the PDF, and return a download link.

### Generate a certificate

> Create a certificate for John Doe, completed the Python bootcamp on August 12, 2026

### Generate a contract

> Create an NDA between Acme Corp and Globex Corp, effective January 1, 2026

### Fill a form

> Fill in this W-9 form: name "Acme Corp", EIN "12-3456789", address "123 Main St"

### Extract branding from a website

> Extract the brand colors and fonts from https://stripe.com

### Upload a custom template

> Upload this Word document as a template: /path/to/contract.docx

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `DOCUQUEUE_API_KEY` | Yes* | Your DocuQueue API key |

*Not required when using hosted OAuth mode.

Get your API key from [docuqueue.com/dashboard](https://docuqueue.com/dashboard).

## How It Works

1. **Connect** — Add the MCP server to your client with your API key
2. **Browse** — Use `list_templates` to find a template
3. **Preview** — Use `preview_template` to see how it looks with your data
4. **Generate** — Use `fill_template` to create the PDF
5. **Download** — Use `download_pdf` to get the finished document

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Authentication error | Ask the AI: "re-authenticate with DocuQueue" |
| Connection refused | Check the server URL is `https://docuqueue.com/mcp/sse` |
| Rate limited | Wait 1 minute, then retry |
| Template not found | Ask the AI to list templates first |
| Tool not appearing | Restart your MCP client after adding the server |

## Privacy

DocuQueue MCP is a remote server — your requests go to DocuQueue's servers and return generated PDFs. Authentication tokens are sent only to DocuQueue's services during OAuth login and API calls. Documents are generated on-the-fly and not stored indefinitely.

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
git clone https://github.com/docuqueue/docuqueue-mcp.git
cd docuqueue-mcp
npm install
```

### Run Locally

```bash
# Development mode with hot reload
npm run dev

# Or build and run
npm run build
npm start
```

### Test

```bash
npm test
```

### Project Structure

```
src/
├── index.ts          # Local MCP server (stdio)
├── remote.ts         # Remote MCP server (SSE/HTTP)
├── config.ts         # Configuration management
├── tools/            # Tool implementations
│   ├── listTemplates.ts
│   ├── createTemplate.ts
│   ├── fillTemplate.ts
│   ├── previewTemplate.ts
│   ├── getStatus.ts
│   ├── downloadPdf.ts
│   ├── uploadDocxTemplate.ts
│   └── uploadPdf.ts
├── branding/         # Brand extraction
├── api/              # API client
├── errors/           # Error handling
└── types/            # TypeScript types
```

## License

MIT

## Links

- Website: [docuqueue.com](https://docuqueue.com)
- MCP page: [docuqueue.com/mcp](https://docuqueue.com/mcp)
- API docs: [docuqueue.com/redoc](https://docuqueue.com/redoc)
- GitHub: [github.com/docuqueue/docuqueue-mcp](https://github.com/docuqueue/docuqueue-mcp)
- Issues: [github.com/docuqueue/docuqueue-mcp/issues](https://github.com/docuqueue/docuqueue-mcp/issues)
