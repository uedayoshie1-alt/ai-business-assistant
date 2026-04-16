'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { InstagramForm } from '@/components/instagram/InstagramForm'
import { InstagramOutput } from '@/components/instagram/InstagramOutput'
import { generateInstagram } from '@/lib/mock-generators'
import type { InstagramFormData, InstagramOutput as InstagramOutputType } from '@/lib/types'

const defaultFormData: InstagramFormData = {
  theme: '',
  purpose: 'awareness',
  tone: 'friendly',
  useEmoji: true,
  hashtagCount: 10,
  notes: '',
}

export default function InstagramPage() {
  const [formData, setFormData] = useState<InstagramFormData>(defaultFormData)
  const [output, setOutput] = useState<InstagramOutputType | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateInstagram(formData)
      setOutput(result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-6xl">
        {/* ページ説明 */}
        <div className="mb-5 flex items-center gap-3 bg-pink-50 border border-pink-100 rounded-xl px-4 py-3">
          <div className="w-1.5 h-10 bg-pink-400 rounded-full shrink-0" />
          <div>
            <p className="text-sm font-medium text-pink-900">テーマと目的を入力するだけで、Instagramの投稿文とハッシュタグが完成します</p>
            <p className="text-xs text-pink-500 mt-0.5">絵文字・トーン・ハッシュタグ数を選んで、あなたらしい投稿を作りましょう</p>
          </div>
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 入力フォーム */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
              <span className="w-6 h-6 rounded-md bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">1</span>
              <span className="text-sm font-semibold text-gray-800">情報を入力する</span>
            </div>
            <InstagramForm
              data={formData}
              onChange={setFormData}
              onGenerate={handleGenerate}
              loading={loading}
            />
          </div>

          {/* 出力エリア */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
              <span className="w-6 h-6 rounded-md bg-pink-500 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span className="text-sm font-semibold text-gray-800">生成結果を確認する</span>
            </div>
            <InstagramOutput output={output} loading={loading} onRegenerate={handleGenerate} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
