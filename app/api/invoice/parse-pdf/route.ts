import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: isPdf ? 'application/pdf' : 'image/jpeg',
            data: base64,
          },
        } as unknown as Anthropic.TextBlockParam,
        {
          type: 'text',
          text: `このPDF/画像から請求書・明細書の情報を抽出してJSON形式で返してください。

以下のJSON形式のみを返してください（説明文不要）：
{
  "invoiceTo": "宛先会社名",
  "subject": "件名・摘要",
  "issueDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD（不明な場合は空文字）",
  "registrationNo": "適格請求書番号（Tから始まる番号、なければ空文字）",
  "memo": "備考・特記事項",
  "items": [
    {
      "name": "品目名",
      "quantity": 1,
      "unit": "式",
      "unitPrice": 10000,
      "taxRate": 10,
      "amount": 10000
    }
  ]
}`,
        },
      ],
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return NextResponse.json({ error: 'Parse failed' }, { status: 500 })

  const data = JSON.parse(jsonMatch[0])
  return NextResponse.json(data)
}
