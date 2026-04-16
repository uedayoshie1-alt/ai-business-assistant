import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { DocumentType } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getDocTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    email: 'メール',
    minutes: '議事録',
    proposal: '提案文',
    estimate: '見積',
    reservation: '予約対応',
    instagram: 'Instagram',
  }
  return labels[type]
}

export function getStatusLabel(status: 'draft' | 'saved' | 'approved'): string {
  const labels = {
    draft: '下書き',
    saved: '保存済み',
    approved: '承認済み',
  }
  return labels[status]
}

export function getStatusColor(status: 'draft' | 'saved' | 'approved'): string {
  const colors = {
    draft: 'bg-amber-100 text-amber-700',
    saved: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
  }
  return colors[status]
}

export function getDocTypeColor(type: DocumentType): string {
  const colors: Record<DocumentType, string> = {
    email: 'bg-blue-100 text-blue-700',
    minutes: 'bg-green-100 text-green-700',
    proposal: 'bg-purple-100 text-purple-700',
    estimate: 'bg-orange-100 text-orange-700',
    reservation: 'bg-pink-100 text-pink-700',
    instagram: 'bg-rose-100 text-rose-700',
  }
  return colors[type]
}
