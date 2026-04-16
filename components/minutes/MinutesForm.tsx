'use client'

import { FormField, Input, Textarea, RadioGroup } from '@/components/ui/FormField'
import { GenerateButton } from '@/components/ui/GenerateButton'
import type { MinutesFormData } from '@/lib/types'
import { Mic } from 'lucide-react'

interface MinutesFormProps {
  data: MinutesFormData
  onChange: (data: MinutesFormData) => void
  onGenerate: () => void
  loading: boolean
}

const styleOptions = [
  { value: 'concise', label: '社内用・簡潔' },
  { value: 'standard', label: '標準' },
  { value: 'formal', label: '丁寧' },
]

export function MinutesForm({ data, onChange, onGenerate, loading }: MinutesFormProps) {
  const update = (key: keyof MinutesFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onChange({ ...data, [key]: e.target.value })

  return (
    <div className="space-y-5">
      {/* 基本情報 */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">会議情報</p>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="会議日" required>
            <Input
              type="date"
              value={data.date}
              onChange={update('date')}
            />
          </FormField>
          <FormField label="会議名" required>
            <Input
              placeholder="例：月次定例会議"
              value={data.meetingName}
              onChange={update('meetingName')}
            />
          </FormField>
        </div>
      </div>

      {/* 参加者 */}
      <FormField label="参加者" hint="カンマ区切りで入力できます">
        <Input
          placeholder="例：山田、鈴木、田中（外部）"
          value={data.participants}
          onChange={update('participants')}
        />
      </FormField>

      {/* 文体 */}
      <FormField label="出力スタイル">
        <RadioGroup
          name="style"
          options={styleOptions}
          value={data.style}
          onChange={(v) => onChange({ ...data, style: v as MinutesFormData['style'] })}
        />
      </FormField>

      {/* 音声アップロード */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">音声ファイル</p>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg w-full text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
        >
          <Mic size={14} />
          音声ファイルをアップロード（次フェーズ実装予定）
        </button>
      </div>

      {/* テキスト入力 */}
      <FormField
        label="会議メモ・議事内容"
        required
        hint="箇条書きでも、話し言葉のままでも大丈夫です。AIが整理します。"
      >
        <Textarea
          placeholder={`例：
・新サービスの提供開始は来月末に決定
・山田さんが今週中にリソース確認
・次回は2週間後の予定
・田中さんから予算の懸念点が出た`}
          value={data.rawText}
          onChange={update('rawText')}
          rows={8}
        />
      </FormField>

      <GenerateButton onClick={onGenerate} loading={loading} label="議事録を作成する" />
    </div>
  )
}
