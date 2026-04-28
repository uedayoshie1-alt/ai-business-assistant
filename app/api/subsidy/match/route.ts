import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CHALLENGE_KEYWORDS: Record<string, string> = {
  raise_wage: '賃上げ 最低賃金 賃金引上げ',
  hire: '採用 雇用 正社員化',
  childcare: '育児休業 育休 両立支援',
  dx: 'IT デジタル DX 業務改善',
  equipment: '設備投資 機械装置',
  training: '人材育成 研修 教育訓練',
  elderly: '高齢者 定年延長 継続雇用',
  disability: '障害者雇用',
  workstyle: '働き方改革 テレワーク 時短',
}

async function fetchJGrants(keywords: string[]): Promise<Record<string, unknown>[]> {
  const results: Record<string, unknown>[] = []
  const seen = new Set<string>()

  for (const kw of keywords.slice(0, 4)) {
    try {
      const url = `https://api.jgrants-portal.go.jp/exp/v1/public/subsidies?keyword=${encodeURIComponent(kw)}&acceptance=1&perPage=15`
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const data = await res.json()
      for (const item of (data.result ?? [])) {
        const id = String(item.subsidyId ?? item.id ?? Math.random())
        if (!seen.has(id)) {
          seen.add(id)
          results.push(item)
        }
      }
    } catch { /* ignore */ }
  }
  return results
}

function formatJGrantsSubsidies(items: Record<string, unknown>[]): string {
  return items.slice(0, 25).map((s, i) => {
    const name = s.subsidyName ?? s.title ?? '不明'
    const amount = s.subsidyMaxLimit ? `最大${Number(s.subsidyMaxLimit).toLocaleString()}円` : '要確認'
    const deadline = s.acceptanceDeadline ?? s.deadline ?? '要確認'
    const target = s.targetArea ?? s.targetSector ?? '全国'
    const purpose = s.purposeComment ?? s.subsidyEligibility ?? s.purposes ?? ''
    const url = s.subsidyUrl ?? s.url ?? `https://www.jgrants-portal.go.jp/subsidy/${s.subsidyId}`
    return `[${i + 1}] ${name}\n  金額: ${amount} / 期限: ${deadline} / 対象: ${target}\n  概要: ${String(purpose).slice(0, 150)}\n  URL: ${url}`
  }).join('\n\n')
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { region, industry, employees, challenges } = await req.json() as {
    region: string; industry: string; employees: string; challenges: string[]
  }

  // J-Grantsから助成金を取得
  const keywords = challenges.map(c => CHALLENGE_KEYWORDS[c]).filter(Boolean)
  const [jgrantsItems] = await Promise.all([fetchJGrants(keywords)])
  const subsidyListText = formatJGrantsSubsidies(jgrantsItems)

  const hasRealData = jgrantsItems.length > 0

  const prompt = `あなたは社会保険労務士向けの助成金マッチングシステムです。

【顧問先の情報】
- 地域: ${region}
- 業種: ${industry}
- 従業員数: ${employees}名
- 課題・取り組み予定: ${challenges.map(c => CHALLENGE_KEYWORDS[c]?.split(' ')[0] ?? c).join('、')}

${hasRealData ? `【J-Grants（政府公式）から取得した現在申請受付中の助成金一覧】\n${subsidyListText}` : '（外部データ取得失敗のため、知識に基づいて回答してください）'}

上記の顧問先情報に照らして、最も適合する助成金・補助金を5件選び、以下のJSON配列のみを返してください（説明文・Markdown不要）：

[
  {
    "id": "s_1",
    "name": "助成金名",
    "region": "対象地域",
    "industry": "対象業種",
    "category": "カテゴリ（雇用・人材/育児・介護/DX・設備投資/人材育成/高齢者雇用/働き方改革のいずれか）",
    "amount": "支給額（例：57万円〜72万円）",
    "requirements": ["要件1", "要件2", "要件3"],
    "documents": ["必要書類1", "書類2", "書類3"],
    "deadline": "申請期限（YYYY-MM-DD形式）",
    "score": 85,
    "proposalText": "顧問先向け提案文（この企業に合わせた具体的な内容）",
    "nextSteps": ["次のステップ1", "ステップ2"],
    "sourceUrl": "${hasRealData ? '上記データのURLをそのまま使用' : 'https://www.mhlw.go.jp/'}",
    "status": "candidate"
  }
]

scoreは0〜100で、顧問先との適合度を評価してください（課題・業種・地域・従業員数を考慮）。`

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

  const subsidies = JSON.parse(jsonMatch[0])
  return NextResponse.json({ subsidies, source: hasRealData ? 'jgrants' : 'ai', fetchedCount: jgrantsItems.length })
}
