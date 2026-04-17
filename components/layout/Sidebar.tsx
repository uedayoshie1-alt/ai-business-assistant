'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Mail,
  FileText,
  Users,
  Calculator,
  CalendarCheck,
  Settings,
  History,
  ChevronRight,
  Sparkles,
  Camera,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    section: 'メイン',
    items: [
      { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    ],
  },
  {
    section: '業務アシスタント',
    items: [
      { href: '/email', label: 'メール', icon: Mail, badge: null },
      { href: '/minutes', label: '議事録', icon: FileText, badge: null },
      { href: '/instagram', label: 'Instagram投稿', icon: Camera, badge: null },
      { href: '/invoice', label: '請求書作成', icon: Receipt, badge: null },
      { href: '/customers', label: '顧客リスト', icon: Users, badge: null },
      { href: '/estimate', label: '見積', icon: Calculator, badge: 'soon' },
      { href: '/reservation', label: '予約対応', icon: CalendarCheck, badge: 'soon' },
    ],
  },
  {
    section: '管理',
    items: [
      { href: '/history', label: '履歴', icon: History },
      { href: '/settings', label: '設定', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-gray-950 flex flex-col fixed left-0 top-0 bottom-0 z-20">
      {/* ロゴ */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">BizAssist AI</p>
            <p className="text-gray-500 text-[11px] leading-tight">業務アシスタント</p>
          </div>
        </Link>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navItems.map((section) => (
          <div key={section.section}>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-2 mb-1.5">
              {section.section}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const isSoon = 'badge' in item && item.badge === 'soon'

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group',
                        isActive
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          size={16}
                          className={cn(
                            'shrink-0 transition-colors',
                            isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                          )}
                        />
                        {item.label}
                      </span>
                      <span className="flex items-center gap-1">
                        {isSoon && (
                          <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded font-medium">
                            近日
                          </span>
                        )}
                        {isActive && (
                          <ChevronRight size={12} className="text-blue-400" />
                        )}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 下部：会社設定バナー */}
      <div className="p-3 border-t border-white/10">
        <Link
          href="/settings"
          className="block p-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 transition-colors"
        >
          <p className="text-xs font-semibold text-blue-300">会社専用設定</p>
          <p className="text-[11px] text-blue-400/70 mt-0.5">会社情報・文体・テンプレートを設定</p>
        </Link>
      </div>
    </aside>
  )
}
