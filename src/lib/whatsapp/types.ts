export interface WhatsAppMessage {
  from: string;
  body: string;
  timestamp: number;
  hasMedia: boolean;
}

export interface SendMessageOptions {
  to: string;
  message: string;
  imageUrl?: string;
}

export interface QuoteNotification {
  customerName: string;
  customerPhone: string;
  quoteReference: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  totalItems: number;
}
