import { configManager } from '../config.js';
import {
  Template,
  FillRequest,
  FillResponse,
  StatusResponse,
} from '../types/index';

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = configManager.getApiUrl();
    this.apiKey = configManager.getApiKey();
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'api-key': this.apiKey,
    };

    if (body && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    return response.json() as Promise<T>;
  }

  // Templates
  async listTemplates(): Promise<Template[]> {
    return this.request<Template[]>('GET', '/templates');
  }

  async getTemplate(id: string): Promise<Template> {
    return this.request<Template>('GET', `/templates/${id}`);
  }

  async createTemplate(data: {
    name: string;
    description?: string;
    html_content: string;
  }): Promise<Template> {
    return this.request<Template>('POST', '/templates', data);
  }

  async updateTemplate(
    id: string,
    data: { name?: string; description?: string; html_content?: string }
  ): Promise<Template> {
    return this.request<Template>('PUT', `/templates/${id}`, data);
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.request('DELETE', `/templates/${id}`);
  }

  // Fill
  async fillTemplate(
    templateId: string,
    data: FillRequest
  ): Promise<FillResponse> {
    return this.request<FillResponse>(
      'POST',
      `/templates/${templateId}/fill`,
      data
    );
  }

  // Status
  async getStatus(jobId: string): Promise<StatusResponse> {
    return this.request<StatusResponse>('GET', `/status/${jobId}`);
  }

  // Download
  async downloadPdf(jobId: string): Promise<{ download_url: string }> {
    return this.request('GET', `/download/${jobId}`);
  }

  // Preview
  async previewTemplate(
    templateId: string,
    data: Record<string, unknown>,
    accept: 'text/html' | 'application/pdf' = 'text/html'
  ): Promise<string | Buffer> {
    const url = `${this.baseUrl}/templates/${templateId}/preview`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': accept,
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Preview error ${response.status}: ${error}`);
    }

    if (accept === 'application/pdf') {
      return Buffer.from(await response.arrayBuffer());
    }

    return response.text();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; redis: string; queue_length: number }> {
    return this.request('GET', '/health');
  }
}

export const apiClient = new ApiClient();
