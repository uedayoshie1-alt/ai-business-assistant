/**
 * mock-generators.ts
 * 各機能のAI生成をシミュレートするモック関数
 * 将来的にはこのファイルをAPIコールに差し替えるだけで実装完了する設計
 */

import type {
  EmailFormData, EmailOutput,
  MinutesFormData, MinutesOutput,
  ProposalFormData, ProposalOutput,
  InstagramFormData, InstagramOutput,
} from './types'
import { loadSettings } from './settings'

// 処理時間をシミュレートするユーティリティ
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ===== 営業メール生成 =====
export async function generateEmail(data: EmailFormData): Promise<EmailOutput> {
  const settings = loadSettings()
  await delay(1200)

  const purposeMap: Record<string, string> = {
    new: '初めてご連絡いたします。',
    thanks: 'この度はお時間をいただきありがとうございました。',
    follow: '先日はご多用の中ありがとうございました。その後いかがでしょうか。',
    reproposal: '以前ご提案させていただいた件について、改めてご連絡いたします。',
  }

  const toneClosing: Record<string, string> = {
    soft: 'お気軽にご連絡いただけますと幸いです。どうぞよろしくお願いいたします。',
    standard: 'ご検討のほど、よろしくお願いいたします。',
    formal: '何卒ご高覧いただき、ご検討くださいますようお願い申し上げます。',
    strong: 'ぜひ一度、詳しくお話しできる機会をいただけますでしょうか。ご都合の良いお時間をお聞かせください。',
  }

  const openingLine = purposeMap[data.purpose] || purposeMap.new
  const closing = toneClosing[data.tone] || toneClosing.standard

  const subjectLine = data.subject
    ? `【ご提案】${data.subject}について - ${data.companyName}様`
    : `【ご提案・ご連絡】${data.companyName} ${data.contactName}様へ`

  const body = `${data.contactName}様

お世話になっております。
${openingLine}

${data.notes
    ? `この度は${data.notes}についてご案内させていただきたく、ご連絡いたしました。\n\n弊社では${data.subject || 'ご提案'}を通じて、貴社のお役に立てると考えております。`
    : `この度は${data.subject || 'ご提案'}についてご案内させていただきたく、ご連絡いたしました。\n\n弊社サービスが貴社の課題解決に貢献できると確信しております。`}

もしよろしければ、一度お打ち合わせの機会をいただけますと幸いです。

${closing}

${settings.signature}`

  return {
    subjectLine,
    body,
    suggestions: [
      '件名に「【重要】」や「【ご確認】」を追加すると開封率が上がります',
      '冒頭で共通の話題や最近のニュースに触れると関係構築につながります',
      '具体的な数字や実績を一行追加するとより信頼感が増します',
    ],
  }
}

// ===== 議事録生成 =====
export async function generateMinutes(data: MinutesFormData): Promise<MinutesOutput> {
  await delay(1500)

  const rawText = data.rawText || '（テキストなし）'

  return {
    summary: `${data.meetingName}において、主要な議題についての協議が行われました。参加者間で現状の課題認識を共有し、今後の方針について合意形成が図られました。特に重要な決定事項については、担当者と期日を明確にしたうえで対応方針が決定されました。\n\n（元テキスト要約）${rawText.slice(0, 80)}…`,

    decisions: [
      '新サービスの提供開始時期を来月末に設定することを承認',
      '担当チームのリソース調整を今週中に完了させることを決定',
      '進捗確認のための定期ミーティングを週次で実施することに合意',
      '外部パートナーへの連絡を担当者が今週中に行うことを確認',
    ],

    todos: [
      { task: 'サービス提供準備の最終確認', assignee: '山田', deadline: '今週金曜' },
      { task: 'リソース調整の社内調整', assignee: '鈴木', deadline: '今週水曜' },
      { task: '外部パートナーへの連絡', assignee: '田中', deadline: '明日中' },
      { task: '次回ミーティングの日程調整', assignee: '佐藤', deadline: '本日中' },
    ],

    nextItems: [
      '各担当者の進捗状況の確認',
      '予算執行状況の報告',
      'パートナーからの返答内容の共有',
    ],
  }
}

// ===== Instagram投稿生成 =====
export async function generateInstagram(data: InstagramFormData): Promise<InstagramOutput> {
  await delay(1400)

  const e = data.useEmoji

  const purposeIntro: Record<string, string> = {
    awareness:    e ? '✨ 知っていましたか？' : '知っていましたか？',
    engagement:   e ? '💬 あなたはどう思いますか？' : 'あなたはどう思いますか？',
    announcement: e ? '📣 お知らせがあります！' : 'お知らせがあります。',
    story:        e ? '🌿 今日のストーリーをシェアします。' : '今日のストーリーをシェアします。',
  }

  const toneStyle: Record<string, { closing: string }> = {
    friendly:     { closing: e ? 'いつも応援ありがとうございます😊\nぜひコメントで教えてください！' : 'いつも応援ありがとうございます。ぜひコメントで教えてください！' },
    professional: { closing: e ? '詳細はプロフィールのリンクからご確認ください📎' : '詳細はプロフィールのリンクからご確認ください。' },
    casual:       { closing: e ? 'またシェアするね🙌 フォローもよろしく！' : 'またシェアするね！フォローもよろしく。' },
    inspiring:    { closing: e ? '一歩踏み出す勇気を、あなたに🌟' : '一歩踏み出す勇気を、あなたに。' },
  }

  const intro = purposeIntro[data.purpose] || purposeIntro.awareness
  const closing = toneStyle[data.tone]?.closing || toneStyle.friendly.closing

  const purposeBody: Record<string, string> = {
    awareness: [
      `${data.theme}って、実はとても奥が深いんです。`,
      ``,
      `「難しそう」「自分には関係ない」と思っていた方も、`,
      `一度触れてみると「こんなに使えるの！？」と驚く方がとても多いです。`,
      ``,
      `${data.notes ? data.notes + '\n\n' : ''}私自身も最初は手探りでしたが、`,
      `少しずつ学んでいくうちに、日々の仕事や生活が本当に変わりました。`,
      ``,
      `知っているだけで、選択肢がぐっと広がります${e ? '✨' : '。'}`,
      `まずは「知ること」から始めてみませんか？`,
    ].join('\n'),

    engagement: [
      `${data.theme}について、みなさんはどう感じていますか？${e ? '🤔' : ''}`,
      ``,
      `${data.notes ? data.notes + '\n\n' : ''}「やってみたいけど、何から始めればいいかわからない」`,
      `「使ってみたら思ったより簡単だった！」`,
      `「もっと早く知りたかった…」`,
      ``,
      `いろんな声を聞くたびに、情報を届ける大切さを感じています${e ? '💡' : '。'}`,
      ``,
      `あなたはどんな経験がありましたか？`,
      `コメントで教えてもらえると嬉しいです${e ? '😊' : '！'}`,
    ].join('\n'),

    announcement: [
      `${e ? '🎉 ' : ''}${data.theme}のお知らせです！`,
      ``,
      `${data.notes ? data.notes + '\n\n' : ''}今回ご用意したのは、「もっと気軽に学べる場所を作りたい」という思いから生まれた企画です。`,
      ``,
      `難しい専門用語は使いません。`,
      `実際にやってみながら、楽しく学べる内容になっています${e ? '🙌' : '。'}`,
      ``,
      `詳細はプロフィールのリンクからチェックしてみてください${e ? '👇' : '。'}`,
      `ご参加お待ちしています！`,
    ].join('\n'),

    story: [
      `今日は${data.theme}についての話を少しだけ${e ? '🌿' : '。'}`,
      ``,
      `${data.notes ? data.notes + '\n\n' : ''}ふとした瞬間に「あ、これが大事だったんだ」と気づくことってありませんか？`,
      ``,
      `毎日慌ただしく過ごしていると、大切なことを見落としてしまうことがあります。`,
      `でも立ち止まって、ちゃんと向き合ってみると`,
      `新しい発見や、自分の中の変化に気づけることがあります${e ? '✨' : '。'}`,
      ``,
      `今日もここまで読んでくれてありがとうございます${e ? '🤍' : '。'}`,
      `あなたの毎日が、少しでも豊かになりますように。`,
    ].join('\n'),
  }

  const mainBody = purposeBody[data.purpose] || purposeBody.awareness

  const caption = `${intro}\n\n${mainBody}\n\n${closing}`

  const baseHashtags = [
    data.theme.replace(/\s/g, ''),
    'ハッピーステート',
    '上田良江',
    'AI活用',
    '生成AI',
    'ChatGPT',
    'DX推進',
    'AI講座',
    'スキルアップ',
    '北海道',
    'ビジネス',
    'Instagram',
    '日常',
    'おすすめ',
    '学び',
  ]

  const hashtags = baseHashtags.slice(0, data.hashtagCount).map((t) => `#${t}`)

  return {
    caption,
    hashtags,
    tips: [
      '投稿は平日12時・18〜21時が反応率が高い傾向があります',
      'ファーストコメントにハッシュタグをまとめると本文がすっきりします',
      '写真は明るく・縦長（4:5比率）だとフィードで目立ちやすいです',
    ],
  }
}

// ===== 提案文生成 =====
export async function generateProposal(data: ProposalFormData): Promise<ProposalOutput> {
  await delay(1800)

  const title = data.proposalContent
    ? `${data.targetCompany}様向け ${data.proposalContent} ご提案`
    : `${data.targetCompany}様向け 業務改善ご提案`

  const styleIntro: Record<string, string> = {
    concise: 'ご要望に沿い、要点を絞ってご提案いたします。',
    standard: 'この度は貴重なお時間をいただきありがとうございます。以下にご提案内容をまとめました。',
    formal: '謹啓 貴社ますますご発展のこととお慶び申し上げます。この度は弊社よりご提案の機会をいただき、誠にありがとうございます。',
  }

  return {
    title,
    overview: `${styleIntro[data.style] || styleIntro.standard}\n\n${data.targetCompany}様の「${data.challenge || 'ご課題'}」に対し、弊社の${data.proposalContent || 'ソリューション'}を通じて、${data.expectedEffect || '業務効率化・コスト削減'}を実現するご提案です。${data.direction ? `\n\n提案の方向性として、${data.direction}を中心に展開してまいります。` : ''}`,

    challengeAnalysis: `貴社における主な課題として、以下の点が挙げられます。\n\n■ ${data.challenge || '現状の課題'}\n現在の業務フローでは、担当者の工数や確認作業が増大しており、生産性の低下や対応漏れのリスクが高まっています。また、情報の属人化により、ノウハウの共有や引き継ぎにも支障が生じているケースが見受けられます。\n\n■ 背景\n業界全体でDX推進・人手不足への対応が急務となっており、貴社においても早期の改善が求められる状況です。`,

    proposalDetail: `上記課題に対し、以下のソリューションをご提案いたします。\n\n① ${data.proposalContent || '業務支援ツールの導入'}\n既存の業務フローに組み込む形で、スムーズな導入が可能です。初期設定から運用定着まで、弊社が一貫してサポートいたします。\n\n② 専任担当による伴走支援\n導入後も定期的なフォローアップを実施し、効果的なご活用をバックアップします。\n\n③ カスタマイズ対応\n${data.notes ? data.notes + '\n' : ''}貴社の業種・業務内容に合わせたカスタマイズが可能です。`,

    expectedOutcome: `本提案の実施により、以下の効果が期待されます。\n\n• ${data.expectedEffect || '業務効率の向上（作業時間 約30〜50%削減）'}\n• ヒューマンエラーの低減と品質の安定化\n• 担当者の負担軽減による本業への集中\n• 情報の見える化・共有化による組織力向上\n\n導入後3ヶ月を目処に効果測定を行い、継続的な改善を図ってまいります。`,

    closing: `${data.targetCompany}様の業務改善・成長に、弊社が少しでもお役に立てれば幸いです。\n\nご不明点やご要望がございましたら、どうぞお気軽にお申し付けください。まずはお打ち合わせの場を設けさせていただければと存じます。\n\nご検討のほど、よろしくお願い申し上げます。`,
  }
}
