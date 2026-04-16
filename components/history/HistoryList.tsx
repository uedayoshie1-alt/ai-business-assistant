'use client'

import { useState } from 'react'
import { Search, Filter, Trash2, Eye, Download } from 'lucide-react'
import { sampleHistory } from '@/lib/sample-data'
import { formatDate, getDocTypeLabel, getDocTypeColor, getStatusLabel, getStatusColor } from '@/lib/utils'
import { Badge } from '@/components/ui/FormField'
import type { DocumentType } from '@/lib/types'

const filterTypes: { value: DocumentType | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'email', label: '営業メール' },
  { value: 'minutes', label: '議事録' },
  { value: 'proposal', label: '提案文' },
  { value: 'estimate', label: '見積' },
  { value: 'reservation', label: '予約対応' },
]

export function HistoryList() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all')

  const filtered = sampleHistory.filter((item) => {
    const matchType = typeFilter === 'all' || item.type === typeFilter
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.preview.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <div className="max-w-4xl">
      {/* 検索・フィルター */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          {/* 検索 */}
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="タイトルや内容で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          {/* フィルター */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={13} className="text-gray-400" />
            {filterTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setTypeFilter(type.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 件数 */}
      <p className="text-xs text-gray-400 mb-3">{filtered.length}件の履歴</p>

      {/* リスト */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">該当する履歴がありません</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge className={getDocTypeColor(item.type)}>
                    {getDocTypeLabel(item.type)}
                  </Badge>
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-0.5 group-hover:text-blue-700 transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-gray-400 truncate">{item.preview}</p>
                <p className="text-xs text-gray-300 mt-1.5">{formatDate(item.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Eye size={14} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                  <Download size={14} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
