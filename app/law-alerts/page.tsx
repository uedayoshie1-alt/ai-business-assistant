'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Bell, AlertTriangle, CheckCircle2, Clock, ChevronRight, X,
  ExternalLink, ChevronDown, ChevronUp, FileText, Sparkles,
  ArrowRight, User, Calendar, Building2, RefreshCw, Loader2,
} from 'lucide-react'
import { mockLawAlerts, type LawAlert, type LawAlertStatus, type LawAlertImportance } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const statusConfig: Record<LawAlertStatus, { label: string; color: string; icon: React.ElementType }> = {
  unconfirmed: { label: '未確認',        color: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock },
  reviewing:   { label: '確認中',        color: 'bg-blue-50 text-blue-700 border-blue-200',       icon: Clock },
  confirmed:   { label: '対応済み',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  notified:    { label: '顧問先案内済み', color: 'bg-violet-50 text-violet-700 border-violet-200', icon: CheckCircle2 },
}

const importanceConfig: Record<LawAlertImportance, { label: string; color: string }> = {
  high:   { label: '重要',  color: 'bg-red-500 text-white' },
  medium: { label: '中',    color: 'bg-amber-400 text-white' },
  low:    { label: '低',    color: 'bg-slate-400 text-white' },
}

type StatusFilter = LawAlertStatus | 'all'

export default function LawAlertsPage() {
  const [alerts, setAlerts] = useState<LawAlert[]>(mockLawAlerts)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [importanceFilter, setImportanceFilter] = useState<'all' | LawAlertImportance>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [expandedDraft, setExpandedDraft] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)

  async function fetchLatestAlerts() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/law-alerts')
      const data = await res.json()
      if (data.alerts && data.alerts.length > 0) {
        setAlerts(data.alerts.map((a: LawAlert) => ({
          ...a,
          status: 'unconfirmed' as const,
        })))
        setGeneratedAt(data.generatedAt)
      }
    } catch (err) {
      console.error('Failed to fetch law alerts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { /* 手動ボタンでのみ取得 */ }, [])

  const filtered = alerts.filter(a =>
    (statusFilter === 'all' || a.status === statusFilter) &&
    (importanceFilter === 'all' || a.importance === importanceFilter)
  )

  const selected = selectedId ? alerts.find(a => a.id === selectedId) : null

  const statusCounts = {
    all: alerts.length,
    unconfirmed: alerts.filter(a => a.status === 'unconfirmed').length,
    reviewing: alerts.filter(a => a.status === 'reviewing').length,
    confirmed: alerts.filter(a => a.status === 'confirmed').length,
    notified: alerts.filter(a => a.status === 'notified').length,
  }

  function updateStatus(id: string, status: LawAlertStatus) {
    setAlerts(prev => prev.map(a => a.id === id ? {
      ...a, status,
      confirmedBy: '田中 太郎',
      confirmedAt: new Date().toISOString(),
    } : a))
    setSelectedId(null)
  }

  return (
    <AppLayout>
      <div className="max-w-7xl space-y-5">

        {/* ヘッダー */}
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                <Bell size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">法改正アラート</h1>
            </div>
            <p className="text-sm text-slate-500 ml-10.5">AIが自動収集した法改正情報を整理・管理します</p>
          </div>
          <div className="flex items-center gap-3">
            {generatedAt && (
              <p className="text-[11px] text-slate-400">
                最終更新: {new Date(generatedAt).toLocaleString('ja-JP')}
              </p>
            )}
            <button
              onClick={fetchLatestAlerts}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {isLoading ? '取得中...' : '最新情報を取得'}
            </button>
          </div>
        </div>

        {/* 重要な注意書き */}
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border border-amber-200 bg-amber-50">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-800 mb-0.5">社労士による最終確認が必要です</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              本画面の情報はAIによる整理案です。最終的な法的判断・顧問先への案内前には、必ず社労士による確認を行ってください。
              厚生労働省・e-Gov法令API・日本年金機構等からのデータを自動収集・要約しています（プロトタイプ版ではモックデータ）。
            </p>
          </div>
        </div>

        {/* ステータス別集計 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {([
            ['all',         `すべて (${statusCounts.all})`,                  'bg-slate-500'],
            ['unconfirmed', `未確認 (${statusCounts.unconfirmed})`,           'bg-amber-500'],
            ['reviewing',   `確認中 (${statusCounts.reviewing})`,            'bg-blue-500'],
            ['confirmed',   `対応済み (${statusCounts.confirmed})`,          'bg-emerald-500'],
            ['notified',    `顧問先案内済み (${statusCounts.notified})`,     'bg-violet-500'],
          ] as const).map(([val, label, dotColor]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors text-left',
                statusFilter === val
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              <span className={cn('w-2 h-2 rounded-full shrink-0', dotColor)} />
              {label}
            </button>
          ))}
        </div>

        {/* 重要度フィルター */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">重要度:</span>
          {(['all', 'high', 'medium', 'low'] as const).map(val => (
            <button
              key={val}
              onClick={() => setImportanceFilter(val)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors',
                importanceFilter === val
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              )}
            >
              {val === 'all' ? 'すべて' : importanceConfig[val].label}
            </button>
          ))}
        </div>

        {/* アラートカード一覧 */}
        <div className="space-y-3">
          {filtered.map(alert => {
            const sc = statusConfig[alert.status]
            const ic = importanceConfig[alert.importance]
            const StatusIcon = sc.icon
            const tasksExpanded = expandedTasks[alert.id]
            const draftExpanded = expandedDraft[alert.id]

            return (
              <div key={alert.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* カードヘッダー */}
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className={cn('text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 mt-0.5', ic.color)}>
                      {ic.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{alert.title}</h3>
                        <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border shrink-0', sc.color)}>
                          <StatusIcon size={11} />
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <FileText size={11} />{alert.source}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar size={11} />公開 {alert.publishDate}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                          <Calendar size={11} />施行 {alert.effectiveDate}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {alert.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Building2 size={11} />{alert.targetCompany}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 rounded-xl px-4 py-3">
                    {alert.summary}
                  </p>
                </div>

                {/* 旧ルール → 新ルール */}
                <div className="px-5 pb-4">
                  <div className="flex gap-3 items-stretch">
                    <div className="flex-1 bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-red-500 mb-1">旧ルール</p>
                      <p className="text-xs text-red-800">{alert.oldRule}</p>
                    </div>
                    <div className="flex items-center">
                      <ArrowRight size={16} className="text-slate-400 shrink-0" />
                    </div>
                    <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-emerald-600 mb-1">新ルール</p>
                      <p className="text-xs text-emerald-800">{alert.newRule}</p>
                    </div>
                  </div>
                </div>

                {/* 顧問先への影響 */}
                <div className="px-5 pb-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-blue-600 mb-1">顧問先への影響</p>
                    <p className="text-xs text-blue-800">{alert.impact}</p>
                  </div>
                </div>

                {/* 必要な対応タスク（折りたたみ） */}
                <div className="px-5 pb-4">
                  <button
                    onClick={() => setExpandedTasks(prev => ({ ...prev, [alert.id]: !prev[alert.id] }))}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 rounded-xl px-4 py-2.5 hover:bg-slate-100 transition-colors"
                  >
                    <span>必要な対応タスク ({alert.requiredTasks.length}件)</span>
                    {tasksExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {tasksExpanded && (
                    <div className="mt-2 space-y-1.5">
                      {alert.requiredTasks.map((task, i) => (
                        <div key={i} className="flex items-start gap-2 px-3 py-2 bg-white border border-slate-100 rounded-xl">
                          <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-xs text-slate-700">{task}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 顧問先向け案内文下書き（折りたたみ） */}
                <div className="px-5 pb-4">
                  <button
                    onClick={() => setExpandedDraft(prev => ({ ...prev, [alert.id]: !prev[alert.id] }))}
                    className="w-full flex items-center justify-between text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-xl px-4 py-2.5 hover:bg-indigo-100 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={12} />顧問先向け案内文 (AI下書き)
                    </span>
                    {draftExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {draftExpanded && (
                    <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                      <pre className="text-xs text-indigo-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {alert.draftNotice}
                      </pre>
                    </div>
                  )}
                </div>

                {/* フッター：ステータス変更ボタン */}
                <div className="px-5 pb-4 flex flex-wrap items-center gap-3 border-t border-slate-50 pt-4">
                  {alert.confirmedBy && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <User size={11} />{alert.confirmedBy} · {alert.confirmedAt ? new Date(alert.confirmedAt).toLocaleDateString('ja-JP') : ''}
                    </span>
                  )}
                  <div className="ml-auto flex flex-wrap gap-2">
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 font-medium border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <ExternalLink size={11} />原文を確認
                    </a>
                    {alert.status === 'unconfirmed' && (
                      <button
                        onClick={() => updateStatus(alert.id, 'reviewing')}
                        className="text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        確認中にする
                      </button>
                    )}
                    {alert.status === 'reviewing' && (
                      <>
                        <button
                          onClick={() => updateStatus(alert.id, 'confirmed')}
                          className="text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          対応済みにする
                        </button>
                      </>
                    )}
                    {alert.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(alert.id, 'notified')}
                        className="text-[11px] font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        顧問先案内済みにする
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedId(alert.id)}
                      className="text-[11px] font-medium text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                    >
                      詳細<ChevronRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">該当するアラートはありません</p>
            </div>
          )}
        </div>

        {/* 詳細モーダル */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
                <h3 className="text-sm font-bold text-slate-900">{selected.title}</h3>
                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '情報取得元', value: selected.source },
                    { label: '公開日', value: selected.publishDate },
                    { label: '施行日', value: selected.effectiveDate },
                    { label: '重要度', value: importanceConfig[selected.importance].label },
                    { label: '対象分野', value: selected.category },
                    { label: '対象企業', value: selected.targetCompany },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[11px] text-slate-400 font-medium mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium mb-2">変更内容</p>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-red-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-red-500 mb-1">旧</p>
                      <p className="text-xs text-red-800">{selected.oldRule}</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 mt-4 shrink-0" />
                    <div className="flex-1 bg-emerald-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-emerald-600 mb-1">新</p>
                      <p className="text-xs text-emerald-800">{selected.newRule}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <a
                    href={selected.sourceUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    <ExternalLink size={14} />原文を見る
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  )
}
