import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'All According to Plan',
  description: 'Browser-based dystopian political strategy prototype',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
