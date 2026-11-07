import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '売上分析ダッシュボード | COSMO STYLE',
  description: 'ShopifyのCSVから月次売上レポートを自動生成します',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
