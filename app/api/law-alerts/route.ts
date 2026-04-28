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
    if (items.length >= 20) break
  }
  return items
}

// e-Gov 最近更新された法令一覧を取得
async function fetchEGovUpdates(): Promise<string> {
  const types = [1, 2, 3] // 1:法律 2:政令 3:省令
  const results: string[] = []

  for (const type of types) {
    try {
      const res = await fetch(`https://elaws.e-gov.go.jp/api/1/updatelawlists/${type}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const xml = await res.text()

      // 法令名・公布日・法令IDを抽出
      const laws: string[] = []
      const items = xml.matchAll(/<LawNameListInfo>([\s\S]*?)<\/LawNameListInfo>/g)
      let count = 0
      for (const m of items) {
        if (count >= 15) break
        const raw = m[1]
        const name = raw.match(/<LawName>([^<]+)/)?.[1]?.trim() ?? ''
        const date = raw.match(/<PromulgationDate>([^<]+)/)?.[1]?.trim() ?? ''
        const id = raw.match(/<LawId>([^<]+)/)?.[1]?.trim() ?? ''
        const category = type === 1 ? '法律' : type === 2 ? '政令' : '省令'
        if (name) {
          laws.push(`[${category}] ${name}（公布日:${date}）URL: https://elaws.e-gov.go.jp/document?lawid=${id}`)
          count++
        }
      }
      if (laws.length > 0) results.push(laws.join('\n'))
    } catch { /* ignore */ }
  }
  return results.join('\n')
}

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const today = new Date().toISOString().split('T')[0]

  // 並行取得
  const [rss1, rss2, egovText] = await Promise.all([
    fetchRSS('https://www.mhlw.go.jp/rss/newpage_00.xml'),
    fetchRSS('https://www.mhlw.go.jp/rss/houdou_00.xml'),
    fetchEGovUpdates(),
  ])

  const rssItems = [...parseRSS(rss1), ...parseRSS(rss2)]
    .filter((v, i, a) => a.findIndex(x => x.title === v.title) === i)

  const rssSection = rssItems.length > 0
    ? rssItems.map((it, i) =>
        `[${i + 1}] ${it.title}\n    日付: ${it.pubDate} / URL: ${it.link}\n    ${it.description}`
      ).join('\n\n')
    : '（RSS取得失敗）'

  const egovSection = egovText
    ? `【e-Gov 最近更新された法令一覧】\n${egovText}`
    : '（e-Gov取得失敗）'

  const hasSomeData = rssItems.length > 0 || egovText.length > 0

  const prompt = `社会保険労務士向け法改正アラートシステムです。今日は${today}です。

【厚生労働省 最新プレスリリース（RSS）】
${rssSection}

${egovSection}

---
上記のデータをもとに、社労士が対応すべき重要な法改正・制度変更を5件選んでJSON配列のみを返してください。

${hasSomeData ? `重要：
- publishDateはRSSのpubDateまたはe-Govの公布日から変換（YYYY-MM-DD）
- sourceUrlは上記データのURLをそのままコピー
- e-Gov URLは https://elaws.e-gov.go.jp/document?lawid=XXXXX の形式` : `（外部データ取得失敗）${today}現在有効な2025〜2026年の労働・社会保険法改正を生成してください`}

[
  {
    "id": "la_1",
    "title": "法改正タイトル",
    "source": "厚生労働省 または e-Gov",
    "publishDate": "YYYY-MM-DD",
    "effectiveDate": "YYYY-MM-DD",
    "importance": "high",
    "category": "分野",
    "targetCompany": "対象企業",
    "summary": "100文字以内の概要",
    "oldRule": "改正前ルール",
    "newRule": "改正後ルール",
    "impact": "顧問先への影響",
    "requiredTasks": ["タスク1", "タスク2", "タスク3"],
    "draftNotice": "顧問先向け案内文200文字",
    "status": "unconfirmed",
    "sourceUrl": "実際のURLをコピー"
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
  return NextResponse.json({
    alerts,
    generatedAt: new Date().toISOString(),
    rssItemCount: rssItems.length,
    egovConnected: egovText.length > 0,
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600' },
  })
}
