import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CHALLENGE_KEYWORDS: Record<string, string> = {
  raise_wage: '賃上げ 最低賃金',
  hire: '採用 雇用 正社員化',
  childcare: '育児休業 育休 両立支援',
  dx: 'IT デジタル DX 業務改善',
  equipment: '設備投資 機械装置',
  training: '人材育成 研修 教育訓練',
  elderly: '高齢者 定年延長 継続雇用',
  disability: '障害者雇用',
  workstyle: '働き方改革 テレワーク 時短',
}

type JGrantsItem = Record<string, unknown>

async function fetchJGrants(keywords: string[]): Promise<JGrantsItem[]> {
  const results: JGrantsItem[] = []
  const seen = new Set<string>()
  const today = new Date().toISOString().split('T')[0]

  for (const kw of keywords.slice(0, 4)) {
    try {
      const url = `https://api.jgrants-portal.go.jp/exp/v1/public/subsidies?keyword=${encodeURIComponent(kw.split(' ')[0])}&acceptance=1&perPage=10`
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const data = await res.json()
      for (const item of (data.result ?? [])) {
        const id = String(item.subsidyId ?? item.id ?? '')
        if (!id || seen.has(id)) continue
        // 期限切れを除外
        const deadline = String(item.acceptanceDeadline ?? item.deadline ?? '')
        if (deadline && deadline < today) continue
        seen.add(id)
        results.push(item)
      }
    } catch { /* ignore */ }
  }
  return results
}

function formatItems(items: JGrantsItem[]): string {
  return items.slice(0, 20).map((s, i) => {
    const name = String(s.subsidyName ?? s.title ?? '')
    const amount = s.subsidyMaxLimit ? `最大${Number(s.subsidyMaxLimit).toLocaleString()}円` : '要確認'
    const deadline = String(s.acceptanceDeadline ?? s.deadline ?? '要確認')
    const area = String(s.targetArea ?? s.targetSector ?? '全国')
    const id = String(s.subsidyId ?? '')
    const url = String(s.subsidyUrl ?? s.url ?? (id ? `https://www.jgrants-portal.go.jp/subsidy/${id}` : 'https://www.jgrants-portal.go.jp/'))
    const summary = String(s.purposeComment ?? s.subsidyEligibility ?? '').slice(0, 150)
    return `[${i + 1}] ${name}\n  金額:${amount} 期限:${deadline} 地域:${area}\n  概要:${summary}\n  URL:${url}`
  }).join('\n\n')
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { region, industry, employees, challenges } = await req.json() as {
    region: string; industry: string; employees: string; challenges: string[]
  }

  const today = new Date().toISOString().split('T')[0]
  const currentYear = new Date().getFullYear()

  const keywords = challenges.map(c => CHALLENGE_KEYWORDS[c]).filter(Boolean)
  const jgrantsItems = await fetchJGrants(keywords)
  const hasRealData = jgrantsItems.length > 0
  const itemsText = hasRealData ? formatItems(jgrantsItems) : ''

  const prompt = `社会保険労務士向け助成金マッチングシステムです。今日は${today}です。

【顧問先条件】
- 地域: ${region} / 業種: ${industry} / 従業員: ${employees}名
- 課題: ${challenges.map(c => CHALLENGE_KEYWORDS[c]?.split(' ')[0] ?? c).join('、')}

${hasRealData ? `【J-Grants 申請受付中の助成金（実データ）】
${itemsText}

重要：上記の実データから選んでください。deadlineとsourceUrlは上記の値をそのままコピーしてください。` : `【注意】J-Grants API取得失敗。
${currentYear}年度現在も継続受付中の助成金（キャリアアップ助成金、人材開発支援助成金、業務改善助成金等）から選び、
deadlineは「${currentYear}-12-31」としてください。`}

顧問先に最適な5件をJSONのみで返してください：

[{
  "id": "s_1",
  "name": "名称",
  "region": "${region}",
  "industry": "${industry}",
  "category": "雇用・人材/育児・介護/DX・設備投資/人材育成/高齢者雇用/働き方改革のいずれか",
  "amount": "金額",
  "requirements": ["要件1","要件2","要件3"],
  "documents": ["書類1","書類2"],
  "deadline": "${currentYear}-12-31",
  "score": 85,
  "proposalText": "この企業向けの提案文",
  "nextSteps": ["ステップ1","ステップ2"],
  "sourceUrl": "URLをそのままコピー",
  "status": "candidate"
}]`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return NextResponse.json({ error: 'Parse failed' }, { status: 500 })

  const subsidies = JSON.parse(jsonMatch[0])
  return NextResponse.json({
    subsidies,
    source: hasRealData ? 'jgrants' : 'ai-fallback',
    fetchedCount: jgrantsItems.length,
  })
}
