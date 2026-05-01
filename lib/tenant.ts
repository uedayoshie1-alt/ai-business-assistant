'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import {
  DEFAULT_COMPANY_ID,
  DEFAULT_COMPANY_SLUG,
  DEFAULT_TENANT,
  TENANT_CACHE_KEY,
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
  suggested_questions: unknown
}

type MembershipRow = {
  company_id: string
  role: string | null
}

function cacheTenantId(companyId: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TENANT_CACHE_KEY, companyId)
  } catch {}
}

export function getCachedTenantId(): string {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_ID
  try {
    return localStorage.getItem(TENANT_CACHE_KEY) || DEFAULT_COMPANY_ID
  } catch {
    return DEFAULT_COMPANY_ID
  }
}

async function fetchMembership(userId: string): Promise<MembershipRow | null> {
  const { data, error } = await supabase
    .from('company_memberships')
    .select('company_id, role')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data
}

async function fetchCompany(companyId: string): Promise<CompanyRow | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('id, slug, name, product_name, industry_label, enabled_features')
    .eq('id', companyId)
    .maybeSingle()

  if (error) return null
  return data
}

async function fetchAiConfig(companyId: string): Promise<AiConfigRow | null> {
  const { data, error } = await supabase
    .from('company_ai_configs')
    .select('assistant_name, assistant_description, suggested_questions')
    .eq('company_id', companyId)
    .maybeSingle()

  if (error) return null
  return data
}

export async function resolveCurrentTenant(): Promise<CompanyTenant> {
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) {
    cacheTenantId(DEFAULT_COMPANY_ID)
    return DEFAULT_TENANT
  }

  const membership = await fetchMembership(user.id)
  const companyId = membership?.company_id ?? metadataCompanyId(user) ?? DEFAULT_COMPANY_ID
  const role = normalizeTenantRole(membership?.role ?? metadataRole(user))

  const [company, aiConfig] = await Promise.all([
    fetchCompany(companyId),
    fetchAiConfig(companyId),
  ])

  cacheTenantId(companyId)

  return mergeTenant({
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
}

export function useTenant() {
  const [tenant, setTenant] = useState<CompanyTenant>(DEFAULT_TENANT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    resolveCurrentTenant()
      .then(resolved => {
        if (alive) setTenant(resolved)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => { alive = false }
  }, [])

  return { tenant, loading }
}
