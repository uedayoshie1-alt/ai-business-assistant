import { createClient, type User } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import {
  DEFAULT_COMPANY_ID,
  DEFAULT_COMPANY_SLUG,
  DEFAULT_TENANT,
  mergeTenant,
  metadataCompanyId,
  metadataRole,
  normalizeStringArray,
  normalizeTenantRole,
  type CompanyTenant,
} from './tenant-config'

type CompanyRow = {
  id: string
  slug: string | null
  name: string | null
  product_name: string | null
  industry_label: string | null
  enabled_features: unknown
}

type AiConfigRow = {
  assistant_name: string | null
  assistant_description: string | null
  system_prompt: string | null
  suggested_questions: unknown
}

type MembershipRow = {
  company_id: string
  role: string | null
}

export type TenantServerContext = {
  user: User
  tenant: CompanyTenant
  systemPrompt: string | null
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase service role is not configured')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function bearerToken(req: NextRequest): string | null {
  const value = req.headers.get('Authorization')
  if (!value?.startsWith('Bearer ')) return null
  const token = value.slice('Bearer '.length).trim()
  return token || null
}

async function fetchMembership(userId: string): Promise<MembershipRow | null> {
  const adminClient = getAdminClient()
  const { data, error } = await adminClient
    .from('company_memberships')
    .select('company_id, role')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data
}

async function fetchCompany(companyId: string): Promise<CompanyRow | null> {
  const adminClient = getAdminClient()
  const { data, error } = await adminClient
    .from('companies')
    .select('id, slug, name, product_name, industry_label, enabled_features')
    .eq('id', companyId)
    .maybeSingle()

  if (error) return null
  return data
}

async function fetchAiConfig(companyId: string): Promise<AiConfigRow | null> {
  const adminClient = getAdminClient()
  const { data, error } = await adminClient
    .from('company_ai_configs')
    .select('assistant_name, assistant_description, system_prompt, suggested_questions')
    .eq('company_id', companyId)
    .maybeSingle()

  if (error) return null
  return data
}

export async function resolveTenantFromRequest(req: NextRequest): Promise<TenantServerContext> {
  const token = bearerToken(req)
  if (!token) {
    throw new Error('Unauthorized')
  }

  const adminClient = getAdminClient()
  const { data: { user }, error } = await adminClient.auth.getUser(token)
  if (error || !user) {
    throw new Error('Unauthorized')
  }

  const membership = await fetchMembership(user.id)
  const companyId = membership?.company_id ?? metadataCompanyId(user) ?? DEFAULT_COMPANY_ID
  const role = normalizeTenantRole(membership?.role ?? metadataRole(user))

  const [company, aiConfig] = await Promise.all([
    fetchCompany(companyId),
    fetchAiConfig(companyId),
  ])

  const tenant = mergeTenant({
    companyId,
    slug: company?.slug ?? DEFAULT_COMPANY_SLUG,
    name: company?.name ?? DEFAULT_TENANT.name,
    productName: company?.product_name ?? DEFAULT_TENANT.productName,
    industryLabel: company?.industry_label ?? DEFAULT_TENANT.industryLabel,
    enabledFeatures: normalizeStringArray(company?.enabled_features, DEFAULT_TENANT.enabledFeatures),
    aiAssistantName: aiConfig?.assistant_name ?? DEFAULT_TENANT.aiAssistantName,
    aiAssistantDescription: aiConfig?.assistant_description ?? DEFAULT_TENANT.aiAssistantDescription,
    suggestedQuestions: normalizeStringArray(aiConfig?.suggested_questions, DEFAULT_TENANT.suggestedQuestions),
    role,
  })

  return {
    user,
    tenant,
    systemPrompt: aiConfig?.system_prompt ?? null,
  }
}

export function tenantPromptPrefix(tenant: CompanyTenant) {
  return `【現在の会社設定】
会社ID: ${tenant.companyId}
会社名: ${tenant.name}
プロダクト名: ${tenant.productName}
AI名: ${tenant.aiAssistantName}
対象領域: ${tenant.industryLabel}

この会話では、上記会社のログインユーザーにだけ回答してください。他社のデータ、設定、文脈を混ぜないでください。`
}
