import { AppLayout } from '@/components/layout/AppLayout'
import { StatusCards } from '@/components/dashboard/StatusCards'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentHistory } from '@/components/dashboard/RecentHistory'
import { TemplateList } from '@/components/dashboard/TemplateList'

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl">
        {/* ウェルカムメッセージ */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">おはようございます、山田さん</h2>
            <p className="text-sm text-gray-400 mt-0.5">今日もスムーズな業務をサポートします</p>
          </div>
          <div className="text-right text-sm text-gray-400">
            <p>2024年1月15日（月）</p>
          </div>
        </div>

        {/* ステータスカード */}
        <StatusCards />

        {/* クイックアクション */}
        <QuickActions />

        {/* 履歴 + テンプレート */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <RecentHistory />
          </div>
          <div className="lg:col-span-2">
            <TemplateList />
          </div>
        </div>

        {/* AIチャットボット */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">AIアシスタント</h3>
          </div>
          <iframe
            src="https://udify.app/chatbot/QgGF2govGfxmiRwK"
            style={{ width: '100%', height: '100%', minHeight: '700px' }}
            frameBorder={0}
            allow="microphone"
          />
        </div>
      </div>
    </AppLayout>
  )
}
