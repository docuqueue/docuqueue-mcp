import { z } from 'zod';
import { apiClient } from '../api/client';
import { getErrorMessage } from '../errors/messages';

export const previewTemplateSchema = z.object({
  template_id: z.string().describe('Template ID to preview'),
  data: z.record(z.unknown()).describe('Sample data for preview'),
  accept: z
    .enum(['text/html', 'application/pdf'])
    .default('text/html')
    .describe('Output format'),
});

export async function previewTemplate(args: {
  template_id: string;
  data: Record<string, unknown>;
  accept?: 'text/html' | 'application/pdf';
}) {
  try {
    const result = await apiClient.previewTemplate(
      args.template_id,
      args.data,
      args.accept
    );

    if (args.accept === 'application/pdf') {
      return {
        content: [
          {
            type: 'text' as const,
            text: '[PDF preview generated. Use download_pdf to get the file.]',
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: result as string,
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
