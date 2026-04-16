import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BizAssist AI - AI業務アシスタント',
  description: '中小企業向けAI業務代行パッケージ。営業メール・議事録・提案文の作成を効率化。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
