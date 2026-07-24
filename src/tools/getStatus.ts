import { z } from 'zod';
import { apiClient } from '../api/client';
import { getErrorMessage } from '../errors/messages';

export const getStatusSchema = z.object({
  job_id: z.string().describe('Job ID to check'),
});

export async function getStatus(args: { job_id: string }) {
  try {
    const result = await apiClient.getStatus(args.job_id);

    let message = `Status: ${result.status}`;
    if (result.status === 'completed') {
      message += `. Download URL: ${result.download_url}`;
    } else if (result.status === 'failed') {
      message += `. Error: ${result.error || 'Unknown error'}`;
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              job_id: result.job_id,
              status: result.status,
              message,
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
