'use client'

import { FormField, Input, Textarea, RadioGroup } from '@/components/ui/FormField'
import { GenerateButton } from '@/components/ui/GenerateButton'
import type { ProposalFormData } from '@/lib/types'

interface ProposalFormProps {
  data: ProposalFormData
  onChange: (data: ProposalFormData) => void
  onGenerate: () => void
  loading: boolean
}

const styleOptions = [
  { value: 'concise', label: '簡潔' },
  { value: 'standard', label: '標準' },
  { value: 'formal', label: '丁寧・フォーマル' },
]

export function ProposalForm({ data, onChange, onGenerate, loading }: ProposalFormProps) {
  const update = (key: keyof ProposalFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onChange({ ...data, [key]: e.target.value })

  return (
    <div className="space-y-5">
      {/* 基本情報 */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">提案先・概要</p>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="提案先" required>
            <Input
              placeholder="例：山田製作所 様"
              value={data.targetCompany}
              onChange={update('targetCompany')}
            />
          </FormField>
          <FormField label="提案内容の概要" required>
            <Input
              placeholder="例：在庫管理システムの導入"
              value={data.proposalContent}
              onChange={update('proposalContent')}
            />
          </FormField>
        </div>
      </div>

      {/* 課題・期待効果 */}
      <div className="grid grid-cols-1 gap-3">
        <FormField
          label="先方の課題・困っていること"
          required
          hint="具体的に書くほど、より的確な提案文になります"
        >
          <Textarea
            placeholder="例：在庫の過不足が頻発し、余剰在庫のコストと欠品による機会損失が発生している"
            value={data.challenge}
            onChange={update('challenge')}
            rows={2}
          />
        </FormField>

        <FormField label="期待される効果・ゴール">
          <Textarea
            placeholder="例：在庫回転率の改善、担当者の工数削減、欠品率ゼロを目指す"
            value={data.expectedEffect}
            onChange={update('expectedEffect')}
            rows={2}
          />
        </FormField>
      </div>

      {/* 提案の方向性 */}
      <FormField label="提案の方向性・アピールポイント">
        <Input
          placeholder="例：低コスト・短期導入・既存システムとの連携"
          value={data.direction}
          onChange={update('direction')}
        />
      </FormField>

      {/* 文体 */}
      <FormField label="文体">
        <RadioGroup
          name="proposalStyle"
          options={styleOptions}
          value={data.style}
          onChange={(v) => onChange({ ...data, style: v as ProposalFormData['style'] })}
        />
      </FormField>

      {/* 参考メモ */}
      <FormField
        label="参考メモ・補足情報"
        hint="担当者の情報、競合との差別化ポイント、過去の会話など自由に記入"
      >
        <Textarea
          placeholder="例：先月の商談で予算感は200万円以内とのこと。競合はA社と比較中。"
          value={data.notes}
          onChange={update('notes')}
          rows={3}
        />
      </FormField>

      <GenerateButton onClick={onGenerate} loading={loading} label="提案文を作成する" />
    </div>
  )
}
