import { QuoteNotification } from './types';

export const formatQuoteMessage = (data: QuoteNotification): string => {
  const itemsList = data.items
    .map((item, i) => `${i + 1}. ${item.name} (Qty: ${item.quantity})`)
    .join('\n');

  return `
🛍️ *New Quote Request*

*Customer:* ${data.customerName}
*Phone:* ${data.customerPhone}
*Reference:* ${data.quoteReference}

*Items Requested:*
${itemsList}

*Total Items:* ${data.totalItems}

Please respond within 24 hours.
  `.trim();
};

export const formatCustomerConfirmation = (
  customerName: string,
  quoteReference: string
): string => {
  return `
Hello ${customerName}! 👋

Thank you for your quote request!

*Quote Reference:* ${quoteReference}

Our team will review your request and get back to you with a detailed quotation shortly.

Best regards,
BZION Team
  `.trim();
};
