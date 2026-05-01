'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { DEFAULT_COMPANY_ID } from '@/lib/tenant-config'

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
      if (error) setError('メールアドレスまたはパスワードが正しくありません')
      else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { role: 'staff', company_id: DEFAULT_COMPANY_ID } }
      })
      if (error) setError(error.message.includes('already') ? 'このメールアドレスはすでに登録されています' : error.message)
      else setMessage('確認メールを送信しました。メールのリンクをクリックしてアカウントを有効化してください。')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* 左パネル：クリーム＋ロゴ */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #F9F6F0 0%, #EDE8DF 50%, #F5F0E8 100%)' }}>

        {/* 装飾円 */}
        <div className="absolute top-[-100px] left-[-100px] w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #C9A96E, transparent)' }} />
        <div className="absolute bottom-[-80px] right-[-80px] w-64 h-64 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #0D1B3E, transparent)' }} />

        <div className="relative z-10 flex flex-col items-center px-16 text-center">
          <Image src="/logo.PNG" alt="TASUKU AI" width={360} height={200} className="object-contain mb-10" priority />

          <div className="w-12 h-px mb-8" style={{ background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)' }} />

          <p className="text-lg font-light leading-relaxed mb-8" style={{ color: '#0D1B3E', letterSpacing: '0.05em' }}>
            社労士業務を、AIの力で<br />もっとスマートに。
          </p>

          <div className="space-y-4 w-full max-w-xs">
            {[
              '法改正情報をリアルタイムで取得',
              '助成金を顧問先条件で自動マッチング',
              '領収書をAIで自動仕分け・分類',
              '労働法・社会保険をAIに質問',
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#C9A96E' }} />
                <span className="text-sm" style={{ color: '#4A5568' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 右パネル：ネイビー＋フォーム */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0D1B3E 0%, #1a2f5e 50%, #0F2347 100%)' }}>

        {/* 装飾 */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #C9A96E, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="w-full max-w-md relative z-10">

          {/* モバイル用ロゴ */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="bg-white rounded-2xl p-4 shadow-xl">
              <Image src="/logo.PNG" alt="TASUKU AI" width={200} height={110} className="object-contain" priority />
            </div>
          </div>

          {/* フォームカード */}
          <div className="rounded-3xl p-8 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(201,169,110,0.2)' }}>

            {/* タイトル */}
            <div className="mb-8">
              <div className="w-8 h-0.5 mb-4" style={{ background: 'linear-gradient(90deg, #C9A96E, transparent)' }} />
              <h2 className="text-2xl font-light text-white tracking-widest mb-1">
                {mode === 'login' ? 'ログイン' : 'アカウント作成'}
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {mode === 'login' ? 'TASUKU AIへようこそ' : '新しいアカウントを作成します'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* メールアドレス */}
              <div>
                <label className="text-xs font-medium block mb-2 tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#C9A96E' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@company.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 rounded-xl outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              {/* パスワード */}
              <div>
                <label className="text-xs font-medium block mb-2 tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  パスワード
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#C9A96E' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? '8文字以上' : 'パスワード'}
                    required
                    minLength={mode === 'signup' ? 8 : 1}
                    className="w-full pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-white/30 rounded-xl outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)' }}>
                  {error}
                </div>
              )}
              {message && (
                <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(16,185,129,0.15)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.3)' }}>
                  {message}
                </div>
              )}

              {/* ボタン */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-widest disabled:opacity-60 flex items-center justify-center gap-2 transition-all mt-2"
                style={{ background: 'linear-gradient(135deg, #C9A96E, #A88240)', color: '#0D1B3E' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウントを作成'}
              </button>
            </form>

            <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {mode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
                <button
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
                  className="ml-1 font-semibold transition-colors"
                  style={{ color: '#C9A96E' }}
                >
                  {mode === 'login' ? '新規登録' : 'ログイン'}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
            人を助け、仕事を進め、組織を前に進めるAI
          </p>
        </div>
      </div>
    </div>
  )
}
