# DocuQueue MCP Server

> Generate PDFs, fill forms, and manage documents from AI chat. Works with Claude, ChatGPT, Cursor, and any MCP-compatible client.

## Quick Start

### Remote Server (Recommended)

Add this URL to your AI client's MCP settings:

```
https://docuqueue.com/mcp
```

### Local Server (Alternative)

```bash
npx github:docuqueue/docuqueue-mcp
```

## Setup

### 1. Get your API key

Sign up at [docuqueue.com](https://docuqueue.com) to get your API key.

### 2. Add to your AI client

**Claude Desktop (`claude_desktop_config.json`):**
```json
{
  "mcpServers": {
    "docuqueue": {
      "url": "https://docuqueue.com/mcp",
      "headers": {
        "api-key": "YOUR_API_KEY"
      }
    }
  }
}
```

**Claude Code:**
```bash
claude mcp add docuqueue --transport http https://docuqueue.com/mcp
```

**Cursor (`.cursor/mcp.json`):**
```json
{
  "mcpServers": {
    "docuqueue": {
      "url": "https://docuqueue.com/mcp",
      "headers": {
        "api-key": "YOUR_API_KEY"
      }
    }
  }
}
```

**ChatGPT:**
1. Go to Settings → Connectors → Add custom connector
2. Enter URL: `https://docuqueue.com/mcp`
3. Add header: `api-key: YOUR_API_KEY`

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

## Usage

```
You: Create an invoice for Acme Corp, 3 widgets at $50 each, 10% tax
AI: [Lists templates] → [Previews invoice] → [Generates PDF] → [Returns download link]
```

## Development

```bash
git clone https://github.com/docuqueue/docuqueue-mcp.git
cd docuqueue-mcp
npm install
npm run dev
```

## License

MIT
