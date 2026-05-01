import type { User } from '@supabase/supabase-js'

export const DEFAULT_COMPANY_ID = '00000000-0000-0000-0000-000000000001'
export const DEFAULT_COMPANY_SLUG = 'tasuku-sr'
export const TENANT_CACHE_KEY = 'tasuku_current_company_id'

export const DEFAULT_ENABLED_FEATURES = [
  'dashboard',
  'chat',
  'receipt',
  'law-alerts',
  'subsidy',
  'clients',
  'gas',
  'email',
  'minutes',
  'invoice',
  'customers',
  'estimate',
  'reservation',
  'history',
  'settings',
  'admin',
] as const

export type TenantRole = 'admin' | 'staff'

export type CompanyTenant = {
  companyId: string
  slug: string
  name: string
  productName: string
  industryLabel: string
  aiAssistantName: string
  aiAssistantDescription: string
  suggestedQuestions: string[]
  enabledFeatures: string[]
  role: TenantRole
}

export const DEFAULT_SUGGESTIONS = [
  'キャリアアップ助成金の申請要件を教えてください',
  '育児休業給付金の計算方法は？',
  '2026年の社会保険適用拡大について説明して',
  '就業規則の変更手続きを教えてください',
  '時間外労働の割増賃金の計算方法は？',
]

export const DEFAULT_TENANT: CompanyTenant = {
  companyId: DEFAULT_COMPANY_ID,
  slug: DEFAULT_COMPANY_SLUG,
  name: 'TASUKU AI 社労士版',
  productName: 'TASUKU AI',
  industryLabel: '社労士 AI アシスタント',
  aiAssistantName: '社労士AIアシスタント',
  aiAssistantDescription: '労働法・社会保険・助成金について質問できます',
  suggestedQuestions: DEFAULT_SUGGESTIONS,
  enabledFeatures: [...DEFAULT_ENABLED_FEATURES],
  role: 'staff',
}

type MetadataUser = Pick<User, 'app_metadata' | 'user_metadata'> | null | undefined

export function normalizeTenantRole(value: unknown): TenantRole {
  return value === 'admin' ? 'admin' : 'staff'
}

export function metadataRole(user: MetadataUser): TenantRole {
  return normalizeTenantRole(user?.app_metadata?.role ?? user?.user_metadata?.role)
}

export function metadataCompanyId(user: MetadataUser): string | null {
  const raw =
    user?.app_metadata?.company_id ??
    user?.app_metadata?.companyId ??
    user?.user_metadata?.company_id ??
    user?.user_metadata?.companyId

  return typeof raw === 'string' && raw.trim() ? raw : null
}

export function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback
  const items = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  return items.length > 0 ? items : fallback
}

export function mergeTenant(base: Partial<CompanyTenant>): CompanyTenant {
  return {
    ...DEFAULT_TENANT,
    ...base,
    suggestedQuestions: normalizeStringArray(base.suggestedQuestions, DEFAULT_TENANT.suggestedQuestions),
    enabledFeatures: normalizeStringArray(base.enabledFeatures, DEFAULT_TENANT.enabledFeatures),
    role: normalizeTenantRole(base.role),
  }
}
