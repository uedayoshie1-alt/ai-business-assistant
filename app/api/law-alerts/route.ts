import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const today = () => new Date().toISOString().split('T')[0]

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const prompt = `今日の日付は${today()}です。
日本の社会保険労務士が知るべき、直近・近日施行予定の重要な法改正を5件、以下のJSON形式で返してください。
実際に存在する・施行予定の法改正のみを対象にしてください。

必ずJSON配列のみを返し、説明文やmarkdownは一切不要です。

[
  {
    "id": "la_1",
    "title": "法改正のタイトル",
    "source": "情報取得元（例：厚生労働省）",
    "publishDate": "YYYY-MM-DD",
    "effectiveDate": "YYYY-MM-DD",
    "importance": "high" | "medium" | "low",
    "category": "分野（例：育児・介護、最低賃金、社会保険など）",
    "targetCompany": "対象企業規模や業種",
    "summary": "100文字程度の概要",
    "oldRule": "改正前のルール（簡潔に）",
    "newRule": "改正後のルール（簡潔に）",
    "impact": "顧問先への影響（具体的に）",
    "requiredTasks": ["必要な対応タスク1", "タスク2", "タスク3"],
    "draftNotice": "顧問先向け案内文（200文字程度）",
    "status": "unconfirmed",
    "sourceUrl": "https://www.mhlw.go.jp/"
  }
]`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // JSONを抽出
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Failed to parse response' }, { status: 500 })
  }

  const alerts = JSON.parse(jsonMatch[0])

  return NextResponse.json({ alerts, generatedAt: new Date().toISOString() }, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
  })
}
