import type { CompanySettings, StyleType } from './types'

export const SETTINGS_KEY = 'company_settings'

export const defaultSettings: CompanySettings = {
  companyName: 'サンプル株式会社',
  description: '中小企業向けのシステム開発・ITコンサルティング会社です。',
  preferredStyle: 'standard',
  products: 'クラウド型業務管理システム「BizFlow」\n在庫管理ツール「StockMate」\nITコンサルティングサービス',
  prohibitedWords: '絶対、必ず、保証、最高、日本一',
  signature: '─────────────\n株式会社サンプル\n営業部 山田太郎\nTEL: 03-xxxx-xxxx\nMail: yamada@sample.co.jp\n─────────────',
}

export function loadSettings(): CompanySettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) }
  } catch {}
  return defaultSettings
}
