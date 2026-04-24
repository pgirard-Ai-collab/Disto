import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DISTO · Brand OS',
  description: 'Le portail brand intelligence de betula.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" style={{ height: '100%' }}>
      <body style={{ height: '100%', margin: 0 }}>{children}</body>
    </html>
  );
}
