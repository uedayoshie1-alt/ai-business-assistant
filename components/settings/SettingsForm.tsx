'use client'

import { useState, useEffect } from 'react'
import { FormField, Input, Textarea, Select, RadioGroup } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Building2, FileText, AlertTriangle, PenLine, BookTemplate, Check, User } from 'lucide-react'
import type { CompanySettings, StyleType } from '@/lib/types'
import { SETTINGS_KEY, defaultSettings, loadSettings } from '@/lib/settings'
import { supabase } from '@/lib/supabase'

const styleOptions = [
  { value: 'concise', label: '簡潔・シンプル' },
  { value: 'standard', label: '標準（バランス型）' },
  { value: 'formal', label: '丁寧・フォーマル' },
]

interface SectionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}

function SectionCard({ icon, title, description, children }: SectionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-50">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export function SettingsForm() {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [signature, setSignature] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    // Supabaseからユーザーの全設定を読み込む
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata ?? {}
      setUserEmail(data.user?.email ?? '')
      setDisplayName(meta.display_name ?? meta.name ?? '')
      setSignature(meta.signature ?? defaultSettings.signature)
      // 会社情報はSupabaseから（なければ空のデフォルト値）
      if (meta.settings) {
        setSettings({ ...defaultSettings, ...meta.settings })
      } else {
        // 新規ユーザーは空から始める（他ユーザーのlocalStorageを使わない）
        setSettings({
          ...defaultSettings,
          companyName: '',
          userName: meta.display_name ?? '',
          description: '',
          signature: meta.signature ?? '',
        })
      }
    })
  }, [])

  const update = (key: keyof CompanySettings) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setSettings({ ...settings, [key]: e.target.value })

  const handleSave = async () => {
    // SupabaseとlocalStorageの両方に保存
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    await supabase.auth.updateUser({ data: { settings } })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleProfileSave = async () => {
    setProfileLoading(true)
    await supabase.auth.updateUser({
      data: { display_name: displayName, signature }
    })
    setProfileLoading(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl space-y-5">

      {/* 個人プロフィール */}
      <SectionCard
        icon={<User size={18} className="text-indigo-600" />}
        title="個人プロフィール"
        description="ログインアカウントごとに設定できます。他のスタッフには影響しません"
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="表示名">
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="例：山田 太郎"
            />
          </FormField>
          <FormField label="メールアドレス">
            <Input value={userEmail} disabled className="bg-gray-50 text-gray-400" />
          </FormField>
        </div>
        <FormField label="署名（メール・書類に使用）">
          <Textarea
            value={signature}
            onChange={e => setSignature(e.target.value)}
            rows={4}
            placeholder={'例：\n-------\nハッピーステート株式会社\n山田 太郎\nTEL: 03-xxxx-xxxx'}
          />
        </FormField>
        <Button
          variant="primary"
          onClick={handleProfileSave}
          disabled={profileLoading}
          icon={profileSaved ? <Check size={15} /> : undefined}
        >
          {profileSaved ? '保存しました' : profileLoading ? '保存中...' : 'プロフィールを保存'}
        </Button>
      </SectionCard>

      {/* 会社情報 */}
      <SectionCard
        icon={<Building2 size={18} className="text-blue-600" />}
        title="会社情報"
        description="AI生成に使われる基本情報です。正確に入力することで品質が向上します"
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="会社名" required>
            <Input value={settings.companyName} onChange={update('companyName')} />
          </FormField>
          <FormField label="担当者名" required>
            <Input
              value={settings.userName || displayName}
              onChange={update('userName')}
              placeholder="例：山田 太郎"
            />
          </FormField>
        </div>
        <FormField label="会社・サービスの説明">
          <Textarea
            value={settings.description}
            onChange={update('description')}
            rows={3}
            placeholder="事業内容、強み、主な顧客層などを入力してください"
          />
        </FormField>
      </SectionCard>

      {/* 文体設定 */}
      <SectionCard
        icon={<PenLine size={18} className="text-purple-600" />}
        title="デフォルト文体"
        description="各機能で使用するデフォルトの文体スタイルを設定します"
      >
        <RadioGroup
          name="preferredStyle"
          options={styleOptions}
          value={settings.preferredStyle}
          onChange={(v) => setSettings({ ...settings, preferredStyle: v as StyleType })}
        />
      </SectionCard>

      {/* 商品・サービス情報 */}
      <SectionCard
        icon={<FileText size={18} className="text-green-600" />}
        title="商品 / サービス情報"
        description="提案文・メール生成時に参照されます。1行ずつ入力してください"
      >
        <Textarea
          value={settings.products}
          onChange={update('products')}
          rows={4}
          placeholder="例：
クラウド型業務管理システム「BizFlow」
在庫管理ツール「StockMate」"
        />
      </SectionCard>

      {/* 禁止表現 */}
      <SectionCard
        icon={<AlertTriangle size={18} className="text-amber-600" />}
        title="禁止表現 / 注意ワード"
        description="使用を避けるべき表現をカンマ区切りで入力してください"
      >
        <Textarea
          value={settings.prohibitedWords}
          onChange={update('prohibitedWords')}
          rows={2}
          placeholder="例：絶対、必ず、保証、最高、業界最安"
        />
      </SectionCard>

      {/* 署名 - プロフィールのsignatureと統合 */}
      <SectionCard
        icon={<PenLine size={18} className="text-blue-600" />}
        title="よく使う署名"
        description="ログインユーザーごとに設定できます。メール生成時に自動で挿入されます"
      >
        <Textarea
          value={signature}
          onChange={e => setSignature(e.target.value)}
          rows={6}
          className="font-mono text-xs"
        />
        <Button
          variant="primary"
          onClick={handleProfileSave}
          disabled={profileLoading}
          icon={profileSaved ? <Check size={15} /> : undefined}
        >
          {profileSaved ? '保存しました' : profileLoading ? '保存中...' : '署名を保存'}
        </Button>
      </SectionCard>

      {/* テンプレート管理（プレースホルダー） */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-50">
          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
            <BookTemplate size={18} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-800">テンプレート管理</p>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                次フェーズ実装予定
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">よく使う文書のテンプレートを登録・管理できます</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-400">独自テンプレートの登録・編集機能は次バージョンで追加予定です</p>
          <Button variant="secondary" disabled className="mt-3 opacity-50 cursor-not-allowed text-xs">
            テンプレートを追加（次フェーズ）
          </Button>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="lg"
          icon={saved ? <Check size={16} /> : undefined}
          onClick={handleSave}
          className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {saved ? '保存しました' : '設定を保存する'}
        </Button>
        <p className="text-xs text-gray-400">設定はAI生成時に自動的に反映されます</p>
      </div>
    </div>
  )
}
