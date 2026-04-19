'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, ExternalLink, Play, AlertCircle, Mail } from 'lucide-react'

const STORAGE_KEY = 'gmail_gas_endpoint'

type RunResult = { processed: number; skipped: number; error?: string } | null

export function GmailAutoReply() {
  const [gasUrl, setGasUrl] = useState('')
  const [saved, setSaved] = useState(false)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResult>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) { setGasUrl(stored); setSaved(true) }
  }, [])

  const handleSaveUrl = () => {
    localStorage.setItem(STORAGE_KEY, gasUrl)
    setSaved(true)
  }

  const handleRun = async () => {
    if (!gasUrl) return
    setRunning(true)
    setResult(null)
    try {
      const res = await fetch(gasUrl, { method: 'POST', body: JSON.stringify({ action: 'run' }) })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ processed: 0, skipped: 0, error: 'GASへの接続に失敗しました。URLを確認してください。' })
    } finally {
      setRunning(false)
    }
  }

  const steps = [
    {
      label: 'Gemini APIキーを取得する',
      desc: 'Google AI Studioで無料のAPIキーを発行します',
      link: { href: 'https://aistudio.google.com/app/apikey', label: 'Google AI Studioを開く' },
    },
    {
      label: 'GASプロジェクトを作成する',
      desc: 'script.google.com で新しいプロジェクトを作成し、GitHubのコードを貼り付けます',
      link: {
        href: 'https://github.com/uedayoshie1-alt/ai-business-assistant/blob/main/lib/gas/gmail-auto-reply.gs',
        label: 'GASコードをGitHubで開く',
      },
      note: '※ 明細書のGASとは別のプロジェクトを作成してください',
    },
    {
      label: 'GASの設定を書き換える',
      desc: 'コード冒頭の以下を変更して保存（Cmd+S）',
      code: [
        "var GEMINI_API_KEY = '取得したAPIキーを貼り付け'",
        "var MY_EMAIL       = 'uedayoshie1@gmail.com'",
        "var MY_NAME        = '上田 良江'",
        "var COMPANY_NAME   = 'ハッピーステート株式会社'",
      ],
    },
    {
      label: 'トリガーを設定する',
      desc: '関数の選択を「setUpTrigger」にして ▶ 実行。Gmailの権限を承認してください。',
    },
    {
      label: 'GASをデプロイしてURLを取得する',
      desc: '「デプロイ」→「新しいデプロイ」→「ウェブアプリ」→ アクセス：全員 → デプロイ → URLをコピー',
    },
  ]

  return (
    <div className="max-w-3xl space-y-6">
      {/* 説明バナー */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <div className="w-1.5 h-10 bg-blue-400 rounded-full shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">Gmailの未読メールを自動チェックして、返信の下書きを保存します</p>
          <p className="text-xs text-blue-600 mt-0.5">Gemini AIがメール内容を読んで、内容に合った返信文を自動生成します（15分ごとに自動実行）</p>
        </div>
      </div>

      {/* セットアップ手順 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-800 mb-4">セットアップ手順</p>
        <div className="space-y-5">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  saved && i === steps.length - 1 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {saved && i === steps.length - 1 ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                {i < steps.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
              </div>
              <div className="pb-4 flex-1">
                <p className="text-sm font-medium text-gray-800">{step.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                {step.note && <p className="text-xs text-amber-600 mt-1">{step.note}</p>}
                {step.link && (
                  <a href={step.link.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <ExternalLink size={11} />
                    {step.link.label}
                  </a>
                )}
                {step.code && (
                  <div className="mt-2 bg-gray-900 rounded-lg px-3 py-2 space-y-0.5">
                    {step.code.map((line, j) => (
                      <p key={j} className="text-xs text-green-300 font-mono">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GAS URL設定 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-800 mb-1">GAS WebApp URL</p>
        <p className="text-xs text-gray-400 mb-3">STEP5でコピーしたURLを貼り付けて保存してください</p>
        <div className="flex gap-2">
          <input
            value={gasUrl}
            onChange={(e) => { setGasUrl(e.target.value); setSaved(false) }}
            placeholder="https://script.google.com/macros/s/xxxxx/exec"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
          <button
            onClick={handleSaveUrl}
            disabled={!gasUrl.trim()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            保存
          </button>
        </div>
        {saved && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <CheckCircle2 size={12} /> URLが保存されています
          </p>
        )}
      </div>

      {/* 手動実行 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-800 mb-1">手動実行</p>
        <p className="text-xs text-gray-400 mb-4">今すぐ未読メールをチェックして下書きを作成します（通常は15分ごとに自動実行）</p>

        <button
          onClick={handleRun}
          disabled={!saved || running}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {running
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />処理中…</>
            : <><Play size={14} />今すぐ実行</>
          }
        </button>

        {!saved && (
          <p className="text-xs text-gray-400 mt-2">※ GAS URLを保存してから実行できます</p>
        )}

        {/* 実行結果 */}
        {result && (
          <div className={`mt-4 rounded-xl px-4 py-3 flex items-start gap-3 ${
            result.error ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'
          }`}>
            {result.error
              ? <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              : <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
            }
            <div>
              {result.error
                ? <p className="text-sm text-red-700">{result.error}</p>
                : <>
                    <p className="text-sm font-medium text-green-800">
                      {result.processed}件の下書きを保存しました
                    </p>
                    {result.skipped > 0 && (
                      <p className="text-xs text-green-600 mt-0.5">（{result.skipped}件はスキップ）</p>
                    )}
                    <a href="https://mail.google.com/mail/#drafts" target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                      <Mail size={11} />
                      Gmailの下書きを確認する
                    </a>
                  </>
              }
            </div>
          </div>
        )}
      </div>

      {/* 補足 */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <p className="text-xs font-semibold text-amber-700 mb-1">ご注意</p>
        <ul className="space-y-1">
          {[
            'AI生成の返信はあくまで下書きです。必ず内容を確認してから送信してください',
            '処理済みのメールには「AI返信済み」ラベルが自動でつきます',
            'no-reply・newsletter などの自動メールは自動的にスキップされます',
            'Gemini APIは無料枠内（1日1,500リクエスト）で通常十分使えます',
          ].map((note, i) => (
            <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
              <span className="mt-0.5 shrink-0">•</span>{note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
