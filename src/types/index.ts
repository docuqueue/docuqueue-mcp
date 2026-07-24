import { z } from 'zod';

// Template types
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  schema: z.record(z.unknown()).optional(),
  created_at: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type Template = z.infer<typeof TemplateSchema>;

// Fill request types
export const FillRequestSchema = z.object({
  data: z.record(z.unknown()),
  options: z.object({
    page_size: z.string().optional(),
    orientation: z.enum(['portrait', 'landscape']).optional(),
    margin: z.string().optional(),
  }).optional(),
});

export type FillRequest = z.infer<typeof FillRequestSchema>;

// Fill response types
export const FillResponseSchema = z.object({
  job_id: z.string(),
  status: z.string(),
  credits_used: z.number(),
  credits_remaining: z.number().optional(),
});

export type FillResponse = z.infer<typeof FillResponseSchema>;

// Status response types
export const StatusResponseSchema = z.object({
  job_id: z.string(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  error: z.string().optional(),
  download_url: z.string().optional(),
});

export type StatusResponse = z.infer<typeof StatusResponseSchema>;

// Branding types
export const BrandingSchema = z.object({
  website: z.string().optional(),
  company_name: z.string().optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  font: z.string().optional(),
  font_fallback: z.string().optional(),
  logo_url: z.string().optional(),
  saved_at: z.string().optional(),
});

export type Branding = z.infer<typeof BrandingSchema>;

// Config types
export const ConfigSchema = z.object({
  docuqueue_api_key: z.string(),
  docuqueue_api_url: z.string().default('https://docuqueue.com/api/v1'),
  default_tone: z.string().default('formal'),
  default_style: z.string().default('professional'),
  brand: BrandingSchema.optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
