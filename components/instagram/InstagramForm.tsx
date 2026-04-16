'use client'

import { FormField, Input, Textarea, RadioGroup } from '@/components/ui/FormField'
import { GenerateButton } from '@/components/ui/GenerateButton'
import type { InstagramFormData } from '@/lib/types'

interface InstagramFormProps {
  data: InstagramFormData
  onChange: (data: InstagramFormData) => void
  onGenerate: () => void
  loading: boolean
}

const purposeOptions = [
  { value: 'awareness',    label: '認知拡大' },
  { value: 'engagement',  label: '共感・反応' },
  { value: 'announcement', label: 'お知らせ' },
  { value: 'story',        label: 'ストーリー' },
]

const toneOptions = [
  { value: 'friendly',     label: 'フレンドリー' },
  { value: 'professional', label: 'プロフェッショナル' },
  { value: 'casual',       label: 'カジュアル' },
  { value: 'inspiring',    label: 'インスパイア' },
]

export function InstagramForm({ data, onChange, onGenerate, loading }: InstagramFormProps) {
  const update = (key: keyof InstagramFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => onChange({ ...data, [key]: e.target.value })

  return (
    <div className="space-y-5">
      {/* テーマ */}
      <FormField label="投稿のテーマ・内容" required>
        <Input
          placeholder="例：AI講座のご案内、北海道の日常、受講生の声"
          value={data.theme}
          onChange={update('theme')}
        />
      </FormField>

      {/* 目的 */}
      <FormField label="投稿の目的" required>
        <RadioGroup
          name="purpose"
          options={purposeOptions}
          value={data.purpose}
          onChange={(v) => onChange({ ...data, purpose: v as InstagramFormData['purpose'] })}
        />
      </FormField>

      {/* トーン */}
      <FormField label="トーン・雰囲気">
        <RadioGroup
          name="tone"
          options={toneOptions}
          value={data.tone}
          onChange={(v) => onChange({ ...data, tone: v as InstagramFormData['tone'] })}
        />
      </FormField>

      {/* 絵文字・ハッシュタグ数 */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="絵文字を使う">
          <div className="flex gap-2 mt-1">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => onChange({ ...data, useEmoji: val })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  data.useEmoji === val
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {val ? '使う' : '使わない'}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="ハッシュタグ数">
          <select
            value={data.hashtagCount}
            onChange={(e) => onChange({ ...data, hashtagCount: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 text-gray-700"
          >
            {[5, 8, 10, 15, 20, 30].map((n) => (
              <option key={n} value={n}>{n}個</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* 補足メモ */}
      <FormField label="補足メモ" hint="強調したいポイント、使いたいキーワードなど">
        <Textarea
          placeholder="例：先週開催した講座の様子を紹介したい。参加者の笑顔が印象的だった。"
          value={data.notes}
          onChange={update('notes')}
          rows={3}
        />
      </FormField>

      <GenerateButton onClick={onGenerate} loading={loading} label="投稿文を作成する" />
    </div>
  )
}
