'use client'

import { FormField, Input, Textarea, Select, RadioGroup } from '@/components/ui/FormField'
import { GenerateButton } from '@/components/ui/GenerateButton'
import type { EmailFormData } from '@/lib/types'
import { Paperclip } from 'lucide-react'

interface EmailFormProps {
  data: EmailFormData
  onChange: (data: EmailFormData) => void
  onGenerate: () => void
  loading: boolean
}

const purposeOptions = [
  { value: 'new', label: '新規営業' },
  { value: 'thanks', label: 'お礼' },
  { value: 'follow', label: 'フォロー' },
  { value: 'reproposal', label: '再提案' },
]

const toneOptions = [
  { value: 'soft', label: 'やわらかめ' },
  { value: 'standard', label: '標準' },
  { value: 'formal', label: '丁寧' },
  { value: 'strong', label: '強め提案' },
]

export function EmailForm({ data, onChange, onGenerate, loading }: EmailFormProps) {
  const update = (key: keyof EmailFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => onChange({ ...data, [key]: e.target.value })

  return (
    <div className="space-y-5">
      {/* 宛先情報 */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">宛先情報</p>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="宛先会社名" required>
            <Input
              placeholder="例：株式会社サンプル"
              value={data.companyName}
              onChange={update('companyName')}
            />
          </FormField>
          <FormField label="宛先担当者名" required>
            <Input
              placeholder="例：田中 様"
              value={data.contactName}
              onChange={update('contactName')}
            />
          </FormField>
        </div>
      </div>

      {/* 用件 */}
      <FormField label="用件・件名のキーワード">
        <Input
          placeholder="例：新サービスのご案内、コスト削減のご提案"
          value={data.subject}
          onChange={update('subject')}
        />
      </FormField>

      {/* 目的 */}
      <FormField label="メールの目的" required>
        <RadioGroup
          name="purpose"
          options={purposeOptions}
          value={data.purpose}
          onChange={(v) => onChange({ ...data, purpose: v as EmailFormData['purpose'] })}
        />
      </FormField>

      {/* 温度感 */}
      <FormField label="温度感・文体" hint="相手との関係性に合わせて選んでください">
        <RadioGroup
          name="tone"
          options={toneOptions}
          value={data.tone}
          onChange={(v) => onChange({ ...data, tone: v as EmailFormData['tone'] })}
        />
      </FormField>

      {/* 参考メモ */}
      <FormField label="参考メモ・補足" hint="商品の特徴、相手の課題感、強調したいポイントなど自由に書いてください">
        <Textarea
          placeholder="例：先月の展示会でお名刺をいただいた。製造業で在庫管理に課題があるとのことだった。"
          value={data.notes}
          onChange={update('notes')}
          rows={3}
        />
      </FormField>

      {/* 添付資料 */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">添付資料</p>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg w-full text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
        >
          <Paperclip size={14} />
          資料をアップロード（次フェーズ実装予定）
        </button>
      </div>

      <GenerateButton onClick={onGenerate} loading={loading} label="営業メールを作成する" />
    </div>
  )
}
