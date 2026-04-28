'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Zap, CheckCircle2, AlertTriangle, Link as LinkIcon, Mail,
  Clock, RefreshCw, ExternalLink, Save, FolderOpen, FileSpreadsheet,
  Bell, Calendar, BarChart2, Receipt, DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GasConfig {
  spreadsheetUrl: string
  driveFolderUrl: string
  notifyEmails: string
  syncInterval: string
  gasWebAppUrl: string
  lastSyncAt: string | null
  syncStatus: 'connected' | 'disconnected' | 'syncing'
}

const GAS_FEATURES = [
  {
    icon: Receipt,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: '領収書データの保存',
    desc: '仕分け確認済みの領収書データをスプレッドシートに自動保存。月次で集計シートを自動生成します。',
    status: 'ready',
  },
  {
    icon: FileSpreadsheet,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    title: 'CSV・スプレッドシート出力',
    desc: '顧問先別の助成金候補リストや法改正対応リストをスプレッドシートに出力します。',
    status: 'ready',
  },
  {
    icon: Bell,
    color: 'text-red-500',
    bg: 'bg-red-50',
    title: '法改正アラートの定期取得',
    desc: '厚生労働省・e-Gov等から毎朝8時に新着情報を取得し、未確認アラートをスタッフにメール通知します。',
    status: 'ready',
  },
  {
    icon: Mail,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    title: 'スタッフへのメール通知',
    desc: '未確認アラートや仕分け待ち領収書が一定数を超えた場合に、担当スタッフに自動メールを送信します。',
    status: 'ready',
  },
  {
    icon: FolderOpen,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    title: 'Google Driveへのファイル保存',
    desc: 'アップロードされた領収書画像・動画を顧問先別フォルダに自動整理して保存します。',
    status: 'ready',
  },
  {
    icon: BarChart2,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    title: '月次レポート自動作成',
    desc: '毎月末に処理件数・削減時間・助成金提案実績などをまとめたレポートをスプレッドシートに作成します。',
    status: 'coming',
  },
  {
    icon: DollarSign,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    title: '顧問先別助成金候補リスト作成',
    desc: 'マッチング結果を顧問先ごとに整理し、提案用スプレッドシートを自動生成します。',
    status: 'coming',
  },
  {
    icon: Calendar,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    title: '顧問先向け案内文の下書き保存',
    desc: 'AIが生成した法改正案内文・助成金提案文をGoogleドキュメントに保存し、顧問先ごとに管理します。',
    status: 'coming',
  },
]

export default function GasPage() {
  const [config, setConfig] = useState<GasConfig>({
    spreadsheetUrl: '',
    driveFolderUrl: '',
    notifyEmails: '',
    syncInterval: 'daily',
    gasWebAppUrl: '',
    lastSyncAt: null,
    syncStatus: 'disconnected',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 1200)
  }

  function handleSync() {
    setIsSyncing(true)
    setConfig(prev => ({ ...prev, syncStatus: 'syncing' }))
    setTimeout(() => {
      setIsSyncing(false)
      setConfig(prev => ({
        ...prev,
        syncStatus: 'connected',
        lastSyncAt: new Date().toISOString(),
      }))
    }, 2500)
  }

  const statusDisplay = {
    connected:    { label: '接続済み', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
    disconnected: { label: '未接続',   color: 'text-slate-500 bg-slate-50 border-slate-200',       icon: AlertTriangle },
    syncing:      { label: '同期中...',color: 'text-blue-600 bg-blue-50 border-blue-200',          icon: RefreshCw },
  }[config.syncStatus]

  const StatusIcon = statusDisplay.icon

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">

        {/* ヘッダー */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">GAS連携設定</h1>
          </div>
          <p className="text-sm text-slate-500 ml-10.5">Google Apps Scriptと連携してデータ出力・通知・自動化を設定します</p>
        </div>

        {/* 接続ステータス */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">連携ステータス</h3>
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border', statusDisplay.color)}>
              <StatusIcon size={13} className={config.syncStatus === 'syncing' ? 'animate-spin' : ''} />
              {statusDisplay.label}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[11px] text-slate-400 mb-1">スプレッドシート</p>
              <p className={cn('text-xs font-semibold', config.spreadsheetUrl ? 'text-emerald-600' : 'text-slate-400')}>
                {config.spreadsheetUrl ? '設定済み' : '未設定'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[11px] text-slate-400 mb-1">Google Drive</p>
              <p className={cn('text-xs font-semibold', config.driveFolderUrl ? 'text-emerald-600' : 'text-slate-400')}>
                {config.driveFolderUrl ? '設定済み' : '未設定'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[11px] text-slate-400 mb-1">最終同期</p>
              <p className="text-xs font-semibold text-slate-600">
                {config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString('ja-JP') : '未同期'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* 設定フォーム */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">接続設定</h3>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                GAS Webアプリ URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={config.gasWebAppUrl}
                  onChange={e => setConfig(prev => ({ ...prev, gasWebAppUrl: e.target.value }))}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-400"
                />
                <a
                  href="https://script.google.com"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  <ExternalLink size={12} />GAS
                </a>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Google Apps ScriptのWebアプリとしてデプロイしたURLを入力</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                <span className="flex items-center gap-1.5"><FileSpreadsheet size={11} />スプレッドシート URL</span>
              </label>
              <input
                type="url"
                value={config.spreadsheetUrl}
                onChange={e => setConfig(prev => ({ ...prev, spreadsheetUrl: e.target.value }))}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                <span className="flex items-center gap-1.5"><FolderOpen size={11} />Google Drive フォルダ URL</span>
              </label>
              <input
                type="url"
                value={config.driveFolderUrl}
                onChange={e => setConfig(prev => ({ ...prev, driveFolderUrl: e.target.value }))}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                <span className="flex items-center gap-1.5"><Mail size={11} />通知先メールアドレス</span>
              </label>
              <input
                type="text"
                value={config.notifyEmails}
                onChange={e => setConfig(prev => ({ ...prev, notifyEmails: e.target.value }))}
                placeholder="staff@example.com, manager@example.com"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">複数の場合はカンマ区切りで入力</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                <span className="flex items-center gap-1.5"><Clock size={11} />自動取得の頻度</span>
              </label>
              <select
                value={config.syncInterval}
                onChange={e => setConfig(prev => ({ ...prev, syncInterval: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-blue-400"
              >
                <option value="daily">毎日（朝8時）</option>
                <option value="weekly">毎週月曜日</option>
                <option value="monthly">毎月1日</option>
                <option value="manual">手動のみ</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors',
                  saved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                )}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saved ? (
                  <><CheckCircle2 size={15} />保存しました</>
                ) : (
                  <><Save size={15} />設定を保存</>
                )}
              </button>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 border border-blue-300 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? '同期中...' : '今すぐ同期'}
              </button>
            </div>
          </div>

          {/* セットアップガイド */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">GASセットアップ手順</h3>
            <div className="space-y-3">
              {[
                {
                  step: '1',
                  title: 'GASプロジェクトを作成',
                  desc: 'Google Apps Scriptにアクセスし、新しいプロジェクトを作成します。',
                  link: 'https://script.google.com',
                  linkLabel: 'GASを開く',
                },
                {
                  step: '2',
                  title: 'スクリプトをコピー',
                  desc: '提供されるGASコードをプロジェクトにコピーして保存します。',
                },
                {
                  step: '3',
                  title: 'Webアプリとしてデプロイ',
                  desc: '「デプロイ」→「新しいデプロイ」→「Webアプリ」を選択してデプロイします。',
                },
                {
                  step: '4',
                  title: 'URLを上記フォームに入力',
                  desc: 'デプロイ後に発行されたWebアプリURLを左のフォームに貼り付けます。',
                },
                {
                  step: '5',
                  title: 'トリガーを設定',
                  desc: '法改正情報の定期取得など、時間ベースのトリガーをGAS側で設定します。',
                },
              ].map(item => (
                <div key={item.step} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 mt-1 hover:underline">
                        <ExternalLink size={10} />{item.linkLabel}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GAS連携機能一覧 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">GASで実装する機能</h3>
          </div>
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {GAS_FEATURES.map((feature, i) => (
              <div key={i} className={cn(
                'flex items-start gap-3 p-4 rounded-xl border',
                feature.status === 'coming'
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              )}>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', feature.bg)}>
                  <feature.icon size={17} className={feature.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold text-slate-800">{feature.title}</p>
                    {feature.status === 'coming' && (
                      <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-medium">近日対応</span>
                    )}
                    {feature.status === 'ready' && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-medium">対応済み</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
