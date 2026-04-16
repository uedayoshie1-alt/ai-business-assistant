'use client'

import { OutputActions } from '@/components/ui/OutputActions'
import { Sparkles } from 'lucide-react'
import type { ProposalOutput as ProposalOutputType } from '@/lib/types'

interface ProposalOutputProps {
  output: ProposalOutputType | null
  loading: boolean
  onRegenerate: () => void
}

interface SectionProps {
  label: string
  content: string
  variant?: 'default' | 'primary' | 'success'
}

function Section({ label, content, variant = 'default' }: SectionProps) {
  const styles = {
    default: 'bg-white border-gray-100',
    primary: 'bg-purple-50/60 border-purple-100',
    success: 'bg-blue-50/60 border-blue-100',
  }
  const labelStyles = {
    default: 'text-gray-500',
    primary: 'text-purple-700',
    success: 'text-blue-700',
  }

  return (
    <div className={`rounded-xl border p-4 ${styles[variant]}`}>
      <p className={`text-xs font-semibold mb-2 uppercase tracking-wide ${labelStyles[variant]}`}>
        {label}
      </p>
      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{content}</p>
    </div>
  )
}

export function ProposalOutput({ output, loading, onRegenerate }: ProposalOutputProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">提案文を作成中です…</p>
          <p className="text-xs text-gray-400 mt-1">少々お待ちください</p>
        </div>
      </div>
    )
  }

  if (!output) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
          <Sparkles size={24} className="text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">まだ生成されていません</p>
          <p className="text-xs text-gray-400 mt-1">提案先と課題を入力して「AIで作成する」を押してください</p>
        </div>
      </div>
    )
  }

  const allText = [
    `【提案タイトル】\n${output.title}`,
    `\n【提案概要】\n${output.overview}`,
    `\n【課題整理】\n${output.challengeAnalysis}`,
    `\n【提案内容】\n${output.proposalDetail}`,
    `\n【想定効果】\n${output.expectedOutcome}`,
    `\n【締め文】\n${output.closing}`,
  ].join('\n')

  return (
    <div className="space-y-4">
      {/* アクション */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center">
            <Sparkles size={12} className="text-purple-600" />
          </div>
          <span className="text-sm font-semibold text-gray-800">生成結果</span>
        </div>
        <OutputActions
          onCopy={() => allText}
          onSave={() => console.log('保存:', output)}
          onRegenerate={onRegenerate}
        />
      </div>

      {/* タイトル */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4">
        <p className="text-xs font-semibold text-purple-100 mb-1 uppercase tracking-wide">提案タイトル案</p>
        <p className="text-base font-bold text-white leading-snug">{output.title}</p>
      </div>

      <Section label="提案概要" content={output.overview} variant="primary" />
      <Section label="課題整理" content={output.challengeAnalysis} />
      <Section label="提案内容" content={output.proposalDetail} variant="success" />
      <Section label="想定効果" content={output.expectedOutcome} />

      {/* 締め文 */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">締め文</p>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{output.closing}</p>
      </div>

      {/* 次のアクション */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">次のステップ</p>
        <div className="flex flex-wrap gap-2">
          {['Word形式でダウンロード（次フェーズ）', 'PDF出力（次フェーズ）', 'メールに貼り付けて送付'].map((action) => (
            <span key={action} className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              {action}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
