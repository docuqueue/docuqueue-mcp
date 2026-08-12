# DocuQueue MCP Server

[![npm version](https://img.shields.io/npm/v/docuqueue-mcp.svg)](https://www.npmjs.com/package/docuqueue-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Glama](https://glama.ai/mcp/servers/docuqueue/docuqueue-mcp/badges/score.svg)](https://glama.ai/mcp/servers/docuqueue/docuqueue-mcp)

> Generate PDFs, fill forms, and manage documents from AI chat. Works with Claude, ChatGPT, Cursor, and any MCP-compatible client.

## Quick Start

Add this URL to your AI client's MCP settings:

```
https://docuqueue.com/mcp/sse
```

That's it. No install, no API key required for OAuth.

## Setup

### Claude.ai (Recommended)

1. Go to **Settings → Connectors → Add custom connector**
2. Paste: `https://docuqueue.com/mcp/sse`
3. Click **Authorize** in the browser popup
4. Start generating documents

### Claude Desktop / Claude Code / Cursor

Add to your config file (`.mcp.json`, `claude_desktop_config.json`, `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "docuqueue": {
      "url": "https://docuqueue.com/mcp/sse",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Get your API key from [docuqueue.com/dashboard](https://docuqueue.com/dashboard).

### ChatGPT

1. Go to Settings → Connectors → Add custom connector
2. Enter URL: `https://docuqueue.com/mcp/sse`
3. Add header: `Authorization: Bearer YOUR_API_KEY`

## Available Tools

| Tool | Description |
|------|-------------|
| `list_templates` | Browse available document designs |
| `create_template` | Design a new document layout |
| `fill_template` | Create a document with your data |
| `preview_template` | See how your document will look |
| `get_status` | Check if your document is ready |
| `download_pdf` | Get your finished document |
| `extract_branding` | Match your company's visual style from their website |

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

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Authentication error | Ask the AI: "re-authenticate with DocuQueue" |
| Connection refused | Check the server URL is `https://docuqueue.com/mcp/sse` |
| Rate limited | Wait 1 minute, then retry |
| Template not found | Ask the AI to list templates first |

## Privacy

DocuQueue MCP is a remote server — your requests go to DocuQueue's servers and return generated PDFs. Authentication tokens are sent only to DocuQueue's services during OAuth login and API calls. Documents are generated on-the-fly and not stored indefinitely.

## Development

```bash
git clone https://github.com/docuqueue/docuqueue-mcp.git
cd docuqueue-mcp
npm install
npm run dev
```

## License

MIT

## Links

- Website: [docuqueue.com](https://docuqueue.com)
- MCP page: [docuqueue.com/mcp](https://docuqueue.com/mcp)
- GitHub: [github.com/docuqueue/docuqueue-mcp](https://github.com/docuqueue/docuqueue-mcp)
- Issues: [github.com/docuqueue/docuqueue-mcp/issues](https://github.com/docuqueue/docuqueue-mcp/issues)
