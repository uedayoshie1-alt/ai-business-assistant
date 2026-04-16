import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { sampleHistory } from '@/lib/sample-data'
import { formatDate, getDocTypeLabel, getDocTypeColor, getStatusLabel, getStatusColor } from '@/lib/utils'
import { Badge } from '@/components/ui/FormField'

export function RecentHistory() {
  const recent = sampleHistory.slice(0, 5)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">最近の作成履歴</h2>
        <Link href="/history" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
          すべて見る <ArrowRight size={12} />
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {recent.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors cursor-pointer group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getDocTypeColor(item.type)}>
                  {getDocTypeLabel(item.type)}
                </Badge>
                <Badge className={getStatusColor(item.status)}>
                  {getStatusLabel(item.status)}
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{item.preview}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-gray-400">{formatDate(item.createdAt).split(' ')[0].replace('年', '/').replace('月', '/').replace('日', '')}</p>
              <ArrowRight size={12} className="text-gray-200 group-hover:text-blue-400 ml-auto mt-1 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
