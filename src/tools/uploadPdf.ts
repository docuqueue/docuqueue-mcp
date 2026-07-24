import { z } from 'zod';
import { apiClient } from '../api/client';
import { getErrorMessage } from '../errors/messages';

export const uploadPdfSchema = z.object({
  file: z.string().describe('Base64-encoded PDF file'),
  slug: z.string().optional().describe('Custom URL slug'),
});

export async function uploadPdf(args: { file: string; slug?: string }) {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(args.file, 'base64');

    // Create form data
    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: 'application/pdf' }), 'document.pdf');
    if (args.slug) {
      formData.append('slug', args.slug);
    }

    const response = await fetch(`${apiClient['baseUrl']}/shared`, {
      method: 'POST',
      headers: {
        'api-key': apiClient['apiKey'],
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload error ${response.status}: ${error}`);
    }

    const result = await response.json();

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
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
