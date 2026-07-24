import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { createServer } from 'http';
import { configManager } from './config';
import { listTemplates } from './tools/listTemplates';
import { createTemplate } from './tools/createTemplate';
import { fillTemplate } from './tools/fillTemplate';
import { previewTemplate } from './tools/previewTemplate';
import { getStatus } from './tools/getStatus';
import { downloadPdf } from './tools/downloadPdf';
import { extractBranding } from './branding/extractor.js';
import { uploadDocxTemplate } from './tools/uploadDocxTemplate';

function buildServer(): McpServer {
  const server = new McpServer({
    name: 'document-generator',
    version: '0.1.0',
  });

  server.tool(
    'list_templates',
    'Browse available document designs',
    {
      query: z.string().optional().describe('Search by name or description'),
      category: z.string().optional().describe('Filter by category'),
      tags: z.array(z.string()).optional().describe('Filter by tags'),
    },
    async (args) => listTemplates(args)
  );

  server.tool(
    'create_template',
    'Design a new document layout',
    {
      name: z.string().min(1).max(255).describe('Design name'),
      description: z.string().max(1000).optional().describe('Brief description of the design'),
      html_content: z
        .string()
        .min(10)
        .describe(
          'HTML design with placeholders. Use {{ variable }} for fields and {% for item in list %} for repeating sections.'
        ),
    },
    async (args) => createTemplate(args)
  );

  server.tool(
    'fill_template',
    'Create a document with your data. First call shows preview (free). Second call with confirm=true generates the final PDF.',
    {
      template_id: z.string().describe('Design ID to use'),
      data: z.record(z.unknown()).describe('Your data as key-value pairs'),
      options: z
        .object({
          page_size: z.string().optional().describe('Page size (A4, Letter, etc.)'),
          orientation: z.enum(['portrait', 'landscape']).optional(),
          margin: z.string().optional().describe('Page margin (e.g., "15mm")'),
        })
        .optional()
        .describe('Layout options'),
      confirm: z
        .boolean()
        .default(false)
        .describe('Set to true to generate final PDF. Default false shows preview first.'),
    },
    async (args) => fillTemplate(args)
  );

  server.tool(
    'preview_template',
    'See how your document will look before finalizing',
    {
      template_id: z.string().describe('Design ID to preview'),
      data: z.record(z.unknown()).describe('Sample data for preview'),
      accept: z
        .enum(['text.html', 'application/pdf'])
        .default('text.html')
        .describe('Output format'),
    },
    async (args) => previewTemplate(args)
  );

  server.tool(
    'get_status',
    'Check if your document is ready',
    {
      job_id: z.string().describe('Document job ID'),
    },
    async (args) => getStatus(args)
  );

  server.tool(
    'download_pdf',
    'Get your finished document',
    {
      job_id: z.string().describe('Document job ID'),
    },
    async (args) => downloadPdf(args)
  );

  server.tool(
    'extract_branding',
    'Match your company\'s visual style from their website',
    {
      website: z.string().describe('Company website URL'),
    },
    async (args) => {
      const result = await extractBranding(args.website);
      
      if (result.error) {
        return {
          content: [{ type: 'text' as const, text: result.error }],
          isError: true,
        };
      }

      configManager.updateBranding(result.branding);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                message: 'Style settings saved.',
                branding: result.branding,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    'get_branding',
    'View your saved style settings',
    {},
    async () => {
      const branding = configManager.getBranding();
      
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                branding: branding || 'No style settings saved. Use extract_branding to set up.',
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    'upload_docx_template',
    'Use your own Word document as a design',
    {
      file_path: z.string().describe('Path to the .docx file'),
      name: z.string().min(1).max(255).describe('Design name'),
      description: z.string().max(1000).optional().describe('Brief description'),
    },
    async (args) => uploadDocxTemplate(args)
  );

  return server;
}

const PORT = parseInt(process.env.PORT || '3000', 10);

const httpServer = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, api-key, mcp-session-id');
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // MCP endpoint
  if (req.url === '/mcp') {
    // Validate API key
    const apiKey = req.headers['api-key'];
    if (!apiKey) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing api-key header' }));
      return;
    }

    // TODO: Validate API key against DocuQueue API
    // For now, accept any non-empty key

    const server = buildServer();
    const sessionId = randomUUID();
    
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
      enableJsonResponse: true,
    });

    await server.connect(transport);
    
    // Set session ID header
    res.setHeader('mcp-session-id', sessionId);
    
    await transport.handleRequest(req, res);
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

httpServer.listen(PORT, () => {
  console.error(`DocuQueue MCP server running on http://localhost:${PORT}/mcp`);
});
