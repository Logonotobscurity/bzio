import React from 'react';

interface RfqSubmissionEmailProps {
  fullName: string;
  quoteReference: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const RfqSubmissionEmail: React.FC<RfqSubmissionEmailProps> = ({
  fullName,
  quoteReference,
  items,
}) => {
  const itemsList = items
    .map((item) => `${item.name}: ${item.quantity}`)
    .join('\n');

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h1>Thank you for your Request for Quote!</h1>
        <p>Hello ${fullName},</p>
        <p>We have successfully received your Request for Quote. Our team will review your request and get back to you with a detailed quotation shortly.</p>
        <p><strong>Your Quote Reference number is: ${quoteReference}</strong></p>
        <h2>Request Summary</h2>
        <pre>${itemsList}</pre>
        <p>You can view the status of your quote and manage your account by visiting our website: <a href="${BASE_URL}">${BASE_URL}</a></p>
        <p>Best regards,<br/>BZION | Your Trusted Partner in FMCG Distribution</p>
      </body>
    </html>
  `;

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default RfqSubmissionEmail;