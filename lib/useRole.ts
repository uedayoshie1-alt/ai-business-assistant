'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { resolveCurrentTenant } from './tenant'
import type { CompanyTenant, TenantRole } from './tenant-config'

export function useRole() {
  const [role, setRole] = useState<TenantRole | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [tenant, setTenant] = useState<CompanyTenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.auth.getUser(),
      resolveCurrentTenant(),
    ]).then(([{ data }, resolvedTenant]) => {
      const r = resolvedTenant.role
      setTenant(resolvedTenant)
      setRole(r)
      setUserId(data.user?.id ?? null)
      setEmail(data.user?.email ?? null)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  return { role, isAdmin: role === 'admin', userId, email, tenant, loading }
}
