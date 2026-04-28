import { NextRequest, NextResponse } from 'next/server'

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'

function extractReceiptData(text: string) {
  // 日付抽出
  const datePatterns = [
    /(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/,
    /令和\s*(\d+)年\s*(\d{1,2})月\s*(\d{1,2})日/,
    /R(\d+)[\.\/](\d{1,2})[\.\/](\d{1,2})/,
  ]
  let date = new Date().toISOString().split('T')[0]
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      if (pattern.source.includes('令和') || pattern.source.includes('R(')) {
        const year = 2018 + parseInt(match[1])
        date = `${year}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
      } else {
        date = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
      }
      break
    }
  }

  // 金額抽出
  const amountPatterns = [
    /合[計計][^\d]*([0-9,，]+)/,
    /お会計[^\d]*([0-9,，]+)/,
    /総額[^\d]*([0-9,，]+)/,
    /請求額[^\d]*([0-9,，]+)/,
    /[¥￥]([0-9,，]+)/,
  ]
  let amount = 0
  for (const pattern of amountPatterns) {
    const match = text.match(pattern)
    if (match) {
      amount = parseInt(match[1].replace(/[,，]/g, ''))
      break
    }
  }
  if (amount === 0) {
    const numbers = (text.match(/[0-9,，]+/g) || [])
      .map(n => parseInt(n.replace(/[,，]/g, '')))
      .filter(n => n >= 100 && n <= 500000)
    if (numbers.length > 0) amount = Math.max(...numbers)
  }

  // 支払先（最初の意味のある行）
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1 && !/^\d+$/.test(l))
  const vendor = lines[0] || '不明'

  // 税率
  const taxRate = text.includes('10%') ? 10 : text.includes('8%') ? 8 : 10

  // 勘定科目推定
  const categoryRules: [string, string[]][] = [
    ['旅費交通費', ['タクシー', '電車', '新幹線', 'バス', '交通', '駐車', 'Suica', 'PASMO', 'IC']],
    ['会議費',    ['コーヒー', 'カフェ', 'スタバ', 'スターバックス', 'ドトール', 'ミスド', 'ベローチェ']],
    ['交際費',    ['レストラン', '食事', '居酒屋', '料理', '飲食', 'ランチ', 'ディナー']],
    ['消耗品費',  ['コンビニ', 'セブン', 'ローソン', 'ファミマ', 'ミニストップ', '文房具', '事務用品']],
    ['通信費',    ['ドコモ', 'au', 'ソフトバンク', 'インターネット', '通信']],
    ['新聞図書費',['書店', '本屋', 'Amazon', 'アマゾン', '雑誌', '書籍']],
    ['水道光熱費',['電気', 'ガス', '水道']],
  ]
  let accountCategory = '雑費'
  const lowerText = text.toLowerCase()
  for (const [cat, keywords] of categoryRules) {
    if (keywords.some(kw => lowerText.includes(kw.toLowerCase()))) {
      accountCategory = cat
      break
    }
  }

  const suggestions = [accountCategory, '雑費'].filter((v, i, a) => a.indexOf(v) === i)

  return { date, amount, vendor, accountCategory, taxRate, suggestions }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_VISION_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const formData = await req.formData()
  const files = formData.getAll('images') as File[]

  if (files.length === 0) {
    return NextResponse.json({ error: 'No images provided' }, { status: 400 })
  }

  const results = []

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const visionRes = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: base64 },
          features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
        }],
      }),
    })

    const visionData = await visionRes.json()
    const text: string = visionData.responses?.[0]?.fullTextAnnotation?.text ?? ''

    if (!text) {
      results.push({
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        vendor: file.name,
        purpose: 'テキスト検出できませんでした',
        accountCategory: '雑費',
        accountCategorySuggestions: ['雑費'],
        taxRate: 10,
        status: 'pending',
        sourceType: 'image',
        reason: 'OCRでテキストを検出できませんでした。手動で入力してください。',
        extractedAt: new Date().toISOString(),
      })
      continue
    }

    const { date, amount, vendor, accountCategory, taxRate, suggestions } = extractReceiptData(text)

    results.push({
      id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      amount,
      vendor,
      purpose: vendor,
      accountCategory,
      accountCategorySuggestions: suggestions,
      taxRate,
      status: 'pending',
      sourceType: 'image',
      reason: `OCR解析により自動抽出。支払先「${vendor}」、金額「¥${amount.toLocaleString()}」を検出しました。`,
      extractedAt: new Date().toISOString(),
    })
  }

  return NextResponse.json({ receipts: results })
}
