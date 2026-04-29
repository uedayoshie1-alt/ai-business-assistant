'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useRole() {
  const [role, setRole] = useState<'admin' | 'staff' | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const r = (data.user?.app_metadata?.role ?? data.user?.user_metadata?.role ?? 'staff') as 'admin' | 'staff'
      setRole(r)
      setUserId(data.user?.id ?? null)
      setEmail(data.user?.email ?? null)
      setLoading(false)
    })
  }, [])

  return { role, isAdmin: role === 'admin', userId, email, loading }
}
