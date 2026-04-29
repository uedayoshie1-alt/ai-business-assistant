import { supabase } from './supabase'
import type { Receipt } from './mock-data'

// ============================================================
// 領収書
// ============================================================

export async function fetchReceipts(): Promise<Receipt[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id,
    date: r.date,
    amount: r.amount,
    vendor: r.vendor,
    purpose: r.purpose,
    accountCategory: r.account_category,
    accountCategorySuggestions: r.account_category_suggestions ?? [],
    reason: r.reason,
    taxRate: r.tax_rate as 8 | 10,
    status: r.status,
    sourceType: r.source_type,
    extractedAt: r.extracted_at,
  }))
}

export async function upsertReceipt(receipt: Receipt): Promise<void> {
  const { error } = await supabase.from('receipts').upsert({
    id: receipt.id,
    date: receipt.date,
    amount: receipt.amount,
    vendor: receipt.vendor,
    purpose: receipt.purpose,
    account_category: receipt.accountCategory,
    account_category_suggestions: receipt.accountCategorySuggestions,
    reason: receipt.reason,
    tax_rate: receipt.taxRate,
    status: receipt.status,
    source_type: receipt.sourceType,
    extracted_at: receipt.extractedAt,
  })
  if (error) throw error
}

export async function upsertReceipts(receipts: Receipt[]): Promise<void> {
  if (receipts.length === 0) return
  const { error } = await supabase.from('receipts').upsert(
    receipts.map(r => ({
      id: r.id,
      date: r.date,
      amount: r.amount,
      vendor: r.vendor,
      purpose: r.purpose,
      account_category: r.accountCategory,
      account_category_suggestions: r.accountCategorySuggestions,
      reason: r.reason,
      tax_rate: r.taxRate,
      status: r.status,
      source_type: r.sourceType,
      extracted_at: r.extractedAt,
    }))
  )
  if (error) throw error
}

export async function deleteReceiptById(id: string): Promise<void> {
  const { error } = await supabase.from('receipts').delete().eq('id', id)
  if (error) throw error
}

// ============================================================
// 法改正ステータス
// ============================================================

export async function fetchLawAlertStatuses(): Promise<Record<string, { status: string; confirmedBy?: string; confirmedAt?: string }>> {
  const { data, error } = await supabase.from('law_alert_statuses').select('*')
  if (error) return {}
  const map: Record<string, { status: string; confirmedBy?: string; confirmedAt?: string }> = {}
  for (const row of data ?? []) {
    map[row.id] = { status: row.status, confirmedBy: row.confirmed_by, confirmedAt: row.confirmed_at }
  }
  return map
}

export async function upsertLawAlertStatus(id: string, title: string, status: string, confirmedBy?: string): Promise<void> {
  const { error } = await supabase.from('law_alert_statuses').upsert({
    id,
    title,
    status,
    confirmed_by: confirmedBy ?? '',
    confirmed_at: ['confirmed', 'notified'].includes(status) ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}
