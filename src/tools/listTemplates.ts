import { z } from 'zod';
import { apiClient } from '../api/client';
import { getErrorMessage } from '../errors/messages';

export const listTemplatesSchema = z.object({
  query: z.string().optional().describe('Search by name/description'),
  category: z.string().optional().describe('Filter by category'),
  tags: z.array(z.string()).optional().describe('Filter by tags'),
});

export async function listTemplates(args: {
  query?: string;
  category?: string;
  tags?: string[];
}) {
  try {
    let templates = await apiClient.listTemplates();

    // Client-side filtering (server-side not available in v1)
    if (args.query) {
      const q = args.query.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    if (args.category) {
      templates = templates.filter((t) => t.category === args.category);
    }

    if (args.tags && args.tags.length > 0) {
      templates = templates.filter((t) =>
        t.tags?.some((tag) => args.tags!.includes(tag))
      );
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(templates, null, 2),
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
