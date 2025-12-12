
export const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

export const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #e6e6e6',
  borderRadius: '8px',
};

export const logo = {
  margin: '0 auto',
};

export const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px',
  textAlign: 'center' as const,
  color: '#1d3557',
};

export const text = {
  color: '#457b9d',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  padding: '0 20px',
};

export const paragraph = {
  ...text,
  padding: '0 40px',
}

export const link = {
  ...text,
  color: '#f1faee',
  backgroundColor: '#1d3557',
  padding: '12px 20px',
  margin: '20px 40px',
  borderRadius: '4px',
  display: 'inline-block',
  textAlign: 'center' as const,
  textDecoration: 'none',
};

export const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '20px',
};

export const section = {
  padding: '0 40px',
  margin: '20px 0',
  borderTop: '1px solid #e6e6e6',
  borderBottom: '1px solid #e6e6e6',
  paddingTop: '20px',
  paddingBottom: '20px',
};
