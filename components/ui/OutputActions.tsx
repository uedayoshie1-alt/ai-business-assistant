'use client'

import { Copy, Save, RefreshCw, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from './Button'

interface OutputActionsProps {
  onCopy: () => string
  onSave?: () => void
  onRegenerate?: () => void
  loading?: boolean
}

export function OutputActions({ onCopy, onSave, onRegenerate, loading }: OutputActionsProps) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleCopy = async () => {
    const text = onCopy()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    onSave?.()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="secondary"
        size="sm"
        icon={copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        onClick={handleCopy}
        className={copied ? 'border-green-300 text-green-700 bg-green-50' : ''}
      >
        {copied ? 'コピーしました' : 'コピー'}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={saved ? <Check className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />}
        onClick={handleSave}
        className={saved ? 'border-green-300 text-green-700 bg-green-50' : ''}
      >
        {saved ? '保存しました' : '保存'}
      </Button>

      {onRegenerate && (
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={onRegenerate}
          loading={loading}
        >
          再生成
        </Button>
      )}
    </div>
  )
}
