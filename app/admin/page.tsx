'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useRole } from '@/lib/useRole'
import { supabase } from '@/lib/supabase'
import { Users, UserPlus, Shield, User, Trash2, Loader2, Crown, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

type UserRecord = {
  id: string
  email: string
  role: 'admin' | 'staff'
  createdAt: string
  lastSignIn: string
}

export default function AdminPage() {
  const { isAdmin, loading } = useRole()
  const router = useRouter()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [fetching, setFetching] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [message, setMessage] = useState('')

  const getToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? ''
  }

  const fetchUsers = useCallback(async () => {
    setFetching(true)
    const token = await getToken()
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.users) setUsers(data.users)
    setFetching(false)
  }, [])

  useEffect(() => {
    if (!loading && !isAdmin) router.replace('/dashboard')
    if (!loading && isAdmin) fetchUsers()
  }, [loading, isAdmin, router, fetchUsers])

  async function invite() {
    if (!inviteEmail.trim()) return
    setInviting(true)
    setMessage('')
    const token = await getToken()
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: inviteEmail }),
    })
    const data = await res.json()
    if (data.success) {
      setMessage(`${inviteEmail} に招待メールを送信しました`)
      setInviteEmail('')
      fetchUsers()
    } else {
      setMessage(`エラー: ${data.error}`)
    }
    setInviting(false)
  }

  async function changeRole(userId: string, role: 'admin' | 'staff') {
    const token = await getToken()
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, role }),
    })
    fetchUsers()
  }

  async function deleteUser(userId: string, email: string) {
    if (!confirm(`${email} を削除しますか？`)) return
    const token = await getToken()
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId }),
    })
    fetchUsers()
  }

  if (loading || !isAdmin) return null

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
            <Crown size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">管理者設定</h1>
            <p className="text-xs text-slate-500">スタッフの招待・権限管理</p>
          </div>
          <button onClick={fetchUsers} className="ml-auto text-slate-400 hover:text-slate-600">
            <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* スタッフ招待 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <UserPlus size={15} className="text-blue-600" />スタッフを招待
          </h2>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="staff@example.com"
              className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-400"
              onKeyDown={e => e.key === 'Enter' && invite()}
            />
            <button
              onClick={invite}
              disabled={inviting || !inviteEmail.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center gap-2"
            >
              {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              招待
            </button>
          </div>
          {message && (
            <p className={`text-xs mt-2 ${message.includes('エラー') ? 'text-red-600' : 'text-emerald-600'}`}>
              {message}
            </p>
          )}
          <p className="text-[11px] text-slate-400 mt-2">招待メールが送信されます。スタッフはリンクからパスワードを設定してログインできます。</p>
        </div>

        {/* ユーザー一覧 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Users size={15} className="text-slate-500" />
            <h2 className="text-sm font-bold text-slate-700">登録ユーザー一覧</h2>
            <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{users.length}名</span>
          </div>
          <div className="divide-y divide-slate-50">
            {fetching && users.length === 0 ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="text-slate-400 animate-spin" /></div>
            ) : users.map(user => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${user.role === 'admin' ? 'bg-amber-100' : 'bg-slate-100'}`}>
                  {user.role === 'admin'
                    ? <Crown size={14} className="text-amber-600" />
                    : <User size={14} className="text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
                  <p className="text-[11px] text-slate-400">
                    登録: {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                    {user.lastSignIn && ` · 最終ログイン: ${new Date(user.lastSignIn).toLocaleDateString('ja-JP')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={user.role}
                    onChange={e => changeRole(user.id, e.target.value as 'admin' | 'staff')}
                    className={`text-xs border rounded-lg px-2 py-1.5 focus:outline-none ${
                      user.role === 'admin'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <option value="admin">管理者</option>
                    <option value="staff">スタッフ</option>
                  </select>
                  <button
                    onClick={() => deleteUser(user.id, user.email)}
                    className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <Shield size={14} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">このページは管理者のみ表示されます。スタッフにはサイドバーに表示されません。</p>
        </div>
      </div>
    </AppLayout>
  )
}
