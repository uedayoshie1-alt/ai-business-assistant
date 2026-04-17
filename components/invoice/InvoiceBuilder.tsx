'use client'

import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X, Send, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react'
import * as XLSX from 'xlsx'

// ここにデプロイしたGAS WebAppのURLを貼る
const GAS_ENDPOINT = process.env.NEXT_PUBLIC_GAS_ENDPOINT ?? ''

interface LineItem {
  name: string
  quantity: number
  unitPrice: number
  amount: number
}

interface InvoiceInfo {
  invoiceTo: string
  issueDate: string
  dueDate: string
  invoiceNumber: string
  memo: string
}

type Status = 'idle' | 'uploading' | 'preview' | 'sending' | 'done' | 'error'

export function InvoiceBuilder() {
  const [status, setStatus] = useState<Status>('idle')
  const [items, setItems] = useState<LineItem[]>([])
  const [fileName, setFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [info, setInfo] = useState<InvoiceInfo>({
    invoiceTo: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    memo: '',
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const parseFile = async (file: File) => {
    setFileName(file.name)
    setStatus('uploading')
    setErrorMsg('')

    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

      // ヘッダー行を除いた行をパース
      const parsed: LineItem[] = []
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row || row.length < 2) continue
        const name = String(row[0] ?? '').trim()
        const quantity = Number(row[1]) || 1
        const unitPrice = Number(row[2]) || 0
        if (!name) continue
        parsed.push({ name, quantity, unitPrice, amount: quantity * unitPrice })
      }

      if (parsed.length === 0) {
        setErrorMsg('データが読み込めませんでした。列の順番：品名 / 数量 / 単価 になっているか確認してください。')
        setStatus('idle')
        return
      }

      setItems(parsed)
      setStatus('preview')
    } catch {
      setErrorMsg('ファイルの読み込みに失敗しました。CSV または Excel（.xlsx）形式のファイルをお使いください。')
      setStatus('idle')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  const updateItem = (i: number, key: keyof LineItem, value: string) => {
    setItems((prev) => {
      const next = [...prev]
      const item = { ...next[i], [key]: key === 'name' ? value : Number(value) }
      item.amount = item.quantity * item.unitPrice
      next[i] = item
      return next
    })
  }

  const removeItem = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  const addItem = () => {
    setItems((prev) => [...prev, { name: '', quantity: 1, unitPrice: 0, amount: 0 }])
  }

  const subtotal = items.reduce((s, r) => s + r.amount, 0)
  const tax = Math.floor(subtotal * 0.1)
  const total = subtotal + tax

  const handleSend = async () => {
    if (!GAS_ENDPOINT) {
      setErrorMsg('GAS WebApp URLが設定されていません。環境変数 NEXT_PUBLIC_GAS_ENDPOINT を設定してください。')
      return
    }
    setStatus('sending')
    setErrorMsg('')
    try {
      const payload = { info, items, subtotal, tax, total }
      const res = await fetch(GAS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.url) {
        setResultUrl(data.url)
        setStatus('done')
      } else {
        throw new Error(data.error ?? '不明なエラー')
      }
    } catch (e: unknown) {
      setErrorMsg(`送信に失敗しました: ${e instanceof Error ? e.message : String(e)}`)
      setStatus('preview')
    }
  }

  const fmt = (n: number) => n.toLocaleString('ja-JP')

  return (
    <div className="max-w-4xl space-y-5">
      {/* 説明バナー */}
      <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
        <div className="w-1.5 h-10 bg-teal-400 rounded-full shrink-0" />
        <div>
          <p className="text-sm font-medium text-teal-900">CSV・Excelをアップロードするだけで請求書を自動生成します</p>
          <p className="text-xs text-teal-600 mt-0.5">列の順番：<span className="font-semibold">品名 / 数量 / 単価</span>　でファイルをご用意ください</p>
        </div>
      </div>

      {/* アップロードエリア */}
      {status === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
        >
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
            <Upload size={24} className="text-teal-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">ファイルをドラッグ＆ドロップ</p>
            <p className="text-xs text-gray-400 mt-1">または クリックしてファイルを選択</p>
            <p className="text-xs text-gray-300 mt-2">対応形式：CSV / Excel（.xlsx, .xls）</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* 読み込み中 */}
      {status === 'uploading' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-4">
          <span className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">ファイルを読み込んでいます…</p>
        </div>
      )}

      {/* エラー */}
      {errorMsg && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {/* プレビュー＋請求書情報 */}
      {(status === 'preview' || status === 'sending') && (
        <>
          {/* ファイル名 */}
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <FileSpreadsheet size={16} className="text-teal-500" />
            <span className="text-sm text-gray-700 flex-1">{fileName}</span>
            <button
              onClick={() => { setStatus('idle'); setItems([]); setFileName('') }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 請求書情報 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-800 pb-3 border-b border-gray-50">請求書情報</p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">請求番号</label>
                <input
                  value={info.invoiceNumber}
                  onChange={(e) => setInfo((p) => ({ ...p, invoiceNumber: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">請求先</label>
                <input
                  value={info.invoiceTo}
                  onChange={(e) => setInfo((p) => ({ ...p, invoiceTo: e.target.value }))}
                  placeholder="例：株式会社〇〇 御中"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">発行日</label>
                  <input
                    type="date"
                    value={info.issueDate}
                    onChange={(e) => setInfo((p) => ({ ...p, issueDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">支払期限</label>
                  <input
                    type="date"
                    value={info.dueDate}
                    onChange={(e) => setInfo((p) => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">備考</label>
                <textarea
                  value={info.memo}
                  onChange={(e) => setInfo((p) => ({ ...p, memo: e.target.value }))}
                  placeholder="振込先口座情報など"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none"
                />
              </div>
            </div>

            {/* 明細プレビュー */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-800 pb-3 border-b border-gray-50 mb-3">明細内容</p>
              <div className="space-y-2 mb-3">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_60px_80px_auto] gap-1.5 items-center">
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(i, 'name', e.target.value)}
                      placeholder="品名"
                      className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                      className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 text-right"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                      className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 text-right"
                    />
                    <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-[1fr_60px_80px_auto] gap-1.5 text-[10px] text-gray-400 px-1">
                  <span>品名</span><span className="text-right">数量</span><span className="text-right">単価</span><span />
                </div>
              </div>
              <button
                onClick={addItem}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium mb-4"
              >
                + 行を追加
              </button>

              {/* 合計 */}
              <div className="border-t border-gray-100 pt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>小計</span><span>¥{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>消費税（10%）</span><span>¥{fmt(tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
                  <span>合計</span><span>¥{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <button
            onClick={handleSend}
            disabled={status === 'sending' || items.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'sending' ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                請求書を生成中…
              </>
            ) : (
              <>
                <Send size={16} />
                GASで請求書を生成する
              </>
            )}
          </button>

          {/* GAS URL未設定の注意 */}
          {!GAS_ENDPOINT && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                GAS WebApp URLが未設定です。Vercelの環境変数 <span className="font-mono font-semibold">NEXT_PUBLIC_GAS_ENDPOINT</span> にデプロイ済みのGAS URLを設定してください。
              </p>
            </div>
          )}
        </>
      )}

      {/* 完了 */}
      {status === 'done' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-teal-500" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-gray-900">請求書が生成されました</p>
            <p className="text-xs text-gray-400 mt-1">Googleドライブに保存されています</p>
          </div>
          <a
            href={resultUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors"
          >
            <ExternalLink size={14} />
            請求書を開く（PDF）
          </a>
          <button
            onClick={() => { setStatus('idle'); setItems([]); setFileName(''); setResultUrl('') }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            新しい請求書を作成する
          </button>
        </div>
      )}
    </div>
  )
}
