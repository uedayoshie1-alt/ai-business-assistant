import { NextRequest, NextResponse } from 'next/server'

const DOC_AI_URL = 'https://us-documentai.googleapis.com/v1/projects/594849327580/locations/us/processors/95b589882a126e56:process'
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'

const CATEGORY_RULES: [string, string[]][] = [
  ['研修費',    ['講座', '受講料', 'セミナー', '研修', '講習', '勉強会', 'スクール', '資格']],
  ['旅費交通費', ['タクシー', '電車', '新幹線', 'バス', '交通', '駐車', 'Suica', 'PASMO', 'IC', '運賃', 'ホテル', '宿泊']],
  ['会議費',    ['コーヒー', 'カフェ', 'スタバ', 'スターバックス', 'ドトール', 'ミスド', 'ベローチェ']],
  ['交際費',    ['レストラン', '食事', '居酒屋', '料理', '飲食', 'ランチ', 'ディナー', 'ホテル']],
  ['消耗品費',  ['コンビニ', 'セブン', 'ローソン', 'ファミマ', 'ミニストップ', '文房具', '事務用品']],
  ['通信費',    ['ドコモ', 'au', 'ソフトバンク', 'インターネット', '通信']],
  ['新聞図書費',['書店', '本屋', 'Amazon', 'アマゾン', '雑誌', '書籍']],
  ['水道光熱費',['電気', 'ガス', '水道']],
]

function guessCategory(text: string): string {
  const lower = text.toLowerCase()
  for (const [cat, keywords] of CATEGORY_RULES) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) return cat
  }
  return '雑費'
}

// Document AI Expense Parser で解析
async function analyzeWithDocumentAI(base64: string, mimeType: string) {
  const apiKey = process.env.GOOGLE_DOCUMENT_AI_KEY
  if (!apiKey) throw new Error('Document AI key not configured')

  const res = await fetch(`${DOC_AI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rawDocument: { content: base64, mimeType },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message ?? `Document AI error ${res.status}`)
  }

  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entities: any[] = data.document?.entities ?? []

  const get = (type: string) => entities.find((e: Record<string, unknown>) => e.type === type)

  // 金額
  const totalEntity = get('total_amount') ?? get('net_amount')
  let amount = 0
  if (totalEntity?.normalizedValue?.moneyValue?.units) {
    amount = parseInt(totalEntity.normalizedValue.moneyValue.units)
  } else if (totalEntity?.mentionText) {
    amount = parseInt(totalEntity.mentionText.replace(/[^0-9]/g, ''))
  }

  // 日付
  let date = new Date().toISOString().split('T')[0]
  const dateEntity = get('receipt_date') ?? get('purchase_date')
  if (dateEntity?.normalizedValue?.dateValue) {
    const d = dateEntity.normalizedValue.dateValue
    date = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
  } else if (dateEntity?.mentionText) {
    const m = dateEntity.mentionText.match(/(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/)
    if (m) date = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  }

  // 支払先
  const vendorEntity = get('supplier_name') ?? get('vendor_name')
  const vendor = vendorEntity?.mentionText?.trim() ?? '不明'

  // 全テキスト（カテゴリ推定用）
  const fullText = data.document?.text ?? vendor
  const accountCategory = guessCategory(fullText)

  // 税率
  const taxRate = fullText.includes('8%') ? 8 : 10

  return { date, amount, vendor, accountCategory, taxRate, fullText }
}

// Vision API フォールバック（テキスト抽出のみ）
async function extractTextWithVision(base64: string): Promise<string> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY
  if (!apiKey) return ''

  const res = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{ image: { content: base64 }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }] }],
    }),
  })
  const data = await res.json()
  return data.responses?.[0]?.fullTextAnnotation?.text ?? ''
}

function extractFromText(text: string) {
  // 日付
  const datePatterns = [
    /(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/,
    /令和\s*(\d+)年\s*(\d{1,2})月\s*(\d{1,2})日/,
  ]
  let date = new Date().toISOString().split('T')[0]
  for (const p of datePatterns) {
    const m = text.match(p)
    if (m) {
      let year = parseInt(m[1])
      if (p.source.includes('令和')) year = 2018 + year
      if (year >= 2010 && year <= 2019) year += 10
      if (year < 2020 || year > 2035) year = new Date().getFullYear()
      date = `${year}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
      break
    }
  }

  // 金額
  const amountPatterns = [
    /ご請求金額[^\d]*([0-9,，]+)/,
    /請求金額[^\d]*([0-9,，]+)/,
    /合[計計][^\d\n]{0,10}([0-9,，]{3,})/,
    /金額\s*([0-9,，]+)円/,
    /[¥￥]([0-9,，]{3,})/,
  ]
  let amount = 0
  for (const p of amountPatterns) {
    const m = text.match(p)
    if (m) {
      const v = parseInt(m[1].replace(/[,，]/g, ''))
      if (v > 0 && v < 1000000) { amount = v; break }
    }
  }

  // 支払先
  const skipWords = ['領収書', 'receipt', '様', 'No.', '発行日', '但し']
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1 && !skipWords.some(w => l.includes(w)))
  const companyLine = lines.find(l => /株式会社|有限会社|合同会社|店/.test(l))
  const vendor = companyLine || lines[0] || '不明'

  return { date, amount, vendor, accountCategory: guessCategory(text), taxRate: text.includes('8%') ? 8 : 10 }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const files = formData.getAll('images') as File[]
  if (files.length === 0) return NextResponse.json({ error: 'No images provided' }, { status: 400 })

  // 1枚ずつ順番に処理（並行処理によるタイムアウト回避）
  const results = []
  const MAX_FILES = 5 // 一度に処理する最大枚数

  for (const file of files.slice(0, MAX_FILES)) {
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    let pushed = false

    // Document AI で解析（高精度）
    try {
      const { date, amount, vendor, accountCategory, taxRate } = await analyzeWithDocumentAI(base64, mimeType)
      results.push({
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date, amount, vendor, purpose: vendor, accountCategory,
        accountCategorySuggestions: [accountCategory, '雑費'].filter((v, i, a) => a.indexOf(v) === i),
        taxRate, status: 'pending', sourceType: 'image',
        reason: `Document AI（Expense Parser）により自動抽出。支払先「${vendor}」、金額「¥${amount.toLocaleString()}」を検出しました。`,
        extractedAt: new Date().toISOString(),
      })
      pushed = true
    } catch { /* fallthrough to Vision API */ }

    // Document AI 失敗時はVision APIにフォールバック
    if (!pushed) {
      try {
        const text = await extractTextWithVision(base64)
        if (text) {
          const { date, amount, vendor, accountCategory, taxRate } = extractFromText(text)
          results.push({
            id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            date, amount, vendor, purpose: vendor, accountCategory,
            accountCategorySuggestions: [accountCategory, '雑費'].filter((v, i, a) => a.indexOf(v) === i),
            taxRate, status: 'pending', sourceType: 'image',
            reason: `OCR解析により自動抽出。支払先「${vendor}」、金額「¥${amount.toLocaleString()}」を検出しました。`,
            extractedAt: new Date().toISOString(),
          })
        }
      } catch { /* skip this file */ }
    }
  }

  return NextResponse.json({ receipts: results })
}
