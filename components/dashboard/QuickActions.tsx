import Link from 'next/link'
import { Mail, FileText, Lightbulb, Calculator, CalendarCheck, ArrowRight } from 'lucide-react'

const actions = [
  {
    href: '/email',
    label: '営業メール作成',
    description: '新規・フォロー・お礼メールをすぐに作成',
    icon: Mail,
    color: 'blue',
    available: true,
  },
  {
    href: '/minutes',
    label: '議事録作成',
    description: '会議メモを整理された議事録に変換',
    icon: FileText,
    color: 'green',
    available: true,
  },
  {
    href: '/proposal',
    label: '提案文作成',
    description: '提案書のたたき台を素早く生成',
    icon: Lightbulb,
    color: 'purple',
    available: true,
  },
  {
    href: '/estimate',
    label: '見積作成',
    description: '見積書の作成・管理',
    icon: Calculator,
    color: 'orange',
    available: false,
  },
  {
    href: '/reservation',
    label: '予約対応',
    description: '予約確認・返信文の自動生成',
    icon: CalendarCheck,
    color: 'pink',
    available: false,
  },
]

const colorMap: Record<string, { bg: string; iconBg: string; icon: string; hover: string }> = {
  blue: { bg: 'hover:border-blue-200 hover:bg-blue-50/50', iconBg: 'bg-blue-100', icon: 'text-blue-600', hover: 'group-hover:text-blue-600' },
  green: { bg: 'hover:border-green-200 hover:bg-green-50/50', iconBg: 'bg-green-100', icon: 'text-green-600', hover: 'group-hover:text-green-600' },
  purple: { bg: 'hover:border-purple-200 hover:bg-purple-50/50', iconBg: 'bg-purple-100', icon: 'text-purple-600', hover: 'group-hover:text-purple-600' },
  orange: { bg: 'hover:border-orange-200 hover:bg-orange-50/50', iconBg: 'bg-orange-100', icon: 'text-orange-600', hover: 'group-hover:text-orange-600' },
  pink: { bg: 'hover:border-pink-200 hover:bg-pink-50/50', iconBg: 'bg-pink-100', icon: 'text-pink-600', hover: 'group-hover:text-pink-600' },
}

export function QuickActions() {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-3">よく使う機能</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          const colors = colorMap[action.color]

          return (
            <Link
              key={action.href}
              href={action.href}
              className={`group relative bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 transition-all duration-150 ${action.available ? colors.bg + ' cursor-pointer' : 'opacity-60 cursor-default'}`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                  <Icon size={20} className={colors.icon} />
                </div>
                {!action.available && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                    近日公開
                  </span>
                )}
                {action.available && (
                  <ArrowRight size={14} className={`text-gray-300 mt-1 transition-all duration-150 ${colors.hover} group-hover:translate-x-0.5`} />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{action.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
