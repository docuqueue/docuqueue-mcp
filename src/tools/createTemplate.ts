import { z } from 'zod';
import { apiClient } from '../api/client';
import { getErrorMessage } from '../errors/messages';

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(255).describe('Template name'),
  description: z.string().max(1000).optional().describe('Human-readable description'),
  html_content: z
    .string()
    .min(10)
    .describe(
      'Jinja2 HTML template. MUST follow these design standards:\n' +
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
});

export async function createTemplate(args: {
  name: string;
  description?: string;
  html_content: string;
}) {
  try {
    const template = await apiClient.createTemplate({
      name: args.name,
      description: args.description,
      html_content: args.html_content,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(template, null, 2),
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
