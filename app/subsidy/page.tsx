'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  DollarSign, Search, ChevronRight, ExternalLink, CheckCircle2,
  X, Building2, MapPin, Users, Sparkles, TrendingUp, ChevronDown,
  FileText, Calendar, Tag,
} from 'lucide-react'
import { mockSubsidies, type Subsidy, type SubsidyStatus } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { authenticatedFetch } from '@/lib/auth-fetch'

const statusConfig: Record<SubsidyStatus, { label: string; color: string }> = {
  candidate:  { label: '候補',     color: 'bg-blue-50 text-blue-700 border-blue-200' },
  reviewing:  { label: '要確認',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
  proposed:   { label: '提案済み', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  applying:   { label: '申請準備中', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  excluded:   { label: '対象外',   color: 'bg-slate-50 text-slate-500 border-slate-200' },
  completed:  { label: '申請完了', color: 'bg-violet-50 text-violet-700 border-violet-200' },
}

const CATEGORIES = ['すべて', '雇用・人材', '育児・介護', 'DX・設備投資', '人材育成', '高齢者雇用', '働き方改革', '雇用維持']
const CHALLENGES = [
  { id: 'raise_wage', label: '賃上げ予定' },
  { id: 'hire', label: '採用予定' },
  { id: 'childcare', label: '育休制度整備' },
  { id: 'dx', label: 'DX化' },
  { id: 'equipment', label: '設備投資' },
  { id: 'training', label: '人材育成' },
  { id: 'elderly', label: '高齢者雇用' },
  { id: 'disability', label: '障害者雇用' },
  { id: 'workstyle', label: '働き方改革' },
]

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#3B82F6' : score >= 40 ? '#F59E0B' : '#EF4444'
  const r = 18
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#F1F5F9" strokeWidth="3.5" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-slate-800">{score}</span>
        <span className="text-[9px] text-slate-400 leading-none">点</span>
      </div>
    </div>
  )
}

export default function SubsidyPage() {
  const [subsidies, setSubsidies] = useState<Subsidy[]>(mockSubsidies)
  const [region, setRegion] = useState('東京都')
  const [industry, setIndustry] = useState('IT・情報通信')
  const [employees, setEmployees] = useState('38')
  const [challenges, setChallenges] = useState<string[]>(['dx', 'hire', 'training'])
  const [categoryFilter, setCategoryFilter] = useState('すべて')
  const [statusFilter, setStatusFilter] = useState<'all' | SubsidyStatus>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isMatching, setIsMatching] = useState(false)
  const [hasMatched, setHasMatched] = useState(true)

  const filtered = subsidies
    .filter(s => categoryFilter === 'すべて' || s.category === categoryFilter)
    .filter(s => statusFilter === 'all' || s.status === statusFilter)
    .filter(s => s.status !== 'excluded' || statusFilter === 'excluded')
    .sort((a, b) => b.score - a.score)

  const selected = selectedId ? subsidies.find(s => s.id === selectedId) : null

  const totalAmount = '¥2,180万円'
  const topCount = subsidies.filter(s => s.score >= 70 && s.status !== 'excluded').length

  function toggleChallenge(id: string) {
    setChallenges(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  async function runMatching() {
    setIsMatching(true)
    try {
      const res = await authenticatedFetch('/api/subsidy/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, industry, employees, challenges }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'エラーが発生しました')
      if (data.subsidies?.length > 0) {
        setSubsidies(data.subsidies)
        setHasMatched(true)
      }
    } catch (err) {
      alert('マッチングエラー: ' + String(err))
    } finally {
      setIsMatching(false)
    }
  }

  function updateStatus(id: string, status: SubsidyStatus) {
    setSubsidies(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    setSelectedId(null)
  }

  return (
    <AppLayout>
      <div className="max-w-7xl space-y-5">

        {/* ヘッダー */}
        <div className="flex items-start gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <DollarSign size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">助成金・補助金マッチング</h1>
            <p className="text-sm text-slate-500 mt-0.5">顧問先の条件に合わせてAIが助成金候補をマッチングします</p>
          </div>
        </div>

        <div className="flex gap-5">

          {/* 左パネル: 検索フォーム */}
          <div className="w-72 shrink-0 space-y-4">

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">条件入力</h3>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">地域</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-blue-400"
                >
                  {['東京都', '神奈川県', '埼玉県', '千葉県', '大阪府', '愛知県', '北海道', 'その他'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">業種</label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-blue-400"
                >
                  {['IT・情報通信', '製造業', '卸売業', '飲食業', '建設業', '医療・福祉', '小売業', '教育', 'その他'].map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">従業員数</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={employees}
                    onChange={e => setEmployees(e.target.value)}
                    className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-400"
                    placeholder="38"
                  />
                  <span className="text-xs text-slate-500">名</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">課題・実施予定の取り組み</label>
                <div className="space-y-1.5">
                  {CHALLENGES.map(c => (
                    <label key={c.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        onClick={() => toggleChallenge(c.id)}
                        className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                          challenges.includes(c.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-slate-300 group-hover:border-blue-400'
                        )}
                      >
                        {challenges.includes(c.id) && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <span className="text-xs text-slate-600">{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={runMatching}
                disabled={isMatching}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
              >
                {isMatching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AIマッチング中...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />AIマッチング開始
                  </>
                )}
              </button>
            </div>

            {hasMatched && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-xs font-bold text-slate-700 mb-3">マッチング結果</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">候補件数</span>
                    <span className="text-sm font-bold text-blue-600">{topCount}件</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">提案可能金額計</span>
                    <span className="text-sm font-bold text-emerald-600">{totalAmount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右パネル: 結果一覧 */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* フィルター */}
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors',
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'candidate', 'reviewing', 'proposed', 'applying', 'completed', 'excluded'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'text-xs px-3 py-1 rounded-lg font-medium border transition-colors',
                    statusFilter === s
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  )}
                >
                  {s === 'all' ? 'すべて' : statusConfig[s].label}
                </button>
              ))}
            </div>

            {/* 結果カード */}
            <div className="space-y-3">
              {filtered.map(subsidy => {
                const sc = statusConfig[subsidy.status]
                return (
                  <div key={subsidy.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-indigo-200 transition-colors">
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <ScoreCircle score={subsidy.score} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">{subsidy.name}</h3>
                            <span className={cn('text-[11px] font-medium px-2.5 py-1 rounded-full border shrink-0', sc.color)}>
                              {sc.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="flex items-center gap-1 text-[11px] text-slate-500">
                              <MapPin size={10} />{subsidy.region}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Building2 size={10} />{subsidy.industry}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-semibold">
                              <TrendingUp size={10} />{subsidy.amount}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Calendar size={10} />期限 {subsidy.deadline}
                            </span>
                            <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', 'bg-slate-100 text-slate-600')}>
                              {subsidy.category}
                            </span>
                          </div>
                          <div className="bg-slate-50 rounded-xl px-3 py-2.5 mb-3">
                            <p className="text-[11px] font-semibold text-slate-600 mb-1">主な要件</p>
                            <ul className="space-y-0.5">
                              {subsidy.requirements.slice(0, 2).map((r, i) => (
                                <li key={i} className="text-[11px] text-slate-500 flex items-start gap-1.5">
                                  <span className="text-slate-400 mt-0.5">·</span>{r}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 mb-3">
                            <p className="text-[11px] font-semibold text-indigo-600 mb-1 flex items-center gap-1">
                              <Sparkles size={11} />顧問先への提案文
                            </p>
                            <p className="text-[11px] text-indigo-800 leading-relaxed line-clamp-2">{subsidy.proposalText}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {subsidy.status === 'candidate' && (
                              <button
                                onClick={() => updateStatus(subsidy.id, 'proposed')}
                                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-xl transition-colors"
                              >
                                提案済みにする
                              </button>
                            )}
                            {subsidy.status === 'proposed' && (
                              <button
                                onClick={() => updateStatus(subsidy.id, 'applying')}
                                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl transition-colors"
                              >
                                申請準備中にする
                              </button>
                            )}
                            {subsidy.status !== 'excluded' && subsidy.status !== 'completed' && (
                              <button
                                onClick={() => updateStatus(subsidy.id, 'excluded')}
                                className="text-xs font-medium text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                              >
                                対象外にする
                              </button>
                            )}
                            <a
                              href={subsidy.sourceUrl}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs font-medium text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                              <ExternalLink size={11} />詳細ページ
                            </a>
                            <button
                              onClick={() => setSelectedId(subsidy.id)}
                              className="flex items-center gap-1 text-xs font-medium text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors"
                            >
                              詳細・必要書類<ChevronRight size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 詳細モーダル */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
                <h3 className="text-sm font-bold text-slate-900 pr-4">{selected.name}</h3>
                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600 shrink-0">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <ScoreCircle score={selected.score} />
                  <div>
                    <p className="text-xl font-bold text-indigo-600">{selected.amount}</p>
                    <p className="text-xs text-slate-500">{selected.region} · {selected.industry}</p>
                    <p className="text-xs text-slate-500">申請期限：{selected.deadline}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2">主な要件</p>
                  <div className="space-y-1.5">
                    {selected.requirements.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2">必要書類</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.documents.map((d, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <FileText size={10} />{d}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2">次に確認すべき事項</p>
                  <div className="space-y-1.5">
                    {selected.nextSteps.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 bg-amber-50 rounded-xl px-3 py-2">
                        <span className="w-4 h-4 rounded-full bg-amber-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-indigo-700 mb-2 flex items-center gap-1">
                    <Sparkles size={12} />顧問先への提案文
                  </p>
                  <p className="text-xs text-indigo-800 leading-relaxed">{selected.proposalText}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  )
}
