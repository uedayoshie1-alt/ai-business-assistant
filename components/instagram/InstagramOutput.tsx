'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, Lightbulb, Hash } from 'lucide-react'
import type { InstagramOutput as InstagramOutputType } from '@/lib/types'

interface InstagramOutputProps {
  output: InstagramOutputType | null
  loading: boolean
  onRegenerate: () => void
}

export function InstagramOutput({ output, loading, onRegenerate }: InstagramOutputProps) {
  const [captionCopied, setCaptionCopied] = useState(false)
  const [hashtagCopied, setHashtagCopied] = useState(false)

  const copyCaption = () => {
    if (!output) return
    navigator.clipboard.writeText(output.caption)
    setCaptionCopied(true)
    setTimeout(() => setCaptionCopied(false), 2000)
  }

  const copyHashtags = () => {
    if (!output) return
    navigator.clipboard.writeText(output.hashtags.join(' '))
    setHashtagCopied(true)
    setTimeout(() => setHashtagCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
        <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-pink-400/30 border-t-pink-400 rounded-full animate-spin" />
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
          <p className="text-xs text-gray-400 mt-1">左のフォームを入力して「投稿文を作成する」を押してください</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 再生成 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-pink-100 flex items-center justify-center">
            <Sparkles size={12} className="text-pink-500" />
          </div>
          <span className="text-sm font-semibold text-gray-800">生成結果</span>
        </div>
        <button
          onClick={onRegenerate}
          className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          再生成
        </button>
      </div>

      {/* 投稿本文 */}
      <div className="bg-pink-50/40 border border-pink-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide">投稿本文</p>
          <button
            onClick={copyCaption}
            className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-700 transition-colors"
          >
            {captionCopied ? <Check size={12} /> : <Copy size={12} />}
            {captionCopied ? 'コピーしました' : 'コピー'}
          </button>
        </div>
        <pre className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
          {output.caption}
        </pre>
      </div>

      {/* ハッシュタグ */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Hash size={13} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ハッシュタグ</p>
          </div>
          <button
            onClick={copyHashtags}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {hashtagCopied ? <Check size={12} /> : <Copy size={12} />}
            {hashtagCopied ? 'コピーしました' : 'コピー'}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {output.hashtags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 投稿のコツ */}
      <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Lightbulb size={13} className="text-amber-500" />
          <p className="text-xs font-semibold text-amber-700">投稿のコツ</p>
        </div>
        <ul className="space-y-1.5">
          {output.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-amber-800">
              <span className="text-amber-400 mt-0.5 shrink-0">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
