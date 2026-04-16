'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, FileText } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  purpose: string
  body: string
}

const initialTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: '新規営業（標準）',
    purpose: '新規営業',
    body: `件名：【ご提案】〇〇のご案内

〇〇株式会社
〇〇様

はじめてご連絡いたします。
ハッピーステート株式会社の上田と申します。

この度は〇〇についてご案内したく、ご連絡いたしました。

ご多用のところ恐縮ではございますが、ご検討いただけますと幸いです。
ご不明な点がございましたら、お気軽にご連絡ください。

何卒よろしくお願い申し上げます。

上田 良江
ハッピーステート株式会社`,
  },
  {
    id: '2',
    name: 'お礼メール（商談後）',
    purpose: 'お礼',
    body: `件名：本日はありがとうございました

〇〇株式会社
〇〇様

本日はお忙しいところお時間をいただき、誠にありがとうございました。

〇〇についてご説明させていただきましたが、ご不明な点などございましたらいつでもご連絡ください。

引き続きよろしくお願いいたします。

上田 良江
ハッピーステート株式会社`,
  },
]

const emptyForm = (): Omit<EmailTemplate, 'id'> => ({
  name: '',
  purpose: '',
  body: '',
})

export function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [previewId, setPreviewId] = useState<string | null>(null)

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  const openEdit = (t: EmailTemplate) => {
    setEditingId(t.id)
    setForm({ name: t.name, purpose: t.purpose, body: t.body })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingId) {
      setTemplates((prev) => prev.map((t) => t.id === editingId ? { ...form, id: editingId } : t))
    } else {
      setTemplates((prev) => [...prev, { ...form, id: Date.now().toString() }])
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    if (previewId === id) setPreviewId(null)
  }

  const preview = templates.find((t) => t.id === previewId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* テンプレ一覧 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">{templates.length}件のテンプレート</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={13} />
            テンプレを追加
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {templates.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              テンプレートがありません
            </div>
          ) : (
            templates.map((t) => (
              <div
                key={t.id}
                onClick={() => setPreviewId(t.id)}
                className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors group ${
                  previewId === t.id ? 'bg-blue-50/60' : 'hover:bg-gray-50/50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={14} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                  {t.purpose && (
                    <p className="text-xs text-gray-400 mt-0.5">{t.purpose}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(t) }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id) }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* プレビュー */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        {preview ? (
          <>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-800">{preview.name}</p>
              <button
                onClick={() => openEdit(preview)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <Pencil size={12} />
                編集
              </button>
            </div>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
              {preview.body}
            </pre>
          </>
        ) : (
          <div className="h-full flex items-center justify-center py-20 text-sm text-gray-400">
            左のテンプレートをクリックするとプレビューが表示されます
          </div>
        )}
      </div>

      {/* 追加・編集モーダル */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                {editingId ? 'テンプレートを編集' : 'テンプレートを追加'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">テンプレート名 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="例：新規営業（標準）"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">用途メモ</label>
                  <input
                    type="text"
                    value={form.purpose}
                    onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
                    placeholder="例：新規営業、お礼"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">メール本文</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                  placeholder="メールのテンプレート本文を入力してください"
                  rows={12}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none font-mono"
                />
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
