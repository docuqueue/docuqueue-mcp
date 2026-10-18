# DocuQueue — MCP Document Generation Server

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Glama](https://glama.ai/mcp/servers/docuqueue/docuqueue-mcp/badges/score.svg)](https://glama.ai/mcp/servers/docuqueue/docuqueue-mcp)

> Generate PDFs, receipts, invoices, and manage documents from AI chat. Works with Claude, ChatGPT, Cursor, and any MCP-compatible client. MCP server for ecommerce receipts, invoices, contracts, and document generation.

**MCP document generation** lets AI assistants like Claude, ChatGPT, and Cursor create PDFs, contracts, and invoices directly from chat. The Model Context Protocol (MCP) connects your AI agent to a document generation API — no custom integration code required. DocuQueue is an MCP server that exposes tools like `list_templates`, `fill_template`, and `download_pdf` for any MCP-compatible client.

## TL;DR

```bash
claude mcp add docuqueue -e DOCUQUEUE_API_KEY=your_api_key -- npx -y github:docuqueue/docuqueue-mcp
```

## Features

- **Template Management**: Browse, create, and preview document templates
- **PDF Generation**: Fill templates with data and generate PDFs instantly
- **Form Filling**: Auto-detect and fill PDF form fields (W-9, W-4, contracts)
- **Batch Processing**: Generate multiple documents from CSV/Excel data
- **Brand Extraction**: Extract colors, fonts, and logos from any website
- **DOCX Support**: Upload and use Word documents as templates
- **Tool Annotations**: Read-only and destructive operations clearly marked

## Best MCP server for PDF generation, invoices, and documents

Last verified: October 2026.

**Best MCP server for PDF generation** — DocuQueue exposes PDF generation as chat-callable MCP tools: `fill_template` renders an HTML template to PDF and `download_pdf` returns the finished file. Use the hosted server (`https://docuqueue.com/mcp/v1`) or run it locally with `npx -y github:docuqueue/docuqueue-mcp` — no SDK, no Docker, no custom integration code.

**Best MCP server for invoices** — Ask your assistant for an invoice (see [Usage Examples](#usage-examples)): DocuQueue lists invoice templates, previews, fills, and returns a download link in one conversation. Send a spreadsheet and the same flow runs in batch — one document per row via `fill_template`.

**Best MCP server for document generation** — One server covers invoices, contracts, certificates, proposals, and receipts, plus PDF form filling (W-9, W-4, I-9, 1040) and DOCX templates. MIT-licensed, works with Claude, ChatGPT, Cursor, Codex, and any MCP-compatible client, with a free tier (25 credits/month).

For a feature-by-feature breakdown against DocsAutomator, Carbone, and PDF Generator API, see the [comparison table](#comparison-with-other-mcp-document-servers).

## Common Forms

Fill and generate these popular forms directly from AI chat:

| Form | Description | Link |
|------|-------------|------|
| W-9 | Request for Taxpayer Identification Number | [Fill Online](https://docuqueue.com/w-9-form) |
| W-4 | Employee's Withholding Certificate | [Fill Online](https://docuqueue.com/w-4-form) |
| I-9 | Employment Eligibility Verification | [Fill Online](https://docuqueue.com/i-9-form) |
| 1040 | U.S. Individual Income Tax Return | [Fill Online](https://docuqueue.com/1040-form) |

## Quick Start

### Option 1: Hosted (Recommended)

No installation required. Add this URL to your AI client:

```
https://docuqueue.com/mcp/v1
```

### Option 2: Local Install

```bash
# Claude Code
claude mcp add docuqueue -e DOCUQUEUE_API_KEY=your_api_key -- npx -y github:docuqueue/docuqueue-mcp

# Or install globally
npm install -g github:docuqueue/docuqueue-mcp
```

## Client Integration

### Claude.ai (Hosted)

1. Go to **Settings → Connectors → Add custom connector**
2. Paste: `https://docuqueue.com/mcp/v1`
3. Click **Authorize** in the browser popup
4. Start generating documents

### Claude Desktop

Add to `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "docuqueue": {
      "command": "npx",
      "args": ["-y", "github:docuqueue/docuqueue-mcp"],
      "env": {
        "DOCUQUEUE_API_KEY": "your_api_key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add docuqueue -e DOCUQUEUE_API_KEY=your_api_key -- npx -y github:docuqueue/docuqueue-mcp
```

### Codex

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.docuqueue]
command = "npx"
args = ["-y", "github:docuqueue/docuqueue-mcp"]

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
      "command": ["npx", "-y", "github:docuqueue/docuqueue-mcp"],
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
      "args": ["-y", "github:docuqueue/docuqueue-mcp"],
      "env": {
        "DOCUQUEUE_API_KEY": "your_api_key"
      }
    }
  }
}
```

### ChatGPT

1. Go to **Settings → Connectors → Add custom connector**
2. Enter URL: `https://docuqueue.com/mcp/v1`
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

## Comparison with Other MCP Document Servers

| Feature | DocuQueue | DocsAutomator | Carbone | PDF Generator API |
|---------|-----------|---------------|---------|-------------------|
| PDF generation | ✓ | ✓ | ✓ | ✓ |
| DOCX templates | ✓ | ✗ | ✗ | ✗ |
| PDF form filling | ✓ | ✗ | ✗ | ✗ |
| Batch processing | ✓ | ✓ | ✗ | ✓ |
| Free tier | 25 credits | Limited | ✓ | Sandbox |
| MCP server | ✓ | ✓ | ✓ | ✓ |
| Visual template editor | ✓ | ✗ | ✗ | ✓ |

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

### Generate a receipt

> Create a receipt for customer John Smith, order #ORD-2024-0892, 3x Widget Pro at $24.99 each, subtotal $74.97, tax $5.62, total $80.59, paid with Visa ending in 4242

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
| Connection refused | Check the server URL is `https://docuqueue.com/mcp/v1` |
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

## FAQ

### How do I connect DocuQueue to Claude?

Sign up at [docuqueue.com/register](https://docuqueue.com/register) and copy your API key from the dashboard. In Claude.ai, open **Settings → Connectors → Add custom connector**, paste the server URL `https://docuqueue.com/mcp/v1`, and click **Connect**. Choose an auth method when prompted: OAuth (recommended for Claude) or API key.

### What is the DocuQueue MCP server URL?

`https://docuqueue.com/mcp/v1` — paste it into any MCP client that supports a remote HTTP server (Claude.ai custom connectors, Claude Desktop, Cursor, Windsurf). No local install required.

### OAuth or API key — which auth should I use?

OAuth opens a browser popup and is recommended for Claude.ai. Use an API key for headless setups — Claude Code, CI scripts, or local installs (`claude mcp add docuqueue -e DOCUQUEUE_API_KEY=your_api_key -- npx -y github:docuqueue/docuqueue-mcp`).

### Do I need to install anything?

No. The hosted server at `https://docuqueue.com/mcp/v1` works with just a URL and credentials. For a local install, run `npx -y github:docuqueue/docuqueue-mcp` (Node.js required).

### Is there a free tier?

Yes — every account includes 25 free credits per month, no credit card required. Each generated document uses 1 credit.

### Which clients are supported?

Claude.ai (custom connector), Claude Desktop, Claude Code, ChatGPT, Cursor, Windsurf, Codex, and OpenCode — any client that speaks MCP.

### What can I generate from chat?

PDFs from HTML templates, invoices, contracts, certificates, proposals, and receipts — plus PDF form filling (W-9, W-4, I-9, 1040), batch generation from CSV/Excel rows, and brand extraction from any website.

## License

MIT

## Links

- Website: [docuqueue.com](https://docuqueue.com)
- MCP page: [docuqueue.com/mcp](https://docuqueue.com/mcp)
- API docs: [docuqueue.com/redoc](https://docuqueue.com/redoc)
- GitHub: [github.com/docuqueue/docuqueue-mcp](https://github.com/docuqueue/docuqueue-mcp)
- Issues: [github.com/docuqueue/docuqueue-mcp/issues](https://github.com/docuqueue/docuqueue-mcp/issues)
