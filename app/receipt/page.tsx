'use client'

import { useState, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  ScanLine, Upload, Video, Image as ImageIcon, CheckCircle2, AlertTriangle,
  Clock, Download, Sheet, Edit3, X, ChevronDown, Eye, RotateCcw,
  Loader2, Film, Sparkles,
} from 'lucide-react'
import { mockReceipts, ACCOUNT_CATEGORIES, type Receipt, type ReceiptStatus } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'pending' | 'confirmed' | 'rejected'

const statusConfig: Record<ReceiptStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: '未確認', color: 'bg-amber-50 text-amber-700 border-amber-200',  icon: Clock },
  confirmed: { label: '確認済み', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected:  { label: '除外',   color: 'bg-slate-50 text-slate-500 border-slate-200',  icon: X },
}

function formatCurrency(n: number) {
  return `¥${n.toLocaleString('ja-JP')}`
}

export default function ReceiptPage() {
  const [receipts, setReceipts] = useState<Receipt[]>(mockReceipts)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCategory, setEditCategory] = useState('')
  const [editModalId, setEditModalId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<{ date: string; vendor: string; amount: string; purpose: string; accountCategory: string; taxRate: 8 | 10 }>({ date: '', vendor: '', amount: '', purpose: '', accountCategory: '', taxRate: 10 })
  const [isVideoProcessing, setIsVideoProcessing] = useState(false)
  const [isImageProcessing, setIsImageProcessing] = useState(false)
  const [videoFileName, setVideoFileName] = useState<string | null>(null)
  const [imageCount, setImageCount] = useState(0)
  const videoRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)

  const stats = {
    total: receipts.length,
    fromVideo: receipts.filter(r => r.sourceType === 'video').length,
    pending: receipts.filter(r => r.status === 'pending').length,
    totalAmount: receipts.filter(r => r.status === 'confirmed').reduce((s, r) => s + r.amount, 0),
  }

  const filtered = receipts.filter(r => filter === 'all' || r.status === filter)
  const selected = selectedId ? receipts.find(r => r.id === selectedId) : null

  async function extractFrames(file: File, intervalSec = 2): Promise<Blob[]> {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.src = URL.createObjectURL(file)
      video.muted = true
      const frames: Blob[] = []

      video.onloadedmetadata = () => {
        const times: number[] = []
        for (let t = 0; t < video.duration; t += intervalSec) times.push(t)
        if (times.length === 0) times.push(0)

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        let i = 0

        const capture = () => { video.currentTime = times[i] }
        video.onseeked = () => {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0)
          canvas.toBlob(blob => {
            if (blob) frames.push(blob)
            i++
            if (i < times.length) capture()
            else { URL.revokeObjectURL(video.src); resolve(frames) }
          }, 'image/jpeg', 0.85)
        }
        capture()
      }
      video.onerror = () => resolve([])
    })
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoFileName(file.name)
    setIsVideoProcessing(true)

    try {
      const frames = await extractFrames(file, 2)
      if (frames.length === 0) throw new Error('フレームを抽出できませんでした')

      const formData = new FormData()
      frames.forEach((blob, i) => formData.append('images', blob, `frame_${i}.jpg`))

      const res = await fetch('/api/receipt/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `サーバーエラー (${res.status})`)

      if (data.receipts && data.receipts.length > 0) {
        const withVideo = data.receipts.map((r: Receipt) => ({ ...r, sourceType: 'video' as const }))
        setReceipts(prev => [...withVideo, ...prev])
      }
    } catch (err) {
      alert('動画処理エラー: ' + String(err))
    } finally {
      setIsVideoProcessing(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setImageCount(files.length)
    setIsImageProcessing(true)

    try {
      const formData = new FormData()
      for (const file of Array.from(files)) {
        formData.append('images', file)
      }
      const res = await fetch('/api/receipt/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `サーバーエラー (${res.status})`)
      }
      if (data.receipts && data.receipts.length > 0) {
        setReceipts(prev => [...data.receipts, ...prev])
      }
    } catch (err) {
      console.error('Receipt analyze error:', err)
      alert('エラー: ' + String(err))
    } finally {
      setIsImageProcessing(false)
    }
  }

  function confirmReceipt(id: string) {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r))
    setSelectedId(null)
  }

  function rejectReceipt(id: string) {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
    setSelectedId(null)
  }

  function saveCategory(id: string) {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, accountCategory: editCategory, status: 'confirmed' } : r))
    setEditingId(null)
  }

  function deleteReceipt(id: string) {
    if (!confirm('この領収書を削除しますか？')) return
    setReceipts(prev => prev.filter(r => r.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function openEditModal(receipt: Receipt) {
    setEditModalId(receipt.id)
    setEditFields({
      date: receipt.date,
      vendor: receipt.vendor,
      amount: String(receipt.amount),
      purpose: receipt.purpose,
      accountCategory: receipt.accountCategory,
      taxRate: receipt.taxRate,
    })
  }

  function saveEditModal() {
    if (!editModalId) return
    setReceipts(prev => prev.map(r => r.id === editModalId ? {
      ...r,
      date: editFields.date,
      vendor: editFields.vendor,
      amount: parseInt(editFields.amount) || 0,
      purpose: editFields.purpose,
      accountCategory: editFields.accountCategory,
      taxRate: editFields.taxRate,
      status: 'confirmed',
    } : r))
    setEditModalId(null)
  }

  function exportCSV() {
    const header = '日付,支払先,金額,用途,勘定科目,税率,ステータス,抽出元\n'
    const rows = receipts
      .filter(r => r.status === 'confirmed')
      .map(r => `${r.date},${r.vendor},${r.amount},${r.purpose},${r.accountCategory},${r.taxRate}%,${statusConfig[r.status].label},${r.sourceType === 'video' ? '動画' : '画像'}`)
      .join('\n')
    const blob = new Blob(['﻿' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = '領収書仕分け.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppLayout>
      <div className="max-w-7xl space-y-6">

        {/* ページヘッダー */}
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <ScanLine size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">領収書AI仕分け</h1>
            </div>
            <p className="text-sm text-slate-500 ml-10.5">動画・画像をアップロードしてAIが自動仕分けします</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download size={15} />CSV出力
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-sm"
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
              <Sheet size={15} />スプレッドシートに連携
            </button>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '今月の処理件数', value: `${stats.total}件`, sub: `動画抽出 ${stats.fromVideo}件`, color: 'bg-blue-500' },
            { label: '仕分け待ち',     value: `${stats.pending}件`, sub: '確認が必要',          color: stats.pending > 0 ? 'bg-amber-500' : 'bg-emerald-500' },
            { label: '確認済み',       value: `${receipts.filter(r => r.status === 'confirmed').length}件`, sub: '処理完了',  color: 'bg-emerald-500' },
            { label: '確認済み合計金額', value: formatCurrency(stats.totalAmount), sub: '仕分け確認済み', color: 'bg-indigo-500' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', card.color)}>
                <ScanLine size={15} className="text-white" />
              </div>
              <p className="text-lg font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* アップロードエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* 動画アップロード */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Video size={16} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-800">動画アップロード</h3>
              <span className="ml-auto text-[11px] text-slate-400">推奨: 複数の領収書を動画撮影してアップロード</span>
            </div>
            <div className="p-5">
              {isVideoProcessing ? (
                <div className="border-2 border-blue-200 rounded-xl p-6 text-center bg-blue-50">
                  <Loader2 size={28} className="text-blue-500 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-blue-700 mb-1">動画を解析中...</p>
                  <p className="text-xs text-blue-500">フレーム抽出 → OCR → 勘定科目提案</p>
                </div>
              ) : videoFileName ? (
                <div className="border-2 border-emerald-200 rounded-xl p-4 bg-emerald-50 flex items-center gap-3">
                  <Film size={20} className="text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-800 truncate">{videoFileName}</p>
                    <p className="text-xs text-emerald-600">解析完了 — 領収書を追加検出しました</p>
                  </div>
                  <button onClick={() => setVideoFileName(null)} className="text-emerald-400 hover:text-emerald-600">
                    <RotateCcw size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => videoRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                    <Video size={22} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">動画ファイルをドロップ</p>
                  <p className="text-xs text-slate-400">または<span className="text-blue-500 font-medium">クリックして選択</span></p>
                  <p className="text-[11px] text-slate-400 mt-2">MP4 / MOV · 最大500MB</p>
                </button>
              )}
              <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              <div className="mt-3 bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={12} className="text-indigo-500" />
                  <p className="text-[11px] font-semibold text-slate-600">動画解析の流れ</p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                  {['動画撮影', '→ フレーム抽出', '→ 領収書検出', '→ OCR読み取り', '→ 勘定科目提案'].map((s, i) => (
                    <span key={i} className={s.startsWith('→') ? 'text-slate-400' : 'font-medium text-slate-600'}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 画像アップロード */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <ImageIcon size={16} className="text-violet-600" />
              <h3 className="text-sm font-semibold text-slate-800">画像アップロード</h3>
              <span className="ml-auto text-[11px] text-slate-400">複数枚同時対応</span>
            </div>
            <div className="p-5">
              {isImageProcessing ? (
                <div className="border-2 border-violet-200 rounded-xl p-6 text-center bg-violet-50">
                  <Loader2 size={28} className="text-violet-500 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-violet-700">{imageCount}枚のOCR解析中...</p>
                </div>
              ) : imageCount > 0 ? (
                <div className="border-2 border-emerald-200 rounded-xl p-4 bg-emerald-50 flex items-center gap-3">
                  <ImageIcon size={20} className="text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-800">{imageCount}枚をアップロード済み</p>
                    <p className="text-xs text-emerald-600">OCR解析・仕分け完了</p>
                  </div>
                  <button onClick={() => setImageCount(0)} className="text-emerald-400 hover:text-emerald-600">
                    <RotateCcw size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => imageRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-violet-300 hover:bg-violet-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-violet-100 transition-colors">
                    <Upload size={22} className="text-violet-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">画像をドロップ</p>
                  <p className="text-xs text-slate-400">または<span className="text-violet-500 font-medium">クリックして選択</span></p>
                  <p className="text-[11px] text-slate-400 mt-2">JPG / PNG / HEIC · 複数枚可</p>
                </button>
              )}
              <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              <div className="mt-3 bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={12} className="text-violet-500" />
                  <p className="text-[11px] font-semibold text-slate-600">接続予定のAPI</p>
                </div>
                <p className="text-[11px] text-slate-500">Google Cloud Vision API / Gemini API / OpenAI Vision API</p>
              </div>
            </div>
          </div>
        </div>

        {/* 領収書リスト */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-800">抽出済み領収書一覧</h3>
            <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{filtered.length}件</span>
            <div className="ml-auto flex gap-1.5">
              {(['all', 'pending', 'confirmed', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors',
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  )}
                >
                  {f === 'all' ? `すべて (${receipts.length})` :
                   f === 'pending' ? `未確認 (${receipts.filter(r => r.status === 'pending').length})` :
                   f === 'confirmed' ? `確認済み (${receipts.filter(r => r.status === 'confirmed').length})` :
                   `除外 (${receipts.filter(r => r.status === 'rejected').length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['支払日', '支払先', '金額', '用途', '勘定科目候補', '税率', '仕分け理由', 'ステータス', '操作'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(receipt => {
                  const sc = statusConfig[receipt.status]
                  const StatusIcon = sc.icon
                  return (
                    <tr key={receipt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">{receipt.date}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-semibold text-slate-800 max-w-[140px] truncate">{receipt.vendor}</p>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block',
                          receipt.sourceType === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600')}>
                          {receipt.sourceType === 'video' ? '動画' : '画像'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(receipt.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-[120px]">
                        <span className="truncate block">{receipt.purpose}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {editingId === receipt.id ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={editCategory}
                              onChange={e => setEditCategory(e.target.value)}
                              className="text-xs border border-blue-300 rounded-lg px-2 py-1 bg-white"
                            >
                              {ACCOUNT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button onClick={() => saveCategory(receipt.id)}
                              className="text-[11px] bg-blue-600 text-white px-2 py-1 rounded-lg">保存</button>
                            <button onClick={() => setEditingId(null)}
                              className="text-[11px] text-slate-400 hover:text-slate-600"><X size={12} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                              {receipt.accountCategory}
                            </span>
                            {receipt.accountCategorySuggestions.length > 1 && (
                              <span className="text-[10px] text-slate-400">
                                <ChevronDown size={10} />
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                        {receipt.taxRate}%
                      </td>
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="text-[11px] text-slate-500 line-clamp-2">{receipt.reason}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border', sc.color)}>
                          <StatusIcon size={11} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setSelectedId(receipt.id)}
                            className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <Eye size={12} />詳細
                          </button>
                          <button
                            onClick={() => openEditModal(receipt)}
                            className="text-[11px] text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1"
                          >
                            <Edit3 size={12} />修正
                          </button>
                          {receipt.status === 'pending' && (
                            <button
                              onClick={() => confirmReceipt(receipt.id)}
                              className="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                            >
                              <CheckCircle2 size={12} />確定
                            </button>
                          )}
                          <button
                            onClick={() => deleteReceipt(receipt.id)}
                            className="text-[11px] text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                          >
                            <X size={12} />削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 編集モーダル */}
        {editModalId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 100%)' }}>
                <div className="flex items-center gap-2">
                  <Edit3 size={16} className="text-violet-600" />
                  <h3 className="text-sm font-bold text-slate-800">領収書を修正</h3>
                </div>
                <button onClick={() => setEditModalId(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">支払日</label>
                    <input type="date" value={editFields.date}
                      onChange={e => setEditFields(f => ({ ...f, date: e.target.value }))}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">金額（円）</label>
                    <input type="number" value={editFields.amount}
                      onChange={e => setEditFields(f => ({ ...f, amount: e.target.value }))}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">支払先</label>
                  <input type="text" value={editFields.vendor}
                    onChange={e => setEditFields(f => ({ ...f, vendor: e.target.value }))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">用途</label>
                  <input type="text" value={editFields.purpose}
                    onChange={e => setEditFields(f => ({ ...f, purpose: e.target.value }))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">勘定科目</label>
                    <select value={editFields.accountCategory}
                      onChange={e => setEditFields(f => ({ ...f, accountCategory: e.target.value }))}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400">
                      {ACCOUNT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">税率</label>
                    <select value={editFields.taxRate}
                      onChange={e => setEditFields(f => ({ ...f, taxRate: Number(e.target.value) as 8 | 10 }))}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400">
                      <option value={10}>10%</option>
                      <option value={8}>8%（軽減税率）</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={saveEditModal}
                  className="flex-1 bg-violet-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />保存して確定
                </button>
                <button onClick={() => setEditModalId(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 詳細モーダル */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)' }}>
                <div className="flex items-center gap-2">
                  <ScanLine size={16} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800">領収書詳細</h3>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '支払日', value: selected.date },
                    { label: '金額', value: formatCurrency(selected.amount) },
                    { label: '支払先', value: selected.vendor },
                    { label: '用途', value: selected.purpose },
                    { label: '勘定科目', value: selected.accountCategory },
                    { label: '税率', value: `${selected.taxRate}%` },
                    { label: '取得方法', value: selected.sourceType === 'video' ? '動画から抽出' : '画像アップロード' },
                    { label: '抽出日時', value: new Date(selected.extractedAt).toLocaleString('ja-JP') },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[11px] text-slate-400 font-medium mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-[11px] text-blue-600 font-semibold mb-1 flex items-center gap-1">
                    <Sparkles size={11} />AI仕分け理由
                  </p>
                  <p className="text-xs text-blue-800">{selected.reason}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-2">勘定科目の候補</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.accountCategorySuggestions.map(cat => (
                      <button
                        key={cat}
                        className={cn(
                          'text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors',
                          cat === selected.accountCategory
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                {selected.status === 'pending' && (
                  <>
                    <button
                      onClick={() => confirmReceipt(selected.id)}
                      className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} />この仕分けで確定
                    </button>
                    <button
                      onClick={() => rejectReceipt(selected.id)}
                      className="px-4 py-2.5 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      除外
                    </button>
                  </>
                )}
                {selected.status !== 'pending' && (
                  <button
                    onClick={() => setSelectedId(null)}
                    className="flex-1 bg-slate-100 text-slate-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    閉じる
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI接続予定の注記 */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <p className="text-xs font-semibold text-slate-600">プロトタイプについて</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            現在はモックデータで動作しています。本番環境では <strong>Google Cloud Vision API（OCR）</strong>、<strong>Gemini API / OpenAI Vision API（AI仕分け）</strong>、<strong>Google Sheets / GAS（データ出力）</strong>、<strong>Google Drive（ファイル保存）</strong> を接続します。
          </p>
        </div>

      </div>
    </AppLayout>
  )
}
