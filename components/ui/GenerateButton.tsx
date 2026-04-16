'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GenerateButtonProps {
  onClick: () => void
  loading?: boolean
  className?: string
  label?: string
}

export function GenerateButton({ onClick, loading, className, label = 'AIで作成する' }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'w-full flex items-center justify-center gap-2.5 py-3 px-5',
        'bg-gradient-to-r from-blue-600 to-blue-500 text-white',
        'rounded-xl font-semibold text-sm',
        'shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300',
        'hover:from-blue-700 hover:to-blue-600',
        'active:scale-[0.98] transition-all duration-150',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100',
        className
      )}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          生成中…
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  )
}
