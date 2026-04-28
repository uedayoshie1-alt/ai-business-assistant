import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BizAssist AI - 社労士AIダッシュボード',
  description: '社労士事務所向けAI業務改善ダッシュボード。領収書AI仕分け・法改正アラート・助成金マッチングで提案力を強化。',
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
