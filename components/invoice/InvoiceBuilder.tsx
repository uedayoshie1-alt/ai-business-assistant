'use client'

import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X, Send, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react'
import * as XLSX from 'xlsx'

const GAS_ENDPOINT = process.env.NEXT_PUBLIC_GAS_ENDPOINT ?? ''

interface LineItem {
  name: string
  quantity: number
  unit: string
  unitPrice: number
  taxRate: 10 | 8
  amount: number
}

interface InvoiceInfo {
  invoiceTo: string
  registrationNo: string
  subject: string
  issueDate: string
  dueDate: string
  memo: string
}

type Status = 'idle' | 'uploading' | 'preview' | 'sending' | 'done' | 'error'

const emptyItem = (): LineItem => ({ name: '', quantity: 1, unit: '式', unitPrice: 0, taxRate: 10, amount: 0 })

export function InvoiceBuilder() {
  const [status, setStatus] = useState<Status>('idle')
  const [items, setItems] = useState<LineItem[]>([])
  const [fileName, setFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [info, setInfo] = useState<InvoiceInfo>({
    invoiceTo: '',
    registrationNo: 'T',
    subject: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    memo: '',
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const parsePdf = async (file: File) => {
    setFileName(file.name)
    setStatus('uploading')
    setErrorMsg('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/invoice/parse-pdf', { method: 'POST', body: formData })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`サーバーエラー(${res.status}): ${text.slice(0, 100)}`)
      }
      const data = await res.json()
      if (data.items?.length > 0) setItems(data.items)
      setInfo(prev => ({
        ...prev,
        invoiceTo: data.invoiceTo || prev.invoiceTo,
        subject: data.subject || prev.subject,
        issueDate: data.issueDate || prev.issueDate,
        dueDate: data.dueDate || prev.dueDate,
        registrationNo: data.registrationNo || prev.registrationNo,
        memo: data.memo || prev.memo,
      }))
      setStatus('preview')
    } catch (e: unknown) {
      setErrorMsg(`PDF読み込みエラー: ${e instanceof Error ? e.message : String(e)}`)
      setStatus('idle')
    }
  }

  const parseFile = async (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      return parsePdf(file)
    }
    setFileName(file.name)
    setStatus('uploading')
    setErrorMsg('')
    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

      if (rows.length < 2) {
        setErrorMsg('データが空です。')
        setStatus('idle')
        return
      }

      // ヘッダー行からカラム位置を自動判別
      const headers = rows[0].map((h) => String(h ?? '').trim())
      const find = (keywords: string[]) =>
        headers.findIndex((h) => keywords.some((k) => h.includes(k)))

      const colName      = find(['品名', '商品名', '工事項目', '項目', '内容', '摘要'])
      const colQty       = find(['数量'])
      const colUnit      = find(['単位'])
      const colPrice     = find(['単価'])
      const colTax       = find(['税率'])
      const colAmount    = find(['金額'])

      // 品名・単価が見つからなければ列番号でフォールバック
      const nameIdx  = colName  >= 0 ? colName  : 0
      const qtyIdx   = colQty   >= 0 ? colQty   : 1
      const unitIdx  = colUnit  >= 0 ? colUnit  : 2
      const priceIdx = colPrice >= 0 ? colPrice : 3
      const taxIdx   = colTax   >= 0 ? colTax   : -1
      const amtIdx   = colAmount >= 0 ? colAmount : -1

      const parsed: LineItem[] = []
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row || !row[nameIdx]) continue
        const name      = String(row[nameIdx]).trim()
        if (!name) continue
        const quantity  = Number(row[qtyIdx])  || 1
        const unit      = String(row[unitIdx] ?? '式').trim() || '式'
        const unitPrice = Number(row[priceIdx]) || 0
        const taxRate   = taxIdx >= 0 ? (Number(row[taxIdx]) === 8 ? 8 : 10) : 10
        const amount    = amtIdx >= 0 && Number(row[amtIdx])
          ? Number(row[amtIdx])
          : quantity * unitPrice
        parsed.push({ name, quantity, unit, unitPrice, taxRate: taxRate as 10 | 8, amount })
      }

      if (parsed.length === 0) {
        setErrorMsg('データが読み込めませんでした。ヘッダー行（1行目）に「品名」「数量」「単価」などの列名が含まれているか確認してください。')
        setStatus('idle')
        return
      }
      setItems(parsed)
      setStatus('preview')
    } catch {
      setErrorMsg('ファイルの読み込みに失敗しました。CSV または Excel（.xlsx）形式をお使いください。')
      setStatus('idle')
    }
  }

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) parseFile(f) }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) parseFile(f) }

  const updateItem = (i: number, key: keyof LineItem, value: string) => {
    setItems((prev) => {
      const next = [...prev]
      const item = { ...next[i] }
      if (key === 'name' || key === 'unit') {
        (item[key] as string) = value
      } else if (key === 'taxRate') {
        item.taxRate = Number(value) === 8 ? 8 : 10
      } else {
        (item[key] as number) = Number(value)
      }
      item.amount = item.quantity * item.unitPrice
      next[i] = item
      return next
    })
  }

  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))
  const addItem = () => setItems((prev) => [...prev, emptyItem()])

  // 税率別集計
  const items10 = items.filter((r) => r.taxRate === 10)
  const items8 = items.filter((r) => r.taxRate === 8)
  const subtotal10 = items10.reduce((s, r) => s + r.amount, 0)
  const subtotal8 = items8.reduce((s, r) => s + r.amount, 0)
  const tax10 = Math.floor(subtotal10 * 0.1)
  const tax8 = Math.floor(subtotal8 * 0.08)
  const total = subtotal10 + subtotal8 + tax10 + tax8

  const handleSend = async () => {
    if (!GAS_ENDPOINT) {
      setErrorMsg('GAS WebApp URLが設定されていません。環境変数 NEXT_PUBLIC_GAS_ENDPOINT を設定してください。')
      return
    }
    setStatus('sending')
    setErrorMsg('')
    try {
      const payload = { info, items, subtotal10, subtotal8, tax10, tax8, total }
      const res = await fetch(GAS_ENDPOINT, { method: 'POST', body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.url) { setResultUrl(data.url); setStatus('done') }
      else throw new Error(data.error ?? '不明なエラー')
    } catch (e: unknown) {
      setErrorMsg(`送信に失敗しました: ${e instanceof Error ? e.message : String(e)}`)
      setStatus('preview')
    }
  }

  const fmt = (n: number) => n.toLocaleString('ja-JP')

  return (
    <div className="max-w-5xl space-y-5">
      {/* 説明バナー */}
      <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
        <div className="w-1.5 h-10 bg-teal-400 rounded-full shrink-0" />
        <div>
          <p className="text-sm font-medium text-teal-900">CSV・Excel・PDFをアップロードしてインボイス対応の請求明細書を自動生成します</p>
          <p className="text-xs text-teal-600 mt-0.5">CSV/Excel列の順番：<span className="font-semibold">品名 / 数量 / 単位 / 単価 / 税率（10 or 8）</span>　／　PDF：AIが自動解析</p>
        </div>
      </div>

      {/* アップロード */}
      {status === 'idle' && (
        <div
          onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
        >
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
            <Upload size={24} className="text-teal-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">ファイルをドラッグ＆ドロップ</p>
            <p className="text-xs text-gray-400 mt-1">または クリックしてファイルを選択</p>
            <p className="text-xs text-gray-300 mt-2">対応形式：CSV / Excel（.xlsx, .xls）/ PDF</p>
          </div>
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.pdf" className="hidden" onChange={handleFileChange} />
        </div>
      )}

      {status === 'uploading' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-4">
          <span className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">ファイルを読み込んでいます…</p>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {(status === 'preview' || status === 'sending') && (
        <>
          {/* ファイル名 */}
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <FileSpreadsheet size={16} className="text-teal-500" />
            <span className="text-sm text-gray-700 flex-1">{fileName}</span>
            <button onClick={() => { setStatus('idle'); setItems([]); setFileName('') }} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 明細書情報 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <p className="text-sm font-semibold text-gray-800 pb-3 border-b border-gray-50">明細書情報</p>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">宛先（御中）</label>
                <input value={info.invoiceTo} onChange={(e) => setInfo((p) => ({ ...p, invoiceTo: e.target.value }))}
                  placeholder="例：株式会社〇〇" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">インボイス登録番号</label>
                <input value={info.registrationNo} onChange={(e) => setInfo((p) => ({ ...p, registrationNo: e.target.value }))}
                  placeholder="T1234567890123" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">件名</label>
                <input value={info.subject} onChange={(e) => setInfo((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="例：2024年4月分 講座受講費" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">発行日</label>
                  <input type="date" value={info.issueDate} onChange={(e) => setInfo((p) => ({ ...p, issueDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">支払期限</label>
                  <input type="date" value={info.dueDate} onChange={(e) => setInfo((p) => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">備考</label>
                <textarea value={info.memo} onChange={(e) => setInfo((p) => ({ ...p, memo: e.target.value }))}
                  placeholder="振込先口座情報など" rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none" />
              </div>
            </div>

            {/* 明細プレビュー */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-800 pb-3 border-b border-gray-50 mb-3">明細内容</p>

              {/* ヘッダー */}
              <div className="grid grid-cols-[1fr_48px_44px_72px_52px_16px] gap-1 mb-1">
                {['品名', '数量', '単位', '単価', '税率', ''].map((h) => (
                  <span key={h} className="text-[10px] text-gray-400 text-center">{h}</span>
                ))}
              </div>

              <div className="space-y-1.5 mb-3">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_48px_44px_72px_52px_16px] gap-1 items-center">
                    <input value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)}
                      placeholder="品名" className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400" />
                    <input type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                      className="px-1 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 text-right" />
                    <input value={item.unit} onChange={(e) => updateItem(i, 'unit', e.target.value)}
                      placeholder="式" className="px-1 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 text-center" />
                    <input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                      className="px-1 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 text-right" />
                    <select value={item.taxRate} onChange={(e) => updateItem(i, 'taxRate', e.target.value)}
                      className="px-1 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400">
                      <option value={10}>10%</option>
                      <option value={8}>8%※</option>
                    </select>
                    <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400"><X size={12} /></button>
                  </div>
                ))}
              </div>
              <button onClick={addItem} className="text-xs text-teal-600 hover:text-teal-700 font-medium mb-4">+ 行を追加</button>

              {/* 集計 */}
              <div className="border-t border-gray-100 pt-3 space-y-1 text-xs">
                {subtotal8 > 0 && <>
                  <div className="flex justify-between text-gray-500"><span>小計（10%対象）</span><span>¥{fmt(subtotal10)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>小計（8%対象）</span><span>¥{fmt(subtotal8)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>消費税（10%）</span><span>¥{fmt(tax10)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>消費税（8%）</span><span>¥{fmt(tax8)}</span></div>
                </>}
                {subtotal8 === 0 && <>
                  <div className="flex justify-between text-gray-500"><span>小計</span><span>¥{fmt(subtotal10)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>消費税（10%）</span><span>¥{fmt(tax10)}</span></div>
                </>}
                <div className="flex justify-between font-bold text-gray-900 text-sm pt-1 border-t border-gray-100">
                  <span>合計（税込）</span><span>¥{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <button onClick={handleSend} disabled={status === 'sending' || items.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {status === 'sending'
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />明細書を生成中…</>
              : <><Send size={16} />GASで明細書を生成する</>}
          </button>

          {!GAS_ENDPOINT && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">GAS WebApp URLが未設定です。Vercelの環境変数 <span className="font-mono font-semibold">NEXT_PUBLIC_GAS_ENDPOINT</span> を設定してください。</p>
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
            <p className="text-base font-semibold text-gray-900">明細書が生成されました</p>
            <p className="text-xs text-gray-400 mt-1">Googleドライブに保存されています</p>
          </div>
          <a href={resultUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors">
            <ExternalLink size={14} />明細書を開く（PDF）
          </a>
          <button onClick={() => { setStatus('idle'); setItems([]); setFileName(''); setResultUrl('') }}
            className="text-xs text-gray-400 hover:text-gray-600">新しい明細書を作成する</button>
        </div>
      )}
    </div>
  )
}
