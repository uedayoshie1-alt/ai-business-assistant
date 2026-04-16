'use client'

import { useState } from 'react'
import { Search, UserPlus, Mail, Phone, Pencil, Trash2, X } from 'lucide-react'

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
  applied:   { label: '申込済み',   className: 'bg-blue-50 text-blue-700' },
  attending: { label: '受講中',     className: 'bg-green-50 text-green-700' },
  completed: { label: '修了',       className: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'キャンセル', className: 'bg-red-50 text-red-500' },
}

const courseOptions = ['ChatGPT入門講座', '生成AI実践講座', 'AI活用ビジネス講座']

const initialCustomers: Customer[] = [
  { id: '1', name: '田中 花子', email: 'tanaka@example.com', phone: '090-1234-5678', course: 'ChatGPT入門講座', appliedAt: '2024-03-01', status: 'attending' },
  { id: '2', name: '佐藤 次郎', email: 'sato@example.com', phone: '080-2345-6789', course: '生成AI実践講座', appliedAt: '2024-03-05', status: 'applied' },
  { id: '3', name: '鈴木 美咲', email: 'suzuki@example.com', phone: '070-3456-7890', course: 'ChatGPT入門講座', appliedAt: '2024-02-20', status: 'completed' },
  { id: '4', name: '高橋 健一', email: 'takahashi@example.com', phone: '090-4567-8901', course: 'AI活用ビジネス講座', appliedAt: '2024-03-10', status: 'applied' },
  { id: '5', name: '伊藤 由美', email: 'ito@example.com', phone: '080-5678-9012', course: '生成AI実践講座', appliedAt: '2024-02-15', status: 'completed' },
]

const emptyForm = (): Omit<Customer, 'id'> => ({
  name: '',
  email: '',
  phone: '',
  course: courseOptions[0],
  appliedAt: new Date().toISOString().slice(0, 10),
  status: 'applied',
})

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('すべて')
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.course.includes(search)
    const matchCourse = courseFilter === 'すべて' || c.course === courseFilter
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchCourse && matchStatus
  })

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  const openEdit = (c: Customer) => {
    setEditingId(c.id)
    setForm({ name: c.name, email: c.email, phone: c.phone, course: c.course, appliedAt: c.appliedAt, status: c.status })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingId) {
      setCustomers((prev) => prev.map((c) => c.id === editingId ? { ...form, id: editingId } : c))
    } else {
      setCustomers((prev) => [...prev, { ...form, id: Date.now().toString() }])
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

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
            <option value="すべて">すべての講座</option>
            {courseOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'applied', 'attending', 'completed', 'cancelled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {s === 'all' ? 'すべて' : statusConfig[s].label}
              </button>
            ))}
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shrink-0"
          >
            <UserPlus size={14} />
            顧客を追加
          </button>
        </div>
      </div>

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
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                  該当する顧客がいません
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const status = statusConfig[c.status]
                return (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{c.name}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Mail size={11} />{c.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <Phone size={11} />{c.phone}
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
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(c)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 追加・編集モーダル */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                {editingId ? '顧客情報を編集' : '顧客を追加'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">氏名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="例：田中 花子"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">メールアドレス</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="例：tanaka@example.com"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">電話番号</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    placeholder="例：090-0000-0000"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">講座名</label>
                <select
                  value={form.course}
                  onChange={update('course')}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-700"
                >
                  {courseOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">申込日</label>
                  <input
                    type="date"
                    value={form.appliedAt}
                    onChange={update('appliedAt')}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ステータス</label>
                  <select
                    value={form.status}
                    onChange={update('status')}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-700"
                  >
                    {(Object.entries(statusConfig) as [CourseStatus, { label: string }][]).map(([v, { label }]) => (
                      <option key={v} value={v}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim()}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {editingId ? '保存する' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
