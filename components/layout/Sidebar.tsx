'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Mail,
  FileText,
  Users,
  Calculator,
  Settings,
  History,
  ChevronRight,
  Sparkles,
  Receipt,
  Bell,
  Building2,
  Zap,
  BarChart2,
  ScanLine,
  DollarSign,
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
    section: '社労士 AI ツール',
    items: [
      { href: '/receipt', label: '領収書AI仕分け', icon: ScanLine, badge: null },
      { href: '/law-alerts', label: '法改正アラート', icon: Bell, badge: '3', badgeColor: 'bg-red-500' },
      { href: '/subsidy', label: '助成金マッチング', icon: DollarSign, badge: null },
      { href: '/clients', label: '顧問先管理', icon: Building2, badge: null },
      { href: '/gas', label: 'GAS連携', icon: Zap, badge: null },
      { href: '/reports', label: 'レポート', icon: BarChart2, badge: null },
    ],
  },
  {
    section: '業務アシスタント',
    items: [
      { href: '/email', label: 'メール作成', icon: Mail, badge: null },
      { href: '/minutes', label: '議事録', icon: FileText, badge: null },
      { href: '/invoice', label: '請求明細書', icon: Receipt, badge: null },
      { href: '/customers', label: '顧客リスト', icon: Users, badge: null },
      { href: '/estimate', label: '見積', icon: Calculator, badge: null },
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
    <aside className="w-64 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-20"
      style={{ background: 'linear-gradient(180deg, #0D1B3E 0%, #0F2347 100%)' }}>

      {/* ロゴ */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}>
            <Sparkles className="text-white" size={18} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight tracking-wide">TASUKU AI</p>
            <p className="text-[11px] leading-tight" style={{ color: '#93C5FD' }}>社労士 AI アシスタント</p>
          </div>
        </Link>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navItems.map((section) => (
          <div key={section.section}>
            <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5"
              style={{ color: '#4B6FA8' }}>
              {section.section}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const isSoon = 'badge' in item && item.badge === 'soon'
                const badgeCount = 'badge' in item && item.badge && item.badge !== 'soon' ? item.badge : null
                const badgeColor = 'badgeColor' in item ? item.badgeColor : 'bg-blue-500'

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group',
                        isActive
                          ? 'text-white font-medium'
                          : 'hover:text-white/90'
                      )}
                      style={isActive
                        ? { background: 'linear-gradient(90deg, rgba(59,130,246,0.25) 0%, rgba(99,102,241,0.15) 100%)', borderLeft: '2px solid #60A5FA' }
                        : { color: '#94A3B8' }
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          size={15}
                          className={cn('shrink-0 transition-colors',
                            isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                          )}
                        />
                        {item.label}
                      </span>
                      <span className="flex items-center gap-1">
                        {isSoon && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{ background: 'rgba(255,255,255,0.08)', color: '#64748B' }}>
                            近日
                          </span>
                        )}
                        {badgeCount && (
                          <span className={cn('text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center', badgeColor)}>
                            {badgeCount}
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

      {/* 下部バナー */}
      <div className="p-3 border-t border-white/10">
        <Link
          href="/gas"
          className="block p-3 rounded-xl border transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.15) 100%)',
            borderColor: 'rgba(99,102,241,0.3)',
          }}
        >
          <p className="text-xs font-semibold" style={{ color: '#A5B4FC' }}>GAS連携設定</p>
          <p className="text-[11px] mt-0.5" style={{ color: '#6D81A8' }}>スプレッドシート・Drive・メール通知</p>
        </Link>
      </div>
    </aside>
  )
}
