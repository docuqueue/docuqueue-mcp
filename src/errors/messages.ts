export const ErrorMessages = {
  // API errors
  API_UNAVAILABLE: 'DocuQueue API is temporarily unavailable. Try again in 5 minutes.',
  AUTH_FAILURE: 'Your DocuQueue API key seems invalid. Check your configuration.',
  RATE_LIMITED: "You've reached your plan limit. Upgrade or wait 1 hour.",
  
  // Template errors
  TEMPLATE_NOT_FOUND: (id: string) => `Template "${id}" not found.`,
  TEMPLATE_INVALID_SYNTAX: (line?: number) => 
    line ? `Template has invalid syntax at line ${line}. Check your template markup.` 
         : 'Template has invalid syntax. Check your template markup.',
  TEMPLATE_NAME_CONFLICT: (name: string) => 
    `A template named "${name}" already exists. Rename or overwrite?`,
  
  // Fill errors
  FILL_FAILED: 'Failed to generate PDF. Please try again.',
  JOB_FAILED: (jobId: string, error?: string) => 
    `Job ${jobId} failed${error ? `: ${error}` : ''}. Please try again.`,
  
  // Branding errors
  BRANDING_SCRAPE_FAILED: (website: string) => 
    `Couldn't extract branding from ${website}. Let's set it up manually.`,
  BRANDING_SPAX: (website: string) => 
    `The site ${website} requires JavaScript to render. Let's set up your branding manually.`,
  BRANDING_TIMEOUT: (website: string) => 
    `Taking too long to load ${website}. Let's try a different approach.`,
  
  // Data errors
  INCOMPLETE_DATA: (missing: string[]) => 
    `Missing required fields: ${missing.join(', ')}. What are these values?`,
  
  // Config errors
  CONFIG_NOT_FOUND: 'Config file not found. Create ~/.docuqueue/mcp-config.yaml with your API key.',
} as const;

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    
    if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
      return ErrorMessages.API_UNAVAILABLE;
    }
    
    if (message.includes('401') || message.includes('403')) {
      return ErrorMessages.AUTH_FAILURE;
    }
    
    if (message.includes('429')) {
      return ErrorMessages.RATE_LIMITED;
    }
    
    return message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}
