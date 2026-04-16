'use client'

import { useState } from 'react'
import { FormField, Input, Textarea } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Lock, CalendarCheck } from 'lucide-react'
import type { ReservationFormData } from '@/lib/types'

export function ReservationForm() {
  const [data, setData] = useState<ReservationFormData>({
    customerName: '',
    preferredDate: '',
    preferredTime: '',
    contact: '',
    purpose: '',
  })

  const update = (key: keyof ReservationFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setData({ ...data, [key]: e.target.value })

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* バナー */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
          <Lock size={15} className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">次フェーズで実装予定</p>
          <p className="text-xs text-amber-600 mt-0.5">返信文の自動生成・カレンダー連携は次バージョンで実装します。</p>
        </div>
      </div>

      {/* フォーム */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-700 border-b border-gray-50 pb-3">予約情報の入力</p>

        <FormField label="お客様名" required>
          <Input
            placeholder="例：山田 花子 様"
            value={data.customerName}
            onChange={update('customerName')}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="希望日" required>
            <Input
              type="date"
              value={data.preferredDate}
              onChange={update('preferredDate')}
            />
          </FormField>
          <FormField label="希望時間">
            <Input
              type="time"
              value={data.preferredTime}
              onChange={update('preferredTime')}
            />
          </FormField>
        </div>

        <FormField label="連絡先（メール / 電話）">
          <Input
            placeholder="例：yamada@example.com"
            value={data.contact}
            onChange={update('contact')}
          />
        </FormField>

        <FormField label="ご用件">
          <Textarea
            placeholder="例：初回相談のご予約。製品の導入について相談したい。"
            value={data.purpose}
            onChange={update('purpose')}
            rows={4}
          />
        </FormField>
      </div>

      {/* 返信文案プレビュー（プレースホルダー） */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarCheck size={16} className="text-blue-500" />
          <p className="text-sm font-semibold text-gray-700">返信文案プレビュー</p>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-auto">
            次フェーズ実装予定
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-5 text-center">
          <div className="space-y-2">
            <p className="text-sm text-gray-400">予約情報を入力すると、</p>
            <p className="text-sm font-medium text-gray-500">確認・変更・お断りの返信文を自動生成します</p>
            <p className="text-xs text-gray-400 mt-3">
              例）「{data.customerName || 'お名前'}様、ご予約ありがとうございます。{data.preferredDate || '○月○日'}{data.preferredTime || '○時'}にて承りました…」
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="primary" disabled className="opacity-50 cursor-not-allowed">
            返信文案を生成（次フェーズ）
          </Button>
          <Button variant="secondary" disabled className="opacity-50 cursor-not-allowed">
            カレンダーに登録（次フェーズ）
          </Button>
        </div>
      </div>
    </div>
  )
}
