import { Mail, FileText, Lightbulb, Zap, Camera } from 'lucide-react'
import { templateItems } from '@/lib/sample-data'
import type { DocumentType } from '@/lib/types'

const typeIcons: Record<DocumentType, React.ElementType> = {
  email: Mail,
  minutes: FileText,
  proposal: Lightbulb,
  estimate: Zap,
  reservation: Zap,
  instagram: Camera,
}

const typeColors: Record<DocumentType, string> = {
  email: 'text-blue-600 bg-blue-50',
  minutes: 'text-green-600 bg-green-50',
  proposal: 'text-purple-600 bg-purple-50',
  estimate: 'text-orange-600 bg-orange-50',
  reservation: 'text-pink-600 bg-pink-50',
  instagram: 'text-rose-600 bg-rose-50',
}

export function TemplateList() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">よく使うテンプレート</h2>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">管理する</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="divide-y divide-gray-50">
          {templateItems.map((template) => {
            const Icon = typeIcons[template.type] ?? Mail
            const color = typeColors[template.type] ?? typeColors.email

            return (
              <button
                key={template.id}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left group"
              >
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                    {template.name}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                  {template.usageCount}回使用
                </span>
              </button>
            )
          })}
        </div>
        <div className="px-5 py-3 border-t border-gray-50">
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            + 新しいテンプレートを追加
          </button>
        </div>
      </div>
    </div>
  )
}
