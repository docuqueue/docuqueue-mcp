#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { configManager } from './config';
import { listTemplates, listTemplatesSchema } from './tools/listTemplates';
import { createTemplate, createTemplateSchema } from './tools/createTemplate';
import { fillTemplate, fillTemplateSchema } from './tools/fillTemplate';
import { previewTemplate, previewTemplateSchema } from './tools/previewTemplate';
import { getStatus, getStatusSchema } from './tools/getStatus';
import { downloadPdf, downloadPdfSchema } from './tools/downloadPdf';
import { extractBranding } from './branding/extractor.js';
import { uploadDocxTemplate, uploadDocxTemplateSchema } from './tools/uploadDocxTemplate';

// Create MCP server
const server = new McpServer({
  name: 'document-generator',
  version: '0.1.0',
});

// Register tools
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
        'HTML design with placeholders. Use {{ variable }} for fields and {% for item in list %} for repeating sections.\n' +
          'Design standards:\n' +
          '- Font: Helvetica Neue/Arial, hierarchy: 28-36px headings, 14px body, 11-12px labels\n' +
          '- Colors: primary #4f46e5 (indigo), text #1a1a2e/#374151, muted #6b7280/#9ca3af, borders #e5e7eb/#f3f4f6\n' +
          '- Layout: flexbox/grid, 48px body padding, 32-48px section gaps\n' +
          '- Table: full-width, collapsed borders, primary-colored header, alternating row backgrounds\n' +
          '- Labels: 11px uppercase, 1px letter-spacing, muted color\n' +
          '- Buttons/badges: border-radius 20px, 4px 12px padding, 12px uppercase text\n' +
          '- Footer: top border, centered, muted text\n' +
          '- Use Jinja2 loops for repeating items, conditionals for optional sections\n' +
          '- NO external CSS/JS, NO inline styles on tables, all styles in <style> block'
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
      .enum(['text/html', 'application/pdf'])
      .default('text/html')
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

    // Save to config
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

// Start server
async function main() {
  try {
    // Validate config on startup
    configManager.load();
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('DocuQueue MCP server started');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
