'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProposalForm } from '@/components/proposal/ProposalForm'
import { ProposalOutput } from '@/components/proposal/ProposalOutput'
import { generateProposal } from '@/lib/mock-generators'
import type { ProposalFormData, ProposalOutput as ProposalOutputType } from '@/lib/types'

const defaultFormData: ProposalFormData = {
  targetCompany: '',
  proposalContent: '',
  challenge: '',
  expectedEffect: '',
  direction: '',
  style: 'standard',
  notes: '',
}

export default function ProposalPage() {
  const [formData, setFormData] = useState<ProposalFormData>(defaultFormData)
  const [output, setOutput] = useState<ProposalOutputType | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateProposal(formData)
      setOutput(result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-6xl">
        {/* ページ説明 */}
        <div className="mb-5 flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
          <div className="w-1.5 h-10 bg-purple-400 rounded-full shrink-0" />
          <div>
            <p className="text-sm font-medium text-purple-900">先方の課題と提案内容を入力するだけで、提案書のたたき台を作成します</p>
            <p className="text-xs text-purple-600 mt-0.5">タイトル・概要・課題・提案内容・効果・締め文の全セクションを一括生成</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
              <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">1</span>
              <span className="text-sm font-semibold text-gray-800">提案情報を入力する</span>
            </div>
            <ProposalForm
              data={formData}
              onChange={setFormData}
              onGenerate={handleGenerate}
              loading={loading}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 overflow-y-auto max-h-[calc(100vh-12rem)]">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
              <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span className="text-sm font-semibold text-gray-800">生成結果を確認する</span>
            </div>
            <ProposalOutput output={output} loading={loading} onRegenerate={handleGenerate} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
