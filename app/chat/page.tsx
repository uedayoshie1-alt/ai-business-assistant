'use client'

import { useState, useRef, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Send, Upload, X, Bot, User, Loader2, FileText, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'

type Message = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'キャリアアップ助成金の申請要件を教えてください',
  '育児休業給付金の計算方法は？',
  '2026年の社会保険適用拡大について説明して',
  '就業規則の変更手続きを教えてください',
  '時間外労働の割増賃金の計算方法は？',
]

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        isUser ? 'bg-blue-600' : 'bg-indigo-100'
      )}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-indigo-600" />}
      </div>
      <div className={cn(
        'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'bg-blue-600 text-white rounded-tr-sm'
          : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
      )}>
        {isUser ? msg.content : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: msg.content
                // 余計な記号を除去
                .replace(/#{1,6}\s/g, '')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '$1')
                .replace(/- \[ \]/g, '・')
                .replace(/- \[x\]/gi, '✓')
                .replace(/^\s*[-*]\s/gm, '・')
                .replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 rounded text-xs">$1</code>')
                // 見出し記号を整形
                .replace(/^■\s*(.+)$/gm, '<strong class="block mt-3 mb-1 text-slate-800">■ $1</strong>')
                .replace(/\n/g, '<br />')
            }}
          />
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { tenant } = useTenant()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return
    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    // ストリーミング用に空のアシスタントメッセージを追加
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('ログイン情報を確認できませんでした')

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: newMessages, fileContent }),
      })
      if (!res.ok) throw new Error('サーバーエラー')
      if (!res.body) throw new Error('レスポンスなし')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + chunk }
          }
          return updated
        })
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: `エラーが発生しました: ${String(err)}` }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setFileContent('読み込み中...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/chat/parse-file', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '読み込み失敗')
      setFileContent(data.text || '（テキストを抽出できませんでした）')
    } catch (err) {
      setFileContent(null)
      setFileName(null)
      alert('ファイル読み込みエラー: ' + String(err))
    }
  }

  function clearFile() {
    setFileContent(null)
    setFileName(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-5rem)]">

        {/* ヘッダー */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{tenant.aiAssistantName}</h1>
            <p className="text-xs text-slate-500">{tenant.aiAssistantDescription}</p>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])}
              className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={13} />会話をクリア
            </button>
          )}
        </div>

        {/* ファイル添付表示 */}
        {fileName && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs">
            <FileText size={13} className="text-indigo-500 shrink-0" />
            <span className="text-indigo-700 font-medium truncate">{fileName}</span>
            <span className="text-indigo-400">を参照中</span>
            <button onClick={clearFile} className="ml-auto text-indigo-300 hover:text-indigo-600">
              <X size={13} />
            </button>
          </div>
        )}

        {/* メッセージ一覧 */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center pt-8 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto">
                <Bot size={28} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-slate-700 font-semibold">何でも聞いてください</p>
                <p className="text-xs text-slate-400 mt-1">労働法・社会保険・助成金・法改正について回答します</p>
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                {(tenant.suggestedQuestions.length > 0 ? tenant.suggestedQuestions : SUGGESTIONS).map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="w-full text-left text-xs px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-indigo-600" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <Loader2 size={16} className="text-indigo-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* 入力エリア */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          {/* ファイル添付ボタン */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors w-full"
          >
            <Upload size={13} />
            PDF・テキスト・CSVを添付して内容について質問する
          </button>

          <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-indigo-400 transition-colors shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="質問を入力してください（Shift+Enterで改行）"
              rows={1}
              className="flex-1 text-sm text-slate-800 resize-none outline-none bg-transparent placeholder:text-slate-400 max-h-32"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg transition-colors shrink-0">
              <Send size={14} />
            </button>
          </div>
        </div>

        <input ref={fileRef} type="file" accept=".pdf,.txt,.csv,.xlsx,.docx" className="hidden" onChange={handleFile} />
      </div>
    </AppLayout>
  )
}
