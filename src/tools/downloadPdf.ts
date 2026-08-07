import { z } from 'zod';
import { configManager } from '../config';
import { getErrorMessage } from '../errors/messages';

export const downloadPdfSchema = z.object({
  job_id: z.string().describe('Job ID to download'),
});

export async function downloadPdf(args: { job_id: string }) {
  try {
    const url = `${configManager.getApiUrl()}/download/${args.job_id}`;
    const apiKey = configManager.getApiKey();
    
    const response = await fetch(url, {
      headers: { 'api-key': apiKey }
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/pdf')) {
      // PDF returned directly - provide download URL
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                job_id: args.job_id,
                download_url: url,
                content_type: 'application/pdf',
                message: 'PDF ready for download. Use the download_url to get the file.',
              },
              null,
              2
            ),
          },
        ],
      };
    }
    
    // JSON response (error or other)
    const result = await response.json();
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              job_id: args.job_id,
              download_url: result.download_url || url,
              message: 'PDF ready for download.',
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
