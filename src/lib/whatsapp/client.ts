import axios, { AxiosInstance } from 'axios';

export class WAHAClient {
  private client: AxiosInstance;
  private sessionName: string;

  constructor() {
    const headers: Record<string, string> = {};
    if (process.env.WAHA_API_KEY) {
      headers['X-Api-Key'] = process.env.WAHA_API_KEY;
    }

    // Determine baseURL with proper fallback for Netlify build environment
    // During build, use Netlify's deployment URL if available
    // For local development, default to localhost
    let baseURL = process.env.WAHA_URL;
    
    if (!baseURL) {
      if (process.env.NETLIFY && process.env.URL) {
        // On Netlify deploy preview or production
        baseURL = `https://${process.env.URL}`;
      } else {
        // Local development default
        baseURL = 'http://localhost:3000';
      }
    }

    this.client = axios.create({
      baseURL,
      headers,
      timeout: 10000,
    });
    this.sessionName = process.env.WAHA_SESSION || 'default';
  }

  async sendText(to: string, text: string) {
    try {
      const response = await this.client.post('/api/sendText', {
        session: this.sessionName,
        chatId: this.formatPhone(to),
        text,
      });
      return response.data;
    } catch (error) {
      console.error('WAHA sendText error:', error);
      throw error;
    }
  }

  async sendImage(to: string, imageUrl: string, caption?: string) {
    try {
      const response = await this.client.post('/api/sendImage', {
        session: this.sessionName,
        chatId: this.formatPhone(to),
        file: { url: imageUrl },
        caption,
      });
      return response.data;
    } catch (error) {
      console.error('WAHA sendImage error:', error);
      throw error;
    }
  }

  async getSessionStatus() {
    try {
      const response = await this.client.get(`/api/sessions/${this.sessionName}`);
      return response.data;
    } catch (error) {
      console.error('WAHA getSessionStatus error:', error);
      throw error;
    }
  }

  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    return `${cleaned}@c.us`;
  }
}

export const wahaClient = new WAHAClient();
