import { wahaClient } from '@/lib/whatsapp/client';
import { formatQuoteMessage, formatCustomerConfirmation } from '@/lib/whatsapp/templates';
import type { QuoteNotification } from '@/lib/whatsapp/types';

export class WhatsAppService {
  async sendQuoteNotification(data: QuoteNotification): Promise<void> {
    const businessPhone = process.env.WHATSAPP_BUSINESS_NUMBER;
    
    if (!businessPhone) {
      console.warn('WHATSAPP_BUSINESS_NUMBER not configured');
      return;
    }

    const message = formatQuoteMessage(data);
    await wahaClient.sendText(businessPhone, message);
  }

  async sendCustomerConfirmation(
    customerPhone: string,
    customerName: string,
    quoteReference: string
  ): Promise<void> {
    const message = formatCustomerConfirmation(customerName, quoteReference);
    await wahaClient.sendText(customerPhone, message);
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await wahaClient.getSessionStatus();
      return response.status === 'WORKING';
    } catch {
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();
