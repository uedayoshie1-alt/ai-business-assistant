'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Settings, Bell, ChevronRight } from 'lucide-react'

const pageTitles: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'ダッシュボード', description: '今日の業務をスタートしましょう' },
  '/email': { title: '営業メール作成', description: 'AIが自然な営業メールを作成します' },
  '/minutes': { title: '議事録作成', description: '会議メモを整理された議事録に変換します' },
  '/customers': { title: '顧客リスト', description: '講座申し込み顧客の一覧・管理' },
  '/estimate': { title: '見積作成', description: '見積書の作成・管理' },
  '/reservation': { title: '予約対応', description: '予約の確認・返信文の作成' },
  '/settings': { title: '設定', description: '会社情報・テンプレートの管理' },
  '/history': { title: '履歴', description: 'これまでに作成したドキュメントの一覧' },
}

export function Header() {
  const pathname = usePathname()
  const pageInfo = pageTitles[pathname] ?? { title: 'BizAssist AI', description: '' }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* ページタイトル */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-0.5">
          <span>BizAssist AI</span>
          <ChevronRight size={12} />
          <span className="text-gray-600">{pageInfo.title}</span>
        </div>
        <h1 className="text-base font-semibold text-gray-900 leading-tight">{pageInfo.title}</h1>
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-100 transition-colors"
        >
          <Settings size={14} />
          <span className="text-sm">会社設定</span>
        </Link>

        {/* ユーザーアバター */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-700">上</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-900 leading-tight">上田 良江</p>
            <p className="text-[11px] text-gray-400 leading-tight">ハッピーステート株式会社</p>
          </div>
        </div>
      </div>
    </header>
  )
}
