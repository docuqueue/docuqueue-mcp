import { z } from 'zod';
import { apiClient } from '../api/client';
import { getErrorMessage } from '../errors/messages';

export const fillTemplateSchema = z.object({
  template_id: z.string().describe('Template ID to fill'),
  data: z.record(z.unknown()).describe('JSON key-value pairs for template variables'),
  options: z
    .object({
      page_size: z.string().optional().describe('Page size (A4, Letter, etc.)'),
      orientation: z.enum(['portrait', 'landscape']).optional(),
      margin: z.string().optional().describe('Page margin (e.g., "15mm")'),
    })
    .optional()
    .describe('PDF rendering options'),
  confirm: z
    .boolean()
    .default(false)
    .describe('Set to true to generate PDF after preview. Default false shows preview first.'),
});

function validateDataAgainstSchema(
  data: Record<string, unknown>,
  schema: { variables: string[]; loops?: { name: string; fields: string[] }[] }
): { missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const variable of schema.variables) {
    if (data[variable] === undefined || data[variable] === null || data[variable] === '') {
      missing.push(variable);
    }
  }

  if (schema.loops) {
    for (const loop of schema.loops) {
      const items = data[loop.name];
      if (!items || !Array.isArray(items) || items.length === 0) {
        warnings.push(`Loop "${loop.name}" is empty or missing`);
      } else {
        for (let i = 0; i < items.length; i++) {
          for (const field of loop.fields) {
            if (items[i][field] === undefined || items[i][field] === null) {
              warnings.push(`Loop "${loop.name}" item ${i + 1}: missing field "${field}"`);
            }
          }
        }
      }
    }
  }

  return { missing, warnings };
}

export async function fillTemplate(args: {
  template_id: string;
  data: Record<string, unknown>;
  options?: {
    page_size?: string;
    orientation?: 'portrait' | 'landscape';
    margin?: string;
  };
  confirm?: boolean;
}) {
  try {
    const template = await apiClient.getTemplate(args.template_id);
    const schema = template.schema;

    if (schema) {
      const { missing, warnings } = validateDataAgainstSchema(args.data, schema);

      if (missing.length > 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `## ❌ Missing Required Fields\n\nThe following fields are required but not provided:\n\n${missing.map(f => `- \`${f}\``).join('\n')}\n\n**Template schema:**\n- Variables: ${schema.variables.join(', ')}\n- Loops: ${schema.loops?.map(l => l.name).join(', ') || 'none'}\n\nPlease provide all required fields and try again.`,
            },
          ],
          isError: true,
        };
      }

      if (warnings.length > 0 && !args.confirm) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `## ⚠️ Warnings\n\n${warnings.map(w => `- ${w}`).join('\n')}\n\n**Data provided:** ${Object.keys(args.data).length} fields\n**Required fields:** ${schema.variables.length} variables + ${schema.loops?.length || 0} loops\n\nPreview will render with missing loop data. Continue?`,
            },
          ],
        };
      }
    }

    if (!args.confirm) {
      const preview = await apiClient.previewTemplate(
        args.template_id,
        args.data,
        'text.html'
      );

      return {
        content: [
          {
            type: 'text' as const,
            text: `## Preview (verify before generating)\n\n${preview}\n\n---\n**Ready to generate PDF?** Call fill_template again with \`confirm: true\` and the same data.\n\n⚠️ This will consume credits.`,
          },
        ],
      };
    }

    const result = await apiClient.fillTemplate(args.template_id, {
      data: args.data,
      options: args.options,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              job_id: result.job_id,
              status: result.status,
              message: `PDF generation started. Job ID: ${result.job_id}. Use get_status to check progress.`,
              credits_used: result.credits_used,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: getErrorMessage(error),
        },
      ],
      isError: true,
    };
  }
}
