'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Building2, Search, Bell, DollarSign, ChevronRight, X,
  Phone, Mail, MapPin, Users, Calendar, Tag, Plus, Eye, Loader2,
} from 'lucide-react'
import { mockClients, type Client } from '@/lib/mock-data'
import { fetchClients, upsertClient, deleteClientById } from '@/lib/db'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [dbLoading, setDbLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', industry: 'IT・情報通信', region: '東京都', employees: '', contactPerson: '', phone: '', email: '', monthlyFee: '' })

  const loadClients = useCallback(async () => {
    try {
      const data = await fetchClients()
      setClients(data.length > 0 ? data : mockClients)
    } catch { setClients(mockClients) }
    finally { setDbLoading(false) }
  }, [])

  useEffect(() => { loadClients() }, [loadClients])

  async function addClient() {
    if (!newClient.name.trim()) return
    const client: Client = {
      id: `c_${Date.now()}`,
      name: newClient.name,
      industry: newClient.industry,
      region: newClient.region,
      employees: parseInt(newClient.employees) || 0,
      size: '中小企業',
      contractDate: new Date().toISOString().split('T')[0],
      status: 'active',
      pendingAlerts: 0,
      pendingSubsidies: 0,
      monthlyFee: parseInt(newClient.monthlyFee) || 0,
      contactPerson: newClient.contactPerson,
      phone: newClient.phone,
      email: newClient.email,
      tags: [],
    }
    setClients(prev => [client, ...prev])
    await upsertClient(client)
    setShowAddModal(false)
    setNewClient({ name: '', industry: 'IT・情報通信', region: '東京都', employees: '', contactPerson: '', phone: '', email: '', monthlyFee: '' })
  }

  async function removeClient(id: string) {
    if (!confirm('この顧問先を削除しますか？')) return
    setClients(prev => prev.filter(c => c.id !== id))
    await deleteClientById(id)
  }
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = clients.filter(c =>
    c.name.includes(search) ||
    c.industry.includes(search) ||
    c.region.includes(search) ||
    c.contactPerson.includes(search)
  )

  const selected = selectedId ? clients.find(c => c.id === selectedId) : null

  const totalAlerts = clients.reduce((s, c) => s + c.pendingAlerts, 0)
  const totalSubsidies = clients.reduce((s, c) => s + c.pendingSubsidies, 0)
  const totalRevenue = clients.reduce((s, c) => s + c.monthlyFee, 0)

  return (
    <AppLayout>
      <div className="max-w-7xl space-y-5">

        {/* ヘッダー */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <Building2 size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">顧問先管理</h1>
            </div>
            <p className="text-sm text-slate-500 ml-10.5">顧問先の情報・アラート・助成金候補を一元管理します</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
            <Plus size={15} />顧問先を追加
          </button>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '顧問先数', value: `${clients.length}社`, icon: Building2, color: 'bg-violet-500' },
            { label: '未確認法改正', value: `${totalAlerts}件`, icon: Bell, color: 'bg-red-500' },
            { label: '助成金候補合計', value: `${totalSubsidies}件`, icon: DollarSign, color: 'bg-indigo-500' },
            { label: '月次顧問料合計', value: `¥${totalRevenue.toLocaleString('ja-JP')}`, icon: DollarSign, color: 'bg-emerald-500' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', c.color)}>
                <c.icon size={15} className="text-white" />
              </div>
              <p className="text-lg font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* 検索 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="顧問先名・業種・地域・担当者で検索..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['顧問先名', '業種', '地域', '従業員', '担当者', '未確認アラート', '助成金候補', '月次顧問料', '操作'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {client.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{client.industry}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={11} />{client.region}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Users size={11} />{client.employees}名
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">{client.contactPerson}</td>
                    <td className="px-4 py-4">
                      {client.pendingAlerts > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                          <Bell size={11} />{client.pendingAlerts}件
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">なし</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {client.pendingSubsidies > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                          <DollarSign size={11} />{client.pendingSubsidies}件
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">なし</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-slate-800">
                      ¥{client.monthlyFee.toLocaleString('ja-JP')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedId(client.id)}
                          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Eye size={12} />詳細
                        </button>
                        <Link href="/law-alerts"
                          className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 font-medium">
                          <Bell size={12} />アラート
                        </Link>
                        <Link href="/subsidy"
                          className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium">
                          <DollarSign size={12} />助成金
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 詳細モーダル */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 100%)' }}>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selected.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selected.industry} · {selected.region}</p>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '担当者', value: selected.contactPerson, icon: Users },
                    { label: '従業員数', value: `${selected.employees}名`, icon: Users },
                    { label: '電話番号', value: selected.phone, icon: Phone },
                    { label: 'メール', value: selected.email, icon: Mail },
                    { label: '地域', value: selected.region, icon: MapPin },
                    { label: '契約開始日', value: selected.contractDate, icon: Calendar },
                    { label: '月次顧問料', value: `¥${selected.monthlyFee.toLocaleString('ja-JP')}`, icon: DollarSign },
                    { label: '会社規模', value: selected.size, icon: Building2 },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                        <Icon size={10} />{label}
                      </p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map(tag => (
                    <span key={tag} className="text-[11px] bg-violet-50 text-violet-600 border border-violet-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Tag size={10} />{tag}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/law-alerts"
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-red-700">未確認アラート</p>
                      <p className="text-xl font-bold text-red-600">{selected.pendingAlerts}件</p>
                    </div>
                    <ChevronRight size={16} className="text-red-400" />
                  </Link>
                  <Link href="/subsidy"
                    className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-indigo-700">助成金候補</p>
                      <p className="text-xl font-bold text-indigo-600">{selected.pendingSubsidies}件</p>
                    </div>
                    <ChevronRight size={16} className="text-indigo-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 顧問先追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">顧問先を追加</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: '会社名*', key: 'name', placeholder: '株式会社〇〇' },
                { label: '担当者名', key: 'contactPerson', placeholder: '山田 太郎' },
                { label: '電話番号', key: 'phone', placeholder: '03-0000-0000' },
                { label: 'メール', key: 'email', placeholder: 'contact@example.com' },
                { label: '従業員数', key: 'employees', placeholder: '50' },
                { label: '月次顧問料（円）', key: 'monthlyFee', placeholder: '30000' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">{label}</label>
                  <input value={newClient[key as keyof typeof newClient]}
                    onChange={e => setNewClient(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">業種</label>
                  <select value={newClient.industry} onChange={e => setNewClient(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400">
                    {['IT・情報通信','製造業','卸売業','飲食業','建設業','医療・福祉','小売業','教育','その他'].map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">地域</label>
                  <select value={newClient.region} onChange={e => setNewClient(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400">
                    {['東京都','神奈川県','埼玉県','千葉県','大阪府','愛知県','北海道','その他'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={addClient}
                className="flex-1 bg-violet-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-violet-700 transition-colors">
                追加する
              </button>
              <button onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ローディング */}
      {dbLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-40">
          <Loader2 size={32} className="text-violet-500 animate-spin" />
        </div>
      )}
    </AppLayout>
  )
}
