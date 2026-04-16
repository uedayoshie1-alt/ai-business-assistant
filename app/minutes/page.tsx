'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { MinutesForm } from '@/components/minutes/MinutesForm'
import { MinutesOutput } from '@/components/minutes/MinutesOutput'
import { generateMinutes } from '@/lib/mock-generators'
import type { MinutesFormData, MinutesOutput as MinutesOutputType } from '@/lib/types'

const today = new Date().toISOString().split('T')[0]

const defaultFormData: MinutesFormData = {
  date: today,
  meetingName: '',
  participants: '',
  style: 'standard',
  rawText: '',
}

export default function MinutesPage() {
  const [formData, setFormData] = useState<MinutesFormData>(defaultFormData)
  const [output, setOutput] = useState<MinutesOutputType | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateMinutes(formData)
      setOutput(result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-6xl">
        {/* ページ説明 */}
        <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          <div className="w-1.5 h-10 bg-green-400 rounded-full shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900">会議メモを整理された議事録に自動変換します</p>
            <p className="text-xs text-green-600 mt-0.5">箇条書きや話し言葉のままでOK。決定事項・宿題・次回確認事項に整理されます</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
              <span className="w-6 h-6 rounded-md bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">1</span>
              <span className="text-sm font-semibold text-gray-800">情報とメモを入力する</span>
            </div>
            <MinutesForm
              data={formData}
              onChange={setFormData}
              onGenerate={handleGenerate}
              loading={loading}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
              <span className="w-6 h-6 rounded-md bg-green-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span className="text-sm font-semibold text-gray-800">生成結果を確認する</span>
            </div>
            <MinutesOutput output={output} loading={loading} onRegenerate={handleGenerate} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
