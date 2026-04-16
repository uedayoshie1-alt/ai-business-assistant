'use client'

import { OutputActions } from '@/components/ui/OutputActions'
import { AlertCircle, Sparkles } from 'lucide-react'
import type { EmailOutput as EmailOutputType } from '@/lib/types'

interface EmailOutputProps {
  output: EmailOutputType | null
  loading: boolean
  onRegenerate: () => void
}

export function EmailOutput({ output, loading, onRegenerate }: EmailOutputProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">AIが作成中です…</p>
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
          <p className="text-xs text-gray-400 mt-1">左のフォームを入力して「AIで作成する」を押してください</p>
        </div>
      </div>
    )
  }

  const allText = `件名：${output.subjectLine}\n\n${output.body}`

  return (
    <div className="space-y-5">
      {/* アクション */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center">
            <Sparkles size={12} className="text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-800">生成結果</span>
        </div>
        <OutputActions
          onCopy={() => allText}
          onSave={() => console.log('保存:', output)}
          onRegenerate={onRegenerate}
        />
      </div>

      {/* 件名 */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wide">件名案</p>
        <p className="text-sm font-medium text-gray-800">{output.subjectLine}</p>
      </div>

      {/* 本文 */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">本文</p>
        <pre className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
          {output.body}
        </pre>
      </div>

      {/* 改善候補 */}
      <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertCircle size={13} className="text-amber-600" />
          <p className="text-xs font-semibold text-amber-700">改善のヒント</p>
        </div>
        <ul className="space-y-1.5">
          {output.suggestions.map((suggestion, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-amber-800">
              <span className="text-amber-400 mt-0.5 shrink-0">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* 次のアクション */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 mb-2">次のステップ</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'メールソフトで開く', note: '（Gmailなど）' },
            { label: 'Word形式でダウンロード', note: '（次フェーズ）' },
          ].map((action) => (
            <div key={action.label} className="flex items-center gap-1 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              {action.label}
              <span className="text-gray-300">{action.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
