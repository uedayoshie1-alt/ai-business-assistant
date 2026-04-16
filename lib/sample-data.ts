import type { HistoryItem } from './types'

export const sampleHistory: HistoryItem[] = [
  {
    id: '1',
    type: 'email',
    title: '株式会社サンプル商事 様への新規営業メール',
    preview: 'お世話になっております。この度は弊社サービスについてご案内させていただきたく...',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'saved',
  },
  {
    id: '2',
    type: 'minutes',
    title: '2024年1月 月次定例会議 議事録',
    preview: '新サービス提供開始時期を来月末に設定。担当チームのリソース調整を今週中に...',
    createdAt: '2024-01-14T15:00:00Z',
    status: 'approved',
  },
  {
    id: '3',
    type: 'proposal',
    title: '田中工業様向け 業務効率化ソリューション ご提案',
    preview: '田中工業様の「現場管理の効率化」に対し、弊社のシステムを通じて...',
    createdAt: '2024-01-12T09:00:00Z',
    status: 'draft',
  },
  {
    id: '4',
    type: 'email',
    title: '佐藤電気工業 様へのフォローメール',
    preview: '先日はご多用の中ありがとうございました。その後いかがでしょうか...',
    createdAt: '2024-01-11T14:00:00Z',
    status: 'saved',
  },
  {
    id: '5',
    type: 'proposal',
    title: '山本食品様向け DX推進 ご提案',
    preview: '山本食品様の「受注管理の効率化」に対し、弊社のDXソリューションを...',
    createdAt: '2024-01-10T11:30:00Z',
    status: 'approved',
  },
  {
    id: '6',
    type: 'minutes',
    title: 'キックオフミーティング 議事録',
    preview: '新プロジェクトの方向性について確認。マイルストーンを3月末に設定...',
    createdAt: '2024-01-08T10:00:00Z',
    status: 'saved',
  },
]

export const sampleStats = {
  drafts: 3,
  pendingApproval: 2,
  savedThisMonth: 12,
  totalGenerated: 47,
}

export const quickActionItems = [
  {
    id: 'email',
    label: '営業メールを作成',
    description: '新規・フォロー・お礼など',
    href: '/email',
    icon: 'Mail',
    color: 'blue',
  },
  {
    id: 'minutes',
    label: '議事録を作成',
    description: '会議メモを整理・フォーマット',
    href: '/minutes',
    icon: 'FileText',
    color: 'green',
  },
  {
    id: 'proposal',
    label: '提案文を作成',
    description: '提案書のたたき台を作成',
    href: '/proposal',
    icon: 'Lightbulb',
    color: 'purple',
  },
]

export const templateItems = [
  { id: 't1', name: '新規営業メール（標準）', type: 'email' as const, usageCount: 24 },
  { id: 't2', name: '月次定例会議 議事録', type: 'minutes' as const, usageCount: 18 },
  { id: 't3', name: 'サービス提案文（中小企業向け）', type: 'proposal' as const, usageCount: 11 },
  { id: 't4', name: 'お礼メール（商談後）', type: 'email' as const, usageCount: 9 },
  { id: 't5', name: 'フォローアップメール', type: 'email' as const, usageCount: 7 },
]
