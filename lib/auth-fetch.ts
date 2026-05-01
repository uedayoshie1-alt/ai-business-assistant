import { supabase } from './supabase'

export async function authHeaders(headers?: HeadersInit): Promise<Headers> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('ログイン情報を確認できませんでした')

  const nextHeaders = new Headers(headers)
  nextHeaders.set('Authorization', `Bearer ${token}`)
  return nextHeaders
}

export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    headers: await authHeaders(init.headers),
  })
}
