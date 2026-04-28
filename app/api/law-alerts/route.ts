import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type RSSItem = { title: string; link: string; pubDate: string; description: string }

async function fetchRSS(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/rss+xml,text/xml' },
      signal: AbortSignal.timeout(8000),
    })
    return res.ok ? await res.text() : ''
  } catch { return '' }
}

function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = []
  const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
  for (const m of matches) {
    const raw = m[1]
    const title = (raw.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>/) ?? raw.match(/<title>([^<]+)/))?.[1]?.trim() ?? ''
    const link = (raw.match(/<link>([^<]+)/) ?? raw.match(/<guid>([^<]+)/))?.[1]?.trim() ?? ''
    const pubDate = raw.match(/<pubDate>([^<]+)/)?.[1]?.trim() ?? ''
    const desc = (raw.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/) ?? raw.match(/<description>([^<]+)/))?.[1]?.trim() ?? ''
    if (title) items.push({ title, link, pubDate, description: desc.slice(0, 200) })
    if (items.length >= 30) break
  }
  return items
}

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  // 複数フィードを並行取得
  const [rss1, rss2] = await Promise.all([
    fetchRSS('https://www.mhlw.go.jp/rss/newpage_00.xml'),
    fetchRSS('https://www.mhlw.go.jp/rss/houdou_00.xml'),
  ])

  const items = [...parseRSS(rss1), ...parseRSS(rss2)]
    .filter((v, i, a) => a.findIndex(x => x.title === v.title) === i) // 重複除去

  const today = new Date().toISOString().split('T')[0]

  // RSS取得失敗時のフォールバック
  const rssSection = items.length > 0
    ? items.map((it, i) =>
        `[${i + 1}] タイトル: ${it.title}\n    日付: ${it.pubDate}\n    URL: ${it.link}\n    概要: ${it.description}`
      ).join('\n\n')
    : `（RSS取得失敗）今日${today}現在で最新の労働・社会保険法令に関する改正情報を生成してください`

  const prompt = `あなたは社会保険労務士向け法改正アラートシステムです。今日は${today}です。

以下は厚生労働省の最新プレスリリース一覧です：

${rssSection}

---
上記から社労士が対応すべき法改正・制度変更を5件抽出し、JSON配列のみを返してください。

重要ルール：
- publishDateとeffectiveDateは必ず実際の日付（YYYY-MM-DD）を使用
- sourceUrlは上記[番号]に記載のURLをそのままコピー（URLがない場合のみhttps://www.mhlw.go.jp/）
- RSSデータにない情報は追加しないこと

[
  {
    "id": "la_1",
    "title": "法改正タイトル（RSSのタイトルをベースに）",
    "source": "厚生労働省",
    "publishDate": "YYYY-MM-DD（RSS pubDateから変換）",
    "effectiveDate": "YYYY-MM-DD（施行日。不明な場合は公開日+6ヶ月）",
    "importance": "high",
    "category": "分野",
    "targetCompany": "対象企業",
    "summary": "100文字以内の概要",
    "oldRule": "改正前ルール",
    "newRule": "改正後ルール",
    "impact": "顧問先への具体的な影響",
    "requiredTasks": ["タスク1", "タスク2", "タスク3"],
    "draftNotice": "顧問先向け案内文200文字",
    "status": "unconfirmed",
    "sourceUrl": "RSSのURLをそのまま使用"
  }
]`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return NextResponse.json({ error: 'Parse failed' }, { status: 500 })

  const alerts = JSON.parse(jsonMatch[0])
  return NextResponse.json(
    { alerts, generatedAt: new Date().toISOString(), rssItemCount: items.length },
    { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
  )
}
