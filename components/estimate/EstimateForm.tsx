'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Download, Save, FileText, RotateCcw } from 'lucide-react'

type EstimateItem = {
  id: string
  name: string
  quantity: number
  unitPrice: number
  note: string
}

type Estimate = {
  id: string
  estimateNo: string
  clientName: string
  issueDate: string
  validUntil: string
  items: EstimateItem[]
  taxRate: number
  notes: string
  companyName: string
  savedAt: string
}

const genId = () => Math.random().toString(36).slice(2)

const newItem = (): EstimateItem => ({
  id: genId(),
  name: '', quantity: 1, unitPrice: 0, note: '',
})

const genNo = () => {
  const d = new Date()
  return `EST-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`
}

const newEstimateDraft = (): Estimate => ({
  id: genId(),
  estimateNo: genNo(),
  clientName: '',
  issueDate: new Date().toISOString().split('T')[0],
  validUntil: '',
  items: [newItem()],
  taxRate: 10,
  notes: '',
  companyName: '',
  savedAt: '',
})

export function EstimateForm() {
  const printRef = useRef<HTMLDivElement>(null)

  const [estimate, setEstimate] = useState<Estimate>(newEstimateDraft)
  const [savedList, setSavedList] = useState<Estimate[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    let alive = true
    queueMicrotask(() => {
      if (!alive) return
      try {
        const saved = localStorage.getItem('estimates')
        if (saved) setSavedList(JSON.parse(saved))
      } catch {}
    })
    return () => { alive = false }
  }, [])

  const subtotal = estimate.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const tax = Math.floor(subtotal * estimate.taxRate / 100)
  const total = subtotal + tax

  function addItem() {
    setEstimate(e => ({ ...e, items: [...e.items, newItem()] }))
  }

  function removeItem(id: string) {
    setEstimate(e => ({ ...e, items: e.items.filter(i => i.id !== id) }))
  }

  function updateItem(id: string, key: keyof EstimateItem, value: string | number) {
    setEstimate(e => ({ ...e, items: e.items.map(i => i.id === id ? { ...i, [key]: value } : i) }))
  }

  function saveEstimate() {
    const saved = { ...estimate, savedAt: new Date().toISOString() }
    const updated = [saved, ...savedList.filter(s => s.id !== saved.id)]
    setSavedList(updated)
    try { localStorage.setItem('estimates', JSON.stringify(updated)) } catch {}
    alert('保存しました')
  }

  function loadEstimate(e: Estimate) {
    setEstimate(e)
    setShowHistory(false)
  }

  function deleteEstimate(id: string) {
    const updated = savedList.filter(s => s.id !== id)
    setSavedList(updated)
    try { localStorage.setItem('estimates', JSON.stringify(updated)) } catch {}
  }

  function newEstimate() {
    setEstimate(newEstimateDraft())
  }

  function printEstimate() {
    window.print()
  }

  const fmt = (n: number) => `¥${n.toLocaleString('ja-JP')}`

  return (
    <div className="max-w-4xl space-y-4">
      {/* 印刷スタイル */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 40px; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ヘッダー操作 */}
      <div className="no-print flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">見積書作成</h1>
            <p className="text-xs text-slate-500">見積書の作成・PDF出力・保存ができます</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
            <FileText size={14} />履歴 ({savedList.length})
          </button>
          <button onClick={newEstimate}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
            <RotateCcw size={14} />新規
          </button>
          <button onClick={saveEstimate}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl">
            <Save size={14} />保存
          </button>
          <button onClick={printEstimate}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl">
            <Download size={14} />PDF出力
          </button>
        </div>
      </div>

      {/* 履歴パネル */}
      {showHistory && (
        <div className="no-print bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">保存済み見積書</h3>
          {savedList.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">保存された見積書はありません</p>
          ) : (
            <div className="space-y-2">
              {savedList.map(s => (
                <div key={s.id} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{s.estimateNo} — {s.clientName || '（顧客名未設定）'}</p>
                    <p className="text-[11px] text-slate-400">{fmt(s.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) * (1 + s.taxRate/100))} · {new Date(s.savedAt).toLocaleDateString('ja-JP')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => loadEstimate(s)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium">開く</button>
                    <button onClick={() => deleteEstimate(s.id)}
                      className="text-xs text-red-400 hover:text-red-600">削除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 見積書本体（印刷対象） */}
      <div id="print-area" ref={printRef}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">

        {/* タイトル */}
        <div className="text-center border-b border-slate-100 pb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-widest">見　積　書</h2>
          <p className="text-xs text-slate-400 mt-1">見積番号: {estimate.estimateNo}</p>
        </div>

        {/* 宛先・発行者情報 */}
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">宛先</label>
              <input value={estimate.clientName}
                onChange={e => setEstimate(es => ({ ...es, clientName: e.target.value }))}
                placeholder="顧客名・会社名"
                className="w-full text-sm font-semibold text-slate-800 border-b-2 border-slate-200 focus:border-blue-400 outline-none py-1 bg-transparent" />
              <span className="text-sm text-slate-600"> 御中</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-right">
            <input value={estimate.companyName}
              onChange={e => setEstimate(es => ({ ...es, companyName: e.target.value }))}
              placeholder="会社名・事務所名"
              className="text-sm font-semibold text-slate-800 border-b border-slate-200 focus:border-blue-400 outline-none py-1 bg-transparent text-right w-full" />
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <span className="text-right">発行日</span>
              <input type="date" value={estimate.issueDate}
                onChange={e => setEstimate(es => ({ ...es, issueDate: e.target.value }))}
                className="text-xs text-slate-700 border-b border-slate-200 focus:border-blue-400 outline-none bg-transparent text-right" />
              <span className="text-right">有効期限</span>
              <input type="date" value={estimate.validUntil}
                onChange={e => setEstimate(es => ({ ...es, validUntil: e.target.value }))}
                className="text-xs text-slate-700 border-b border-slate-200 focus:border-blue-400 outline-none bg-transparent text-right" />
            </div>
          </div>
        </div>

        {/* 合計金額 */}
        <div className="bg-slate-50 rounded-xl px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">合計金額（税込）</span>
          <span className="text-2xl font-bold text-blue-700">{fmt(total)}</span>
        </div>

        {/* 明細テーブル */}
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                {['品目・サービス名', '数量', '単価', '金額'].map(h => (
                  <th key={h} className={`px-3 py-2.5 text-xs font-semibold text-left ${h === '数量' || h === '単価' || h === '金額' ? 'text-right w-24' : ''}`}>{h}</th>
                ))}
                <th className="w-8 no-print" />
              </tr>
            </thead>
            <tbody>
              {estimate.items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="px-3 py-2">
                    <input value={item.name} placeholder="品目・サービス名"
                      onChange={e => updateItem(item.id, 'name', e.target.value)}
                      className="w-full text-sm text-slate-800 outline-none bg-transparent border-b border-transparent focus:border-blue-300" />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input type="number" value={item.quantity} min={1}
                      onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-16 text-sm text-right text-slate-700 outline-none bg-transparent border-b border-transparent focus:border-blue-300" />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input type="number" value={item.unitPrice} min={0} step={1000}
                      onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                      className="w-24 text-sm text-right text-slate-700 outline-none bg-transparent border-b border-transparent focus:border-blue-300" />
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-medium text-slate-800">
                    {fmt(item.quantity * item.unitPrice)}
                  </td>
                  <td className="px-1 no-print">
                    <button onClick={() => removeItem(item.id)}
                      className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-400 rounded-lg">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addItem}
            className="no-print mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5">
            <Plus size={13} />行を追加
          </button>

          {/* 小計・消費税・合計 */}
          <div className="mt-4 border-t border-slate-200 pt-3 space-y-1.5 max-w-xs ml-auto">
            <div className="flex justify-between text-sm text-slate-500">
              <span>小計</span><span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 items-center">
              <span>消費税</span>
              <div className="flex items-center gap-2">
                <select value={estimate.taxRate}
                  onChange={e => setEstimate(es => ({ ...es, taxRate: Number(e.target.value) }))}
                  className="no-print text-xs border border-slate-200 rounded px-1 py-0.5">
                  <option value={10}>10%</option>
                  <option value={8}>8%</option>
                </select>
                <span>{fmt(tax)}</span>
              </div>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>合計</span><span className="text-blue-700">{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* 備考 */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">備考</p>
          <textarea value={estimate.notes} rows={3}
            onChange={e => setEstimate(es => ({ ...es, notes: e.target.value }))}
            placeholder="お支払いは納品後30日以内にお願いします。"
            className="w-full text-xs text-slate-600 outline-none bg-transparent resize-none border border-slate-100 rounded-lg p-2 focus:border-blue-200" />
        </div>
      </div>
    </div>
  )
}
