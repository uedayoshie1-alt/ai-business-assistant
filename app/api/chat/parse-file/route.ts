import { NextRequest, NextResponse } from 'next/server'

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')

  if (isPdf) {
    const apiKey = process.env.GOOGLE_VISION_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Vision API key not configured' }, { status: 500 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const res = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: base64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
        }],
      }),
    })

    const data = await res.json()
    const apiError = data.responses?.[0]?.error
    if (apiError) return NextResponse.json({ error: apiError.message }, { status: 500 })

    const text = data.responses?.[0]?.fullTextAnnotation?.text ?? ''
    return NextResponse.json({ text: text.slice(0, 15000), type: 'pdf' })
  }

  // テキスト・CSV系
  const text = await file.text()
  return NextResponse.json({ text: text.slice(0, 15000), type: 'text' })
}
