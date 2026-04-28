import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function fetchMHLWRSS(): Promise<string> {
  const feeds = [
    'https://www.mhlw.go.jp/rss/newpage_00.xml',
    'https://www.mhlw.go.jp/rss/houdou_00.xml',
  ]
  const results = await Promise.allSettled(
    feeds.map(url =>
      fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/rss+xml,application/xml,text/xml' },
        signal: AbortSignal.timeout(8000),
      }).then(r => r.text())
    )
  )
  return results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map(r => r.value)
    .join('\n\n')
}

async function fetchEGovLaws(): Promise<string> {
  try {
    // 労働・社会保険分野の法令一覧を取得
    const res = await fetch('https://laws.e-gov.go.jp/api/1/lawlists/2', {
      signal: AbortSignal.timeout(8000),
    })
    const xml = await res.text()
    // 直近更新された法令（先頭30件）のタイトルのみ抽出
    const matches = xml.match(/<LawName>([^<]+)<\/LawName>/g) ?? []
    return matches.slice(0, 30).map(m => m.replace(/<\/?LawName>/g, '')).join('\n')
  } catch {
    return ''
  }
}

type RSSItem = { title: string; desc: string; link: string; pubDate: string }

function extractRSSItems(xml: string): { text: string; items: RSSItem[] } {
  const items: RSSItem[] = []
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
  let count = 0
  for (const match of itemMatches) {
    if (count >= 20) break
    const raw = match[1]
    const titleMatch = raw.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ?? raw.match(/<title>([^<]*)<\/title>/)
    const title = titleMatch?.[1] ?? ''
    const descMatch = raw.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ?? raw.match(/<description>([^<]*)<\/description>/)
    const desc = descMatch?.[1] ?? ''
    const link = raw.match(/<link>([^<]+)<\/link>/)?.[1]?.trim() ?? ''
    const pubDate = raw.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1]?.trim() ?? ''
    if (title.trim()) items.push({ title: title.trim(), desc: desc.trim(), link, pubDate })
    count++
  }
  const text = items.map(i => `【${i.pubDate}】${i.title}\n${i.desc}\nURL: ${i.link}`).join('\n\n')
  return { text, items }
}

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const today = new Date().toISOString().split('T')[0]

  // 並行してデータ取得
  const [rssRaw, egovRaw] = await Promise.all([fetchMHLWRSS(), fetchEGovLaws()])
  const { text: rssText } = extractRSSItems(rssRaw)

  const sources = []
  if (rssText) sources.push(`【厚生労働省 最新プレスリリース】\n${rssText}`)
  if (egovRaw) sources.push(`【e-Gov 最近更新された法令（抜粋）】\n${egovRaw}`)

  const sourceSection = sources.length > 0
    ? sources.join('\n\n---\n\n')
    : '（外部データ取得に失敗しました。知識に基づいて回答してください）'

  const prompt = `今日は${today}です。社会保険労務士向けの法改正アラートシステムです。

以下の厚生労働省プレスリリースとe-Gov法令データを参照し、社労士が顧問先に対応すべき重要な法改正・改正予定を5件選んでJSON配列で返してください。

${sourceSection}

---
以下のJSON配列のみを返してください（説明文・Markdown不要）：

[
  {
    "id": "la_1",
    "title": "法改正タイトル",
    "source": "厚生労働省",
    "publishDate": "YYYY-MM-DD",
    "effectiveDate": "YYYY-MM-DD",
    "importance": "high",
    "category": "分野（例：育児・介護、最低賃金、社会保険）",
    "targetCompany": "対象企業",
    "summary": "概要（100文字以内）",
    "oldRule": "改正前ルール",
    "newRule": "改正後ルール",
    "impact": "顧問先への影響",
    "requiredTasks": ["タスク1", "タスク2", "タスク3"],
    "draftNotice": "顧問先向け案内文（200文字程度）",
    "status": "unconfirmed",
    "sourceUrl": "上記データに含まれる実際のURLを必ず使用。なければ https://www.mhlw.go.jp/index.html"
  }
]

重要：sourceUrlは上記データに記載されている実際のURLをそのままコピーして使用してください。存在しないURLは生成しないでください。`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Failed to parse response' }, { status: 500 })
  }

  const alerts = JSON.parse(jsonMatch[0])

  return NextResponse.json(
    { alerts, generatedAt: new Date().toISOString(), sources: sources.length },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' } }
  )
}
