import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { resolveTenantFromRequest } from '@/lib/tenant-server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function extractTextWithVision(base64: string, isPdf: boolean): Promise<{ text: string; raw: string }> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY
  if (!apiKey) throw new Error('Vision API key not configured')

  if (isPdf) {
    const res = await fetch(`https://vision.googleapis.com/v1/files:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          inputConfig: { content: base64, mimeType: 'application/pdf' },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          imageContext: { languageHints: ['ja', 'en'] },
          pages: [1, 2, 3],
        }],
      }),
    })
    const data = await res.json()
    const raw = JSON.stringify(data).slice(0, 1000)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const innerResponses: any[] = data.responses?.[0]?.responses ?? []
    const text = innerResponses
      .map((r: Record<string, unknown>) => (r.fullTextAnnotation as Record<string, unknown>)?.text ?? '')
      .join('\n')
    return { text, raw }
  } else {
    const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: base64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        }],
      }),
    })
    const data = await res.json()
    const text = data.responses?.[0]?.fullTextAnnotation?.text ?? ''
    return { text, raw: JSON.stringify(data).slice(0, 500) }
  }
}

export async function POST(req: NextRequest) {
  try {
    await resolveTenantFromRequest(req)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')

  try {
    const { text: extractedText, raw } = await extractTextWithVision(base64, isPdf)

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'テキストを抽出できませんでした', debug: raw }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `以下のテキストは請求書・明細書から抽出したものです。JSONのみで返してください：

${extractedText}

{
  "invoiceTo": "宛先会社名",
  "subject": "件名",
  "issueDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "registrationNo": "T番号またはなければ空文字",
  "memo": "備考",
  "items": [{ "name": "品目", "quantity": 1, "unit": "式", "unitPrice": 0, "taxRate": 10, "amount": 0 }]
}`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'JSON解析失敗' }, { status: 500 })

    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
