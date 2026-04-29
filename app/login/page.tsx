'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('メールアドレスまたはパスワードが正しくありません')
      } else {
        router.push('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { role: 'staff' } } })
      if (error) {
        setError(error.message.includes('already') ? 'このメールアドレスはすでに登録されています' : error.message)
      } else {
        setMessage('確認メールを送信しました。メールのリンクをクリックしてアカウントを有効化してください。')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0D1B3E 0%, #1a3a6e 50%, #0F2347 100%)' }}>
      {/* 左パネル */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-1/2 text-white">
        <div className="mb-10">
          <Image src="/logo.PNG" alt="TASUKU AI" width={320} height={180} className="object-contain" priority />
        </div>
        <h2 className="text-4xl font-bold leading-tight mb-4">
          社労士業務を<br />AIで効率化
        </h2>
        <p className="text-blue-200 leading-relaxed text-lg">
          法改正アラート・助成金マッチング・<br />
          領収書AI仕分け・AIチャットで<br />
          顧問先への提案力を強化します。
        </p>
        <div className="mt-12 space-y-4">
          {[
            '法改正情報をリアルタイムで取得',
            '助成金を顧問先条件で自動マッチング',
            '領収書をAIで自動仕分け・分類',
            '労働法・社会保険をAIに質問',
          ].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <span className="text-blue-100 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 右パネル：フォーム */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* モバイル用ロゴ */}
          <div className="flex justify-center mb-6 lg:hidden">
            <Image src="/logo.PNG" alt="TASUKU AI" width={200} height={110} className="object-contain" priority />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {mode === 'login' ? 'ログイン' : 'アカウント作成'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {mode === 'login' ? 'メールアドレスとパスワードを入力してください' : '新しいアカウントを作成します'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">メールアドレス</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">パスワード</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? '8文字以上' : 'パスワード'}
                    required
                    minLength={mode === 'signup' ? 8 : 1}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs text-emerald-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウントを作成'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                {mode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
                <button
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
                  className="ml-1 text-blue-600 font-semibold hover:text-blue-800"
                >
                  {mode === 'login' ? '新規登録' : 'ログイン'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
