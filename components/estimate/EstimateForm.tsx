'use client'

import { useState } from 'react'
import { FormField, Input, Textarea } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Plus, Trash2, Lock } from 'lucide-react'
import type { EstimateFormData, EstimateItem } from '@/lib/types'

const initialItem = (): EstimateItem => ({
  id: Math.random().toString(36).slice(2),
  name: '',
  quantity: 1,
  unitPrice: 0,
  note: '',
})

export function EstimateForm() {
  const [data, setData] = useState<EstimateFormData>({
    clientName: '',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    items: [initialItem()],
    taxRate: 10,
    notes: '',
  })

  const addItem = () => setData({ ...data, items: [...data.items, initialItem()] })

  const removeItem = (id: string) =>
    setData({ ...data, items: data.items.filter((item) => item.id !== id) })

  const updateItem = (id: string, key: keyof EstimateItem, value: string | number) =>
    setData({
      ...data,
      items: data.items.map((item) => item.id === id ? { ...item, [key]: value } : item),
    })

  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const tax = Math.floor(subtotal * (data.taxRate / 100))
  const total = subtotal + tax

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 近日実装バナー */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
          <Lock size={15} className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">次フェーズで実装予定</p>
          <p className="text-xs text-amber-600 mt-0.5">現在はUIのプレビューです。PDF出力・保存機能は次バージョンで実装します。</p>
        </div>
      </div>

      {/* ヘッダー情報 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-700 border-b border-gray-50 pb-3">基本情報</p>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="顧客名" required>
            <Input
              placeholder="例：田中商事 御中"
              value={data.clientName}
              onChange={(e) => setData({ ...data, clientName: e.target.value })}
            />
          </FormField>
          <FormField label="発行日">
            <Input
              type="date"
              value={data.issueDate}
              onChange={(e) => setData({ ...data, issueDate: e.target.value })}
            />
          </FormField>
          <FormField label="有効期限">
            <Input
              type="date"
              value={data.validUntil}
              onChange={(e) => setData({ ...data, validUntil: e.target.value })}
            />
          </FormField>
        </div>
      </div>

      {/* 明細 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 border-b border-gray-50 pb-3 mb-4">明細</p>

        <div className="space-y-3">
          {/* ヘッダー行 */}
          <div className="grid grid-cols-12 gap-2 px-2">
            {['品目・サービス名', '数量', '単価（円）', '金額（円）', ''].map((h, i) => (
              <div
                key={h}
                className={`text-xs font-medium text-gray-400 ${
                  i === 0 ? 'col-span-5' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-2' : i === 3 ? 'col-span-2' : 'col-span-1'
                }`}
              >
                {h}
              </div>
            ))}
          </div>

          {data.items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <Input
                  placeholder="例：コンサルティング費用"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                />
              </div>
              <div className="col-span-2">
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 text-right">
                  ¥{(item.quantity * item.unitPrice).toLocaleString()}
                </div>
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={<Plus size={14} />}
          onClick={addItem}
          className="mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          行を追加
        </Button>

        {/* 合計 */}
        <div className="mt-5 border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>小計</span>
            <span>¥{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>消費税（{data.taxRate}%）</span>
            <span>¥{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>合計金額</span>
            <span className="text-blue-700">¥{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 備考 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <FormField label="備考">
          <Textarea
            placeholder="例：お支払いは納品後30日以内にお願いします。"
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            rows={3}
          />
        </FormField>
      </div>

      {/* 操作 */}
      <div className="flex items-center gap-3">
        <Button variant="primary" disabled className="opacity-50 cursor-not-allowed">
          PDF出力（次フェーズ）
        </Button>
        <Button variant="secondary" disabled className="opacity-50 cursor-not-allowed">
          保存（次フェーズ）
        </Button>
      </div>
    </div>
  )
}
