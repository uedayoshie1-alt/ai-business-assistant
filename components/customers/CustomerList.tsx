'use client'

import { useState } from 'react'
import { Search, UserPlus, Mail, Phone } from 'lucide-react'

type CourseStatus = 'applied' | 'attending' | 'completed' | 'cancelled'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  course: string
  appliedAt: string
  status: CourseStatus
}

const statusConfig: Record<CourseStatus, { label: string; className: string }> = {
  applied:   { label: '申込済み', className: 'bg-blue-50 text-blue-700' },
  attending: { label: '受講中',   className: 'bg-green-50 text-green-700' },
  completed: { label: '修了',     className: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'キャンセル', className: 'bg-red-50 text-red-500' },
}

const sampleCustomers: Customer[] = [
  { id: '1', name: '田中 花子', email: 'tanaka@example.com', phone: '090-1234-5678', course: 'ChatGPT入門講座', appliedAt: '2024-03-01', status: 'attending' },
  { id: '2', name: '佐藤 次郎', email: 'sato@example.com', phone: '080-2345-6789', course: '生成AI実践講座', appliedAt: '2024-03-05', status: 'applied' },
  { id: '3', name: '鈴木 美咲', email: 'suzuki@example.com', phone: '070-3456-7890', course: 'ChatGPT入門講座', appliedAt: '2024-02-20', status: 'completed' },
  { id: '4', name: '高橋 健一', email: 'takahashi@example.com', phone: '090-4567-8901', course: 'AI活用ビジネス講座', appliedAt: '2024-03-10', status: 'applied' },
  { id: '5', name: '伊藤 由美', email: 'ito@example.com', phone: '080-5678-9012', course: '生成AI実践講座', appliedAt: '2024-02-15', status: 'completed' },
  { id: '6', name: '渡辺 拓也', email: 'watanabe@example.com', phone: '070-6789-0123', course: 'ChatGPT入門講座', appliedAt: '2024-03-08', status: 'attending' },
  { id: '7', name: '山本 さくら', email: 'yamamoto@example.com', phone: '090-7890-1234', course: 'AI活用ビジネス講座', appliedAt: '2024-03-12', status: 'applied' },
  { id: '8', name: '中村 浩二', email: 'nakamura@example.com', phone: '080-8901-2345', course: 'ChatGPT入門講座', appliedAt: '2024-01-30', status: 'cancelled' },
]

const courseOptions = ['すべて', 'ChatGPT入門講座', '生成AI実践講座', 'AI活用ビジネス講座']
const statusOptions: { value: CourseStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'applied', label: '申込済み' },
  { value: 'attending', label: '受講中' },
  { value: 'completed', label: '修了' },
  { value: 'cancelled', label: 'キャンセル' },
]

export function CustomerList() {
  const [customers, setCustomers] = useState(sampleCustomers)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('すべて')
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all')

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.course.includes(search)
    const matchCourse = courseFilter === 'すべて' || c.course === courseFilter
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchCourse && matchStatus
  })

  return (
    <div className="max-w-5xl">
      {/* 検索・フィルター */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="名前・メール・講座名で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-600"
          >
            {courseOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 flex-wrap">
            {statusOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 件数 */}
      <p className="text-xs text-gray-400 mb-3">{filtered.length}件の顧客</p>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">氏名</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">連絡先</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">講座名</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">申込日</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">ステータス</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                  該当する顧客がいません
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const status = statusConfig[c.status]
                return (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{c.name}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Mail size={11} />
                          {c.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <Phone size={11} />
                          {c.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{c.course}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{c.appliedAt}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
