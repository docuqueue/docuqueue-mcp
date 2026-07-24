import { z } from 'zod';
import { apiClient } from '../api/client';
import { getErrorMessage } from '../errors/messages';

export const downloadPdfSchema = z.object({
  job_id: z.string().describe('Job ID to download'),
});

export async function downloadPdf(args: { job_id: string }) {
  try {
    const result = await apiClient.downloadPdf(args.job_id);

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              job_id: args.job_id,
              download_url: result.download_url,
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
