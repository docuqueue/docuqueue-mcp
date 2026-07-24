# DocuQueue MCP Server

MCP server for creating professional documents (invoices, contracts, certificates, proposals, reports) using the DocuQueue API.

## Quick Start

```bash
# Run directly with npx
npx github:docuqueue/docuqueue-mcp
```

## Setup

### 1. Get your API key

Sign up at [docuqueue.com](https://docuqueue.com) to get your API key.

### 2. Configure the MCP server

Create `~/.docuqueue/mcp-config.yaml`:

```yaml
docuqueue_api_key: "your-api-key-here"
docuqueue_api_url: "https://docuqueue.com/api/v1"
```

### 3. Add to your AI client

**Claude Code:**
```bash
claude mcp add docuqueue -- npx github:docuqueue/docuqueue-mcp
```

**Codex (`~/.codex/config.toml`):**
```toml
[mcp_servers.docuqueue]
command = "npx"
args = ["github:docuqueue/docuqueue-mcp"]
```

**OpenCode (`~/.config/opencode/opencode.jsonc`):**
```json
{
  "mcp": {
    "docuqueue": {
      "type": "local",
      "command": ["npx", "github:docuqueue/docuqueue-mcp"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list_templates` | Browse available document designs |
| `create_template` | Design a new document layout |
| `fill_template` | Create a document with your data |
| `preview_template` | See how your document will look |
| `get_status` | Check if your document is ready |
| `download_pdf` | Get your finished document |
| `upload_docx_template` | Use your own Word document as a design |
| `extract_branding` | Match your company's visual style |
| `get_branding` | View your saved style settings |

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
