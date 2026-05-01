import type { CompanySettings } from './types'
import { DEFAULT_COMPANY_ID, TENANT_CACHE_KEY } from './tenant-config'

export const SETTINGS_KEY = 'company_settings'

function cachedCompanyId(): string {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_ID
  try {
    return localStorage.getItem(TENANT_CACHE_KEY) || DEFAULT_COMPANY_ID
  } catch {
    return DEFAULT_COMPANY_ID
  }
}

export function settingsStorageKey(companyId = cachedCompanyId()) {
  return `${SETTINGS_KEY}:${companyId}`
}

export const defaultSettings: CompanySettings = {
  companyName: 'サンプル株式会社',
  userName: '山田 太郎',
  description: '中小企業向けのシステム開発・ITコンサルティング会社です。',
  preferredStyle: 'standard',
  products: 'クラウド型業務管理システム「BizFlow」\n在庫管理ツール「StockMate」\nITコンサルティングサービス',
  prohibitedWords: '絶対、必ず、保証、最高、日本一',
  signature: '─────────────\n株式会社サンプル\n営業部 山田太郎\nTEL: 03-xxxx-xxxx\nMail: yamada@sample.co.jp\n─────────────',
}

export function loadSettings(companyId?: string): CompanySettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const stored = localStorage.getItem(settingsStorageKey(companyId))
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) }

    const legacyStored = localStorage.getItem(SETTINGS_KEY)
    if (legacyStored && cachedCompanyId() === DEFAULT_COMPANY_ID) {
      return { ...defaultSettings, ...JSON.parse(legacyStored) }
    }
  } catch {}
  return defaultSettings
}
