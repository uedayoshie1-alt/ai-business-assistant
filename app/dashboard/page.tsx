'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  ScanLine, Bell, DollarSign, Clock, TrendingUp, AlertTriangle,
  CheckCircle2, FileText, Building2, ChevronRight, Sparkles,
  ArrowUpRight, Calendar,
} from 'lucide-react'
import { mockSubsidies, mockClients } from '@/lib/mock-data'
import { fetchReceipts } from '@/lib/db'
import { cn } from '@/lib/utils'

function StatCard({
  label, value, sub, icon: Icon, color, href,
  trend,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
  href?: string
  trend?: { value: string; up: boolean }
}) {
  const inner = (
    <div className={cn(
      'bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow group',
      href && 'cursor-pointer'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          <Icon size={18} className="text-white" />
        </div>
        {href && <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 transition-colors mt-1" />}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
      {trend && (
        <div className={cn('flex items-center gap-1 mt-2 text-[11px] font-medium',
          trend.up ? 'text-emerald-600' : 'text-red-500')}>
          <ArrowUpRight size={12} className={trend.up ? '' : 'rotate-90'} />
          {trend.value}
        </div>
      )}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default function DashboardPage() {
  const [newAlerts, setNewAlerts] = useState(0)
  const [totalReceipts, setTotalReceipts] = useState(0)
  const [pendingReceipts, setPendingReceipts] = useState(0)
  const [videoReceipts, setVideoReceipts] = useState(0)

  useEffect(() => {
    // 法改正未確認件数をlocalStorageから取得
    try {
      const n = localStorage.getItem('lawAlertUnconfirmed')
      setNewAlerts(n ? parseInt(n) : 0)
    } catch {}

    // 領収書データをSupabase DBから取得
    fetchReceipts().then(receipts => {
      setTotalReceipts(receipts.length)
      setPendingReceipts(receipts.filter(r => r.status === 'pending').length)
      setVideoReceipts(receipts.filter(r => r.sourceType === 'video').length)
    }).catch(() => {})
  }, [])

  const reviewingAlerts = 0
  const candidateSubsidies = mockSubsidies.filter(r => r.status === 'candidate').length
  const totalClients = mockClients.length
  const totalSubsidyAmount = '¥2,180万円'
  const timeSaved = '38.5時間'

  const recentAlerts: never[] = []
  const topSubsidies = mockSubsidies.filter(s => s.status === 'candidate').sort((a, b) => b.score - a.score).slice(0, 3)

  const today = new Date()
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日（${'日月火水木金土'[today.getDay()]}）`

  const importanceColors: Record<string, string> = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-slate-50 text-slate-500 border-slate-200',
  }
  const importanceLabels: Record<string, string> = { high: '重要', medium: '中', low: '低' }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl">

        {/* ヘッダー */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">おはようございます</h2>
            <p className="text-sm text-slate-400 mt-0.5">社労士AI業務ダッシュボード — 今日もスムーズな業務をサポートします</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar size={14} />
            <span>{dateStr}</span>
          </div>
        </div>

        {/* アクティブアラートバナー */}
        {(newAlerts > 0 || pendingReceipts > 0) && (
          <div className="flex flex-wrap gap-3">
            {newAlerts > 0 && (
              <Link href="/law-alerts" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-sm">
                <AlertTriangle size={15} className="text-red-500 shrink-0" />
                <span className="text-red-700 font-medium">未確認の法改正アラートが <strong>{newAlerts}件</strong> あります</span>
                <ChevronRight size={14} className="text-red-400" />
              </Link>
            )}
            {pendingReceipts > 0 && (
              <Link href="/receipt" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-sm">
                <ScanLine size={15} className="text-amber-500 shrink-0" />
                <span className="text-amber-700 font-medium">仕分け待ちの領収書が <strong>{pendingReceipts}件</strong> あります</span>
                <ChevronRight size={14} className="text-amber-400" />
              </Link>
            )}
          </div>
        )}

        {/* KPIカード */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <StatCard
            label="今月の処理済み領収書"
            value={`${totalReceipts}件`}
            sub={`うち動画抽出 ${videoReceipts}件`}
            icon={ScanLine}
            color="bg-blue-500"
            href="/receipt"
            trend={{ value: '先月比 +3件', up: true }}
          />
          <StatCard
            label="仕分け待ち"
            value={`${pendingReceipts}件`}
            sub="確認・修正が必要"
            icon={AlertTriangle}
            color={pendingReceipts > 0 ? 'bg-amber-500' : 'bg-emerald-500'}
            href="/receipt"
          />
          <StatCard
            label="新着法改正アラート"
            value={`${newAlerts}件`}
            sub={`確認中 ${reviewingAlerts}件`}
            icon={Bell}
            color={newAlerts > 0 ? 'bg-red-500' : 'bg-emerald-500'}
            href="/law-alerts"
            trend={{ value: '今月 +2件', up: false }}
          />
          <StatCard
            label="助成金マッチング候補"
            value={`${candidateSubsidies}件`}
            sub="提案可能な助成金"
            icon={DollarSign}
            color="bg-indigo-500"
            href="/subsidy"
            trend={{ value: '新着 +1件', up: true }}
          />
          <StatCard
            label="顧問先数"
            value={`${totalClients}社`}
            sub="契約中の顧問先"
            icon={Building2}
            color="bg-violet-500"
            href="/clients"
          />
          <StatCard
            label="今月の削減時間（推定）"
            value={timeSaved}
            sub="AI処理による効率化"
            icon={Clock}
            color="bg-cyan-500"
            trend={{ value: '先月比 +8.5時間', up: true }}
          />
          <StatCard
            label="提案可能金額の合計"
            value={totalSubsidyAmount}
            sub="全顧問先の助成金候補"
            icon={TrendingUp}
            color="bg-emerald-500"
            href="/subsidy"
          />
          <StatCard
            label="対応済み法改正"
            value={`${newAlerts > 0 ? '確認待ち' : '対応中'}`}
            sub="法改正アラートを確認"
            icon={CheckCircle2}
            color="bg-teal-500"
            href="/law-alerts"
          />
        </div>

        {/* AIからの提案 */}
        <div className="rounded-2xl border border-indigo-100 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F9FF 50%, #F5F3FF 100%)' }}>
          <div className="px-6 py-4 border-b border-indigo-100/60 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <h3 className="text-sm font-semibold text-indigo-900">AIからの今週の提案</h3>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Bell,
                color: 'text-red-500',
                bg: 'bg-red-50',
                title: '最低賃金改定 — 対応期限まで5か月',
                body: '2025年10月の最低賃金改定に向け、全顧問先の賃金チェックを今から開始することをお勧めします。特に飲食業・小売業の3社は時給近辺のスタッフが多く、優先対応が必要です。',
                link: '/law-alerts',
              },
              {
                icon: DollarSign,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                title: 'キャリアアップ助成金 — 3社が高スコア',
                body: '渡辺テクノロジー・鈴木フード・山田製作所の3社について、キャリアアップ助成金（正社員化コース）の適用可能性が高いです。計画書作成のご提案をお勧めします。',
                link: '/subsidy',
              },
              {
                icon: ScanLine,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                title: '仕分け待ち領収書の確認を',
                body: `現在${pendingReceipts}件の領収書が確認待ちです。月次締めに向けて今週中の確認をお勧めします。動画から抽出された${videoReceipts}件については特に用途の確認が必要です。`,
                link: '/receipt',
              },
            ].map((item, i) => (
              <Link key={i} href={item.link} className="bg-white/80 rounded-xl p-4 border border-white hover:border-indigo-200 hover:shadow-sm transition-all group">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', item.bg)}>
                  <item.icon size={16} className={item.color} />
                </div>
                <p className="text-xs font-semibold text-slate-800 mb-1.5">{item.title}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.body}</p>
                <div className="flex items-center gap-1 mt-3 text-[11px] font-medium text-indigo-600">
                  詳細を見る <ChevronRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 法改正アラート + 助成金候補 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* 新着法改正アラート */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-800">新着・未確認の法改正</h3>
              </div>
              <Link href="/law-alerts" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                すべて見る <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {newAlerts > 0 ? (
                <Link href="/law-alerts" className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <Bell size={16} className="text-red-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">未確認の法改正が{newAlerts}件あります</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">法改正アラートページで確認してください</p>
                  </div>
                  <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium shrink-0">要確認</span>
                </Link>
              ) : (
                <></>
              )}
              {recentAlerts.length === 0 && (
                <div className="px-5 py-6 text-center">
                  <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">未確認のアラートはありません</p>
                </div>
              )}
            </div>
          </div>

          {/* 助成金候補 TOP3 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-800">助成金マッチング TOP候補</h3>
              </div>
              <Link href="/subsidy" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                すべて見る <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {topSubsidies.map(subsidy => (
                <Link key={subsidy.id} href="/subsidy" className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="relative w-9 h-9 shrink-0">
                    <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15" fill="none"
                        stroke={subsidy.score >= 80 ? '#10B981' : subsidy.score >= 60 ? '#3B82F6' : '#F59E0B'}
                        strokeWidth="3"
                        strokeDasharray={`${subsidy.score * 0.942} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-700">{subsidy.score}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate">{subsidy.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{subsidy.amount} · 期限 {subsidy.deadline}</p>
                  </div>
                  <FileText size={14} className="text-slate-300 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
