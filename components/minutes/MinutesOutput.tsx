'use client'

import { OutputActions } from '@/components/ui/OutputActions'
import { Sparkles, CheckSquare, ListTodo, Calendar } from 'lucide-react'
import type { MinutesOutput as MinutesOutputType } from '@/lib/types'

interface MinutesOutputProps {
  output: MinutesOutputType | null
  loading: boolean
  onRegenerate: () => void
}

export function MinutesOutput({ output, loading, onRegenerate }: MinutesOutputProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">議事録を整理中です…</p>
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
          <p className="text-xs text-gray-400 mt-1">会議情報とメモを入力して「AIで作成する」を押してください</p>
        </div>
      </div>
    )
  }

  const allText = [
    '【要約】', output.summary, '',
    '【決定事項】', ...output.decisions.map(d => `・${d}`), '',
    '【宿題・ToDo】', ...output.todos.map(t => `・${t.task}（担当：${t.assignee}、期限：${t.deadline}）`), '',
    '【次回確認事項】', ...output.nextItems.map(n => `・${n}`),
  ].join('\n')

  return (
    <div className="space-y-4">
      {/* アクション */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center">
            <Sparkles size={12} className="text-green-600" />
          </div>
          <span className="text-sm font-semibold text-gray-800">生成結果</span>
        </div>
        <OutputActions
          onCopy={() => allText}
          onSave={() => console.log('保存:', output)}
          onRegenerate={onRegenerate}
        />
      </div>

      {/* 要約 */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">要約</p>
        <p className="text-sm text-gray-700 leading-relaxed">{output.summary}</p>
      </div>

      {/* 決定事項 */}
      <div className="bg-green-50/60 border border-green-100 rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <CheckSquare size={14} className="text-green-600" />
          <p className="text-xs font-semibold text-green-700">決定事項</p>
        </div>
        <ul className="space-y-2">
          {output.decisions.map((decision, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="w-4 h-4 rounded-full bg-green-200 text-green-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {decision}
            </li>
          ))}
        </ul>
      </div>

      {/* 宿題・ToDo */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <ListTodo size={14} className="text-blue-600" />
          <p className="text-xs font-semibold text-blue-700">宿題 / ToDo</p>
        </div>
        <div className="space-y-2">
          {output.todos.map((todo, i) => (
            <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-2.5 border border-blue-100/50">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{todo.task}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">担当：<span className="text-gray-600 font-medium">{todo.assignee}</span></span>
                  <span className="text-xs text-gray-400">期限：<span className="text-blue-600 font-medium">{todo.deadline}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 次回確認事項 */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar size={14} className="text-gray-500" />
          <p className="text-xs font-semibold text-gray-500">次回確認事項</p>
        </div>
        <ul className="space-y-1.5">
          {output.nextItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-gray-300 shrink-0">→</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
