import { FileEdit, Clock, CheckCircle2, Zap } from 'lucide-react'
import { sampleStats } from '@/lib/sample-data'

export function StatusCards() {
  const cards = [
    {
      label: '下書き中',
      value: sampleStats.drafts,
      suffix: '件',
      icon: FileEdit,
      color: 'amber',
      description: '編集を再開できます',
    },
    {
      label: '承認待ち',
      value: sampleStats.pendingApproval,
      suffix: '件',
      icon: Clock,
      color: 'blue',
      description: '確認が必要です',
    },
    {
      label: '今月の保存数',
      value: sampleStats.savedThisMonth,
      suffix: '件',
      icon: CheckCircle2,
      color: 'green',
      description: '先月比 +3件',
    },
    {
      label: '累計作成数',
      value: sampleStats.totalGenerated,
      suffix: '件',
      icon: Zap,
      color: 'purple',
      description: 'AIで作成した文書',
    },
  ]

  const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-700' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-700' },
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const colors = colorMap[card.color]
        return (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
                <Icon size={18} className={colors.icon} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{card.value}</span>
              <span className="text-sm text-gray-500">{card.suffix}</span>
            </div>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{card.label}</p>
            <p className="text-xs text-gray-400 mt-1">{card.description}</p>
          </div>
        )
      })}
    </div>
  )
}
