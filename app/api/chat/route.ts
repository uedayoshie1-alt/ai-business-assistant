import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const today = new Date().toISOString().split('T')[0]
const currentYear = new Date().getFullYear()

const SYSTEM_PROMPT = `あなたは社会保険労務士事務所向けのAIアシスタントです。
今日の日付は${today}（${currentYear}年）です。必ず${currentYear}年現在の最新情報で回答してください。

対応分野：
- 労働基準法・労働安全衛生法・労働契約法
- 社会保険（健康保険・厚生年金・雇用保険・労災保険）
- 育児介護休業法・男女雇用機会均等法
- 助成金・補助金（申請要件・手続き）
- 就業規則・雇用契約書の作成・改訂
- 給与計算・賞与計算
- 法改正情報と実務への影響
- 顧問先企業への対応・提案

回答のルール：
- 現在は${currentYear}年です。${currentYear - 2}年や${currentYear - 1}年以前の古い情報ではなく、${currentYear}年現在の最新情報を優先して回答する
- 具体的な条文や制度名を明示する
- 顧問先への提案文として使えるよう実務的に回答する
- 不確かな情報は「要確認」と明示する
- PDFや文書が共有されている場合はその内容を踏まえて回答する
- 記号（####、###、**、[ ]、- [ ]など）は使わない
- 箇条書きは「・」を使う
- 見出しは「■」を使う
- 読みやすいプレーンテキストで回答する`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 })
  }

  const { messages, fileContent } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[]
    fileContent?: string
  }

  const systemWithDoc = fileContent
    ? `${SYSTEM_PROMPT}\n\n【アップロードされた文書の内容】\n${fileContent}`
    : SYSTEM_PROMPT

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const anthropicStream = client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: systemWithDoc,
        messages,
      })
      for await (const chunk of anthropicStream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
