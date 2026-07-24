import { z } from 'zod';
import { configManager } from '../config.js';
import { getErrorMessage } from '../errors/messages';

export const uploadDocxTemplateSchema = z.object({
  file_path: z.string().describe('Path to the .docx file'),
  name: z.string().min(1).max(255).describe('Template name'),
  description: z.string().max(1000).optional().describe('Template description'),
});

export async function uploadDocxTemplate(args: {
  file_path: string;
  name: string;
  description?: string;
}) {
  try {
    const fs = await import('fs');
    const path = await import('path');

    const filePath = args.file_path;
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (!filePath.toLowerCase().endsWith('.docx')) {
      throw new Error('Only .docx files are accepted');
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const baseUrl = configManager.getApiUrl();
    const apiKey = configManager.getApiKey();

    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }), fileName);
    formData.append('name', args.name);
    if (args.description) {
      formData.append('description', args.description);
    }

    const response = await fetch(`${baseUrl}/templates/docx`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const template = await response.json();

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              message: 'DOCX template uploaded successfully',
              template,
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
