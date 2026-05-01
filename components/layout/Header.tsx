'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings, Bell, ChevronRight, Menu, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/tenant'

const pageTitles: Record<string, { title: string; description: string }> = {
  '/dashboard':  { title: 'ダッシュボード',       description: '社労士AI業務ダッシュボード' },
  '/receipt':    { title: '領収書AI仕分け',       description: '動画・画像から自動OCR・仕分け' },
  '/law-alerts': { title: '法改正アラート',       description: 'AIが最新法改正情報を収集・整理します' },
  '/subsidy':    { title: '助成金マッチング',     description: '顧問先の条件に合った助成金を自動検索' },
  '/clients':    { title: '顧問先管理',           description: '顧問先の情報・アラート・助成金を一元管理' },
  '/gas':        { title: 'GAS連携設定',          description: 'Google Sheets・Drive・メール通知を設定' },
  '/reports':    { title: 'レポート',             description: 'AI業務改善の効果を可視化します' },
  '/email':      { title: 'メール作成',           description: 'AIが自然なメールを作成します' },
  '/minutes':    { title: '議事録作成',           description: '会議メモを整理された議事録に変換します' },
  '/instagram':  { title: 'Instagram投稿作成',   description: 'AIがInstagramの投稿文・ハッシュタグを作成します' },
  '/invoice':    { title: '請求明細書',             description: 'CSV・Excel・PDFをアップロードして明細書を自動生成します' },
  '/customers':  { title: '顧客リスト',           description: '講座申し込み顧客の一覧・管理' },
  '/estimate':   { title: '見積作成',             description: '見積書の作成・管理' },
  '/reservation':{ title: '予約対応',             description: '予約の確認・返信文の作成' },
  '/settings':   { title: '設定',                 description: '会社情報・テンプレートの管理' },
  '/history':    { title: '履歴',                 description: 'これまでに作成したドキュメントの一覧' },
}

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { tenant } = useTenant()
  const [displayName, setDisplayName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setDisplayName(data.user?.user_metadata?.display_name ?? data.user?.user_metadata?.name ?? '')
      setUserEmail(data.user?.email ?? '')
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }
  const pageInfo = pageTitles[pathname] ?? { title: 'TASUKU AI', description: '' }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      {/* ページタイトル */}
      <div className="flex items-center gap-3">
        {/* ハンバーガーメニュー（モバイルのみ） */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 mb-0.5">
            <span>{tenant.productName}</span>
            <ChevronRight size={12} />
            <span className="text-gray-600">{pageInfo.title}</span>
          </div>
          <h1 className="text-base font-semibold text-gray-900 leading-tight">{pageInfo.title}</h1>
        </div>
      </div>

      {/* 右側アクション */}
      <div className="flex items-center gap-2">
        {/* 通知 */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>

        {/* 設定ショートカット */}
        <Link
          href="/settings"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-100 transition-colors"
        >
          <Settings size={14} />
          <span className="text-sm">会社設定</span>
        </Link>

        {/* ユーザー情報 */}
        {(displayName || userEmail) && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-100">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-blue-700">
                {(displayName || userEmail).charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-700 font-medium max-w-[100px] truncate">
              {displayName || userEmail.split('@')[0]}
            </span>
            <span className="text-[11px] text-gray-400 max-w-[120px] truncate">
              {tenant.name}
            </span>
          </div>
        )}

        {/* ログアウト */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 border border-gray-100 transition-colors"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline text-sm">ログアウト</span>
        </button>
      </div>
    </header>
  )
}
