'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import {
  BarChart2, TrendingUp, Clock, DollarSign, Receipt, Bell,
  Building2, Download, ChevronRight,
} from 'lucide-react'
import { mockReceipts, mockLawAlerts, mockSubsidies, mockClients } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-8 text-right">{value}</span>
    </div>
  )
}

export default function ReportsPage() {
  const receiptsByMonth = [
    { month: '11月', count: 6, amount: 82000 },
    { month: '12月', count: 8, amount: 95000 },
    { month: '1月',  count: 7, amount: 71000 },
    { month: '2月',  count: 9, amount: 108000 },
    { month: '3月',  count: 11, amount: 134000 },
    { month: '4月',  count: 10, amount: 103830 },
  ]
  const maxCount = Math.max(...receiptsByMonth.map(r => r.count))

  const lawAlertsByStatus = [
    { label: '未確認', value: mockLawAlerts.filter(a => a.status === 'unconfirmed').length, color: 'bg-amber-400' },
    { label: '確認中', value: mockLawAlerts.filter(a => a.status === 'reviewing').length, color: 'bg-blue-400' },
    { label: '対応済み', value: mockLawAlerts.filter(a => a.status === 'confirmed').length, color: 'bg-emerald-400' },
    { label: '案内済み', value: mockLawAlerts.filter(a => a.status === 'notified').length, color: 'bg-violet-400' },
  ]

  const subsidyByStatus = [
    { label: '候補', value: mockSubsidies.filter(s => s.status === 'candidate').length, color: 'bg-blue-400' },
    { label: '要確認', value: mockSubsidies.filter(s => s.status === 'reviewing').length, color: 'bg-amber-400' },
    { label: '提案済み', value: mockSubsidies.filter(s => s.status === 'proposed').length, color: 'bg-emerald-400' },
    { label: '申請準備中', value: mockSubsidies.filter(s => s.status === 'applying').length, color: 'bg-indigo-400' },
    { label: '対象外', value: mockSubsidies.filter(s => s.status === 'excluded').length, color: 'bg-slate-300' },
  ]

  const timeSavingData = [
    { month: '11月', hours: 18 },
    { month: '12月', hours: 22 },
    { month: '1月',  hours: 25 },
    { month: '2月',  hours: 31 },
    { month: '3月',  hours: 35 },
    { month: '4月',  hours: 38.5 },
  ]
  const maxHours = Math.max(...timeSavingData.map(t => t.hours))

  const clientsByIndustry = Object.entries(
    mockClients.reduce<Record<string, number>>((acc, c) => {
      acc[c.industry] = (acc[c.industry] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  return (
    <AppLayout>
      <div className="max-w-7xl space-y-5">

        {/* ヘッダー */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                <BarChart2 size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">レポート</h1>
            </div>
            <p className="text-sm text-slate-500 ml-10.5">AI業務改善の効果を可視化します</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={14} />月次レポートをダウンロード
          </button>
        </div>

        {/* KPIサマリー */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '今月の処理領収書', value: `${mockReceipts.length}件`, change: '+3件', up: true, icon: Receipt, color: 'bg-blue-500' },
            { label: '法改正対応率', value: '60%', change: '先月比 +10%', up: true, icon: Bell, color: 'bg-red-500' },
            { label: '助成金提案件数', value: `${mockSubsidies.filter(s => s.status === 'proposed').length}件`, change: '+1件', up: true, icon: DollarSign, color: 'bg-indigo-500' },
            { label: '月間削減時間（推定）', value: '38.5時間', change: '先月比 +3.5時間', up: true, icon: Clock, color: 'bg-emerald-500' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', card.color)}>
                <card.icon size={17} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-0.5">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
              <p className={cn('text-[11px] font-medium mt-1.5 flex items-center gap-1', card.up ? 'text-emerald-600' : 'text-red-500')}>
                <TrendingUp size={11} />{card.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* 領収書処理数の推移 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">領収書処理数の推移（件）</h3>
              <span className="text-[11px] text-slate-400">過去6ヶ月</span>
            </div>
            <div className="space-y-3">
              {receiptsByMonth.map(item => (
                <div key={item.month} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 w-8 shrink-0">{item.month}</span>
                  <div className="flex-1">
                    <MiniBar value={item.count} max={maxCount} color="bg-blue-500" />
                  </div>
                  <span className="text-[11px] text-slate-400 w-20 shrink-0 text-right">
                    ¥{item.amount.toLocaleString('ja-JP')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 削減時間の推移 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">AI業務削減時間の推移（時間）</h3>
              <span className="text-[11px] text-slate-400">過去6ヶ月</span>
            </div>
            <div className="space-y-3">
              {timeSavingData.map(item => (
                <div key={item.month} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 w-8 shrink-0">{item.month}</span>
                  <div className="flex-1">
                    <MiniBar value={item.hours} max={maxHours} color="bg-emerald-500" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 w-12 shrink-0 text-right">
                    {item.hours}h
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <p className="text-[11px] text-emerald-700 font-semibold">6ヶ月累計: <span className="text-base font-bold">169.5時間</span> 削減</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">時給換算 3,000円 × 169.5時間 = 約 <strong>508,500円</strong> の人件費削減効果</p>
            </div>
          </div>

          {/* 法改正対応状況 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">法改正対応状況</h3>
            <div className="space-y-3 mb-4">
              {lawAlertsByStatus.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-20 shrink-0">{item.label}</span>
                  <div className="flex-1">
                    <MiniBar value={item.value} max={mockLawAlerts.length} color={item.color} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-6 shrink-0">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-[11px] text-amber-600">要対応アラート</p>
                <p className="text-xl font-bold text-amber-700">
                  {mockLawAlerts.filter(a => a.status === 'unconfirmed' || a.status === 'reviewing').length}件
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-[11px] text-emerald-600">対応完了率</p>
                <p className="text-xl font-bold text-emerald-700">
                  {Math.round(mockLawAlerts.filter(a => a.status === 'confirmed' || a.status === 'notified').length / mockLawAlerts.length * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* 助成金提案状況 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">助成金・補助金提案状況</h3>
            <div className="space-y-3 mb-4">
              {subsidyByStatus.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-20 shrink-0">{item.label}</span>
                  <div className="flex-1">
                    <MiniBar value={item.value} max={mockSubsidies.length} color={item.color} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-6 shrink-0">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
              <p className="text-[11px] text-indigo-600 font-semibold">提案可能な総額（候補・要確認）</p>
              <p className="text-xl font-bold text-indigo-700">¥2,180万円</p>
              <p className="text-[11px] text-indigo-500 mt-0.5">6顧問先へのマッチング結果合計</p>
            </div>
          </div>

        </div>

        {/* 顧問先別サマリー */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-slate-600" />
              <h3 className="text-sm font-bold text-slate-800">顧問先別 対応状況サマリー</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['顧問先', '業種', '従業員', '未確認アラート', '助成金候補', '月次顧問料', 'アクション'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mockClients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-800">{client.name}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{client.industry}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{client.employees}名</td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        'text-xs font-semibold px-2.5 py-1 rounded-full border',
                        client.pendingAlerts > 0
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      )}>
                        {client.pendingAlerts}件
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                        {client.pendingSubsidies}件
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-800">
                      ¥{client.monthlyFee.toLocaleString('ja-JP')}
                    </td>
                    <td className="px-4 py-3.5">
                      <button className="flex items-center gap-1 text-[11px] text-blue-600 font-medium hover:text-blue-800">
                        詳細<ChevronRight size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 業種別顧問先分布 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">顧問先の業種分布</h3>
          <div className="space-y-2.5">
            {clientsByIndustry.map(([industry, count]) => (
              <div key={industry} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-28 shrink-0">{industry}</span>
                <div className="flex-1">
                  <MiniBar value={count} max={mockClients.length} color="bg-violet-400" />
                </div>
                <span className="text-xs text-slate-500 w-6">{count}社</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
