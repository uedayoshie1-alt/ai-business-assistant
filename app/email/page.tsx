'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { EmailForm } from '@/components/email/EmailForm'
import { EmailOutput } from '@/components/email/EmailOutput'
import { EmailTemplates } from '@/components/email/EmailTemplates'
import { GmailAutoReply } from '@/components/email/GmailAutoReply'
import { generateEmail } from '@/lib/mock-generators'
import type { EmailFormData, EmailOutput as EmailOutputType } from '@/lib/types'

const defaultFormData: EmailFormData = {
  companyName: '',
  contactName: '',
  subject: '',
  purpose: 'new',
  tone: 'standard',
  notes: '',
  hasAttachment: false,
}

type Tab = 'compose' | 'templates' | 'gmail'

export default function EmailPage() {
  const [tab, setTab] = useState<Tab>('compose')
  const [formData, setFormData] = useState<EmailFormData>(defaultFormData)
  const [output, setOutput] = useState<EmailOutputType | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateEmail(formData)
      setOutput(result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-6xl">
        {/* タブ */}
        <div className="flex items-center gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('compose')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'compose'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            メール作成
          </button>
          <button
            onClick={() => setTab('templates')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'templates'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            テンプレ管理
          </button>
          <button
            onClick={() => setTab('gmail')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'gmail'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Gmail自動返信
          </button>
        </div>

        {tab === 'compose' ? (
          <>
            <div className="mb-5 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <div className="w-1.5 h-10 bg-blue-400 rounded-full shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">宛先と用件を入力するだけで、自然なメールが完成します</p>
                <p className="text-xs text-blue-600 mt-0.5">目的・温度感を選ぶことで、相手に合わせたトーンに自動調整されます</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
                  <span className="text-sm font-semibold text-gray-800">情報を入力する</span>
                </div>
                <EmailForm
                  data={formData}
                  onChange={setFormData}
                  onGenerate={handleGenerate}
                  loading={loading}
                />
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
                  <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                  <span className="text-sm font-semibold text-gray-800">生成結果を確認する</span>
                </div>
                <EmailOutput output={output} loading={loading} onRegenerate={handleGenerate} />
              </div>
            </div>
          </>
        ) : tab === 'templates' ? (
          <EmailTemplates />
        ) : (
          <GmailAutoReply />
        )}
      </div>
    </AppLayout>
  )
}
