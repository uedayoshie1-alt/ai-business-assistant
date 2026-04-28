// ============================================================
// 社労士AI業務ダッシュボード - モックデータ
// 本番環境では各APIに差し替えてください
// ============================================================

// --- 領収書 ---
export type ReceiptStatus = 'pending' | 'confirmed' | 'rejected'
export type ReceiptSourceType = 'video' | 'image'

export interface Receipt {
  id: string
  date: string
  amount: number
  vendor: string
  purpose: string
  accountCategory: string
  accountCategorySuggestions: string[]
  reason: string
  taxRate: 8 | 10
  status: ReceiptStatus
  sourceType: ReceiptSourceType
  extractedAt: string
}

export const ACCOUNT_CATEGORIES = [
  '旅費交通費', '通信費', '消耗品費', '接待交際費', '会議費',
  '研修費', '広告宣伝費', '支払手数料', '外注費', '水道光熱費',
  '地代家賃', '保険料', '修繕費', '車両費', '図書費', '雑費',
]

export const mockReceipts: Receipt[] = [
  {
    id: 'r001', date: '2026-04-25', amount: 8800,
    vendor: '東京コンサルティング株式会社', purpose: '労務管理セミナー参加費',
    accountCategory: '研修費', accountCategorySuggestions: ['研修費', '会議費'],
    reason: '支払先に「コンサルティング」、用途に「セミナー」「研修」キーワードを検出。研修費を最有力候補として提案。',
    taxRate: 10, status: 'confirmed', sourceType: 'image', extractedAt: '2026-04-26T09:15:00',
  },
  {
    id: 'r002', date: '2026-04-24', amount: 3300,
    vendor: 'スターバックスコーヒー 渋谷店', purpose: '顧客との打合せ',
    accountCategory: '会議費', accountCategorySuggestions: ['会議費', '接待交際費'],
    reason: '飲食店での支出。「打合せ」「顧客」キーワードから会議費を提案。',
    taxRate: 10, status: 'pending', sourceType: 'video', extractedAt: '2026-04-26T09:16:00',
  },
  {
    id: 'r003', date: '2026-04-23', amount: 55000,
    vendor: 'JR東日本', purpose: '大阪出張　新幹線代',
    accountCategory: '旅費交通費', accountCategorySuggestions: ['旅費交通費'],
    reason: '鉄道会社への高額支出。「出張」「新幹線」キーワードから旅費交通費を提案。',
    taxRate: 10, status: 'confirmed', sourceType: 'video', extractedAt: '2026-04-26T09:17:00',
  },
]

// --- 法改正アラート ---
export type LawAlertStatus = 'unconfirmed' | 'reviewing' | 'confirmed' | 'notified'
export type LawAlertImportance = 'high' | 'medium' | 'low'

export interface LawAlert {
  id: string
  title: string
  source: string
  publishDate: string
  effectiveDate: string
  importance: LawAlertImportance
  category: string
  targetCompany: string
  summary: string
  oldRule: string
  newRule: string
  impact: string
  requiredTasks: string[]
  draftNotice: string
  status: LawAlertStatus
  confirmedBy?: string
  confirmedAt?: string
  sourceUrl: string
}

export const mockLawAlerts: LawAlert[] = [
  {
    id: 'la001',
    title: '育児・介護休業法改正（育休取得率の情報公表義務拡大）',
    source: '厚生労働省',
    publishDate: '2024-11-15',
    effectiveDate: '2025-04-01',
    importance: 'high',
    category: '育児・介護',
    targetCompany: '従業員300人超の企業',
    summary: '育児休業取得率の情報公表義務が従業員1,000人超から300人超の企業に拡大。男性・女性それぞれの取得率を毎年公表する必要があります。',
    oldRule: '従業員1,000人超の企業のみ育児休業取得率の公表が義務（男女別）',
    newRule: '従業員300人超の企業も育児休業取得率の公表が義務化（男女別・年1回以上）',
    impact: '顧問先のうち従業員300〜1,000人規模の企業は新たに公表義務の対象となります。就業規則の確認と取得実績の集計体制の構築が必要です。',
    requiredTasks: [
      '対象顧問先（300人超）のリストアップ',
      '過去の育児休業取得状況の確認・集計',
      '公表方法・媒体の検討（自社HP・厚労省システム等）',
      '就業規則・育児休業規程の確認',
      '担当者への説明・対応指示',
    ],
    draftNotice: `【重要：育児・介護休業法改正に伴う情報公表義務のご案内】

平素よりお世話になっております。◯◯社会保険労務士事務所でございます。

このたび、育児・介護休業法の改正により、2025年4月1日より、従業員300人超の企業においても育児休業取得率の情報公表が義務付けられることとなりました。

■ 変更内容
公表義務の対象企業：従業員1,000人超 → 従業員300人超に拡大
公表内容：男女別の育児休業取得率（年1回以上）

■ 貴社への影響
貴社は対象企業に該当する可能性がございます。

■ 必要な対応
1. 育児休業取得状況の集計（過去1年分）
2. 公表媒体の決定（自社HPまたは厚生労働省の情報公表システム）
3. 就業規則の確認・整備

詳細については、担当社労士までお気軽にご相談ください。
引き続きよろしくお願い申し上げます。`,
    status: 'reviewing',
    confirmedBy: '田中 太郎',
    confirmedAt: '2026-04-25T10:00:00',
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000130583.html',
  },
  {
    id: 'la002',
    title: '地域別最低賃金改定（2025年10月1日〜）',
    source: '厚生労働省',
    publishDate: '2025-08-01',
    effectiveDate: '2025-10-01',
    importance: 'high',
    category: '賃金・給与',
    targetCompany: '全企業',
    summary: '2025年度の地域別最低賃金が改定。全国加重平均額が1,055円に引き上げ予定。対象地域の事業主は10月1日までに賃金を改定する必要があります。',
    oldRule: '全国加重平均：1,004円（2024年度）/ 東京都：1,113円',
    newRule: '全国加重平均：1,055円（2025年度予定）/ 東京都：1,163円（予定）',
    impact: '全顧問先が対象。特にパート・アルバイト比率の高い飲食・小売・福祉業の顧問先は、時給の一斉見直しが必要になります。',
    requiredTasks: [
      '全顧問先の現行賃金と最低賃金の比較チェック',
      'パート・アルバイトの時給の一覧作成・確認',
      '最低賃金を下回る従業員の特定と賃金改定計画',
      '給与計算システムへの反映確認',
      '雇用契約書・労働条件通知書の更新',
    ],
    draftNotice: `【重要：最低賃金改定に伴うご確認のお願い】

平素よりお世話になっております。

2025年10月1日より地域別最低賃金が改定されます。
現在の時給が改定後の最低賃金を下回る従業員がいる場合は、10月1日までに賃金を引き上げる必要があります。

■ 主な改定額（予定）
・全国加重平均：1,055円（+51円）
・東京都：1,163円（+50円）

当事務所では、賃金の一括チェックサービスを承っております。
まずは従業員名簿と現行の賃金一覧をご準備いただき、担当社労士にご連絡ください。`,
    status: 'unconfirmed',
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/minimumichiran/',
  },
  {
    id: 'la003',
    title: '社会保険の適用拡大（2026年10月〜 51人以上企業）',
    source: '日本年金機構',
    publishDate: '2025-03-15',
    effectiveDate: '2026-10-01',
    importance: 'high',
    category: '社会保険',
    targetCompany: '従業員51人以上の企業',
    summary: '短時間労働者への社会保険適用が従業員51人以上の企業に拡大。週20時間以上・月収8.8万円以上・継続雇用見込み2か月超の短時間労働者が新たに加入対象。',
    oldRule: '従業員101人以上の企業が短時間労働者の社会保険適用義務の対象',
    newRule: '従業員51人以上の企業も短時間労働者の社会保険適用が義務化',
    impact: '顧問先の51〜100人規模の企業に新たな保険料負担が発生。パート・アルバイトの労働時間・賃金管理の見直しが必要です。',
    requiredTasks: [
      '51〜100人規模の顧問先リストアップ',
      '対象短時間労働者の洗い出し（週20h以上・月収8.8万円以上）',
      '保険料の会社負担額試算',
      '対象従業員への事前説明',
      '加入手続きスケジュールの作成',
    ],
    draftNotice: `【重要：社会保険適用拡大についてのご案内】

2026年10月より、従業員51人以上の企業においても、一定の条件を満たすパート・アルバイト等の短時間労働者に社会保険が適用されます。

■ 適用対象となる短時間労働者
・週の所定労働時間が20時間以上
・月額賃金が8.8万円以上
・継続して2か月を超えて雇用する見込み
・学生でないこと

早めの準備が重要です。まずは現在のパート・アルバイトの勤務状況をご確認の上、担当社労士にご連絡ください。`,
    status: 'unconfirmed',
    sourceUrl: 'https://www.nenkin.go.jp/service/kounen/tekiyo/jigyosho/20151104.html',
  },
  {
    id: 'la004',
    title: '障害者法定雇用率引き上げ（2026年7月〜）',
    source: '厚生労働省',
    publishDate: '2025-12-01',
    effectiveDate: '2026-07-01',
    importance: 'medium',
    category: '雇用・採用',
    targetCompany: '従業員40人以上の企業',
    summary: '障害者の法定雇用率が2.5%から2.7%に引き上げ。雇用義務が生じる企業の規模も従業員40人以上に変更。',
    oldRule: '法定雇用率2.5%、雇用義務は従業員43.5人以上',
    newRule: '法定雇用率2.7%、雇用義務は従業員40人以上に変更',
    impact: '40〜43人規模の企業で新たに雇用義務が発生する可能性。既存の対象企業も雇用率の再計算が必要。',
    requiredTasks: [
      '対象顧問先（40人以上）の確認',
      '現状の障害者雇用率の計算',
      '未達の場合の採用計画立案',
      '障害者雇用助成金の活用検討',
    ],
    draftNotice: `【障害者法定雇用率改定のお知らせ】

2026年7月より障害者の法定雇用率が2.5%から2.7%に引き上げられます。

現在の雇用状況を確認し、目標雇用率を達成するための対応計画について、担当社労士にご相談ください。`,
    status: 'confirmed',
    confirmedBy: '鈴木 花子',
    confirmedAt: '2026-04-20T14:30:00',
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/shougaishakoyou/03.html',
  },
  {
    id: 'la005',
    title: '産後パパ育休の周知・意向確認義務（2023年4月〜）',
    source: '厚生労働省',
    publishDate: '2023-02-01',
    effectiveDate: '2023-04-01',
    importance: 'medium',
    category: '育児・介護',
    targetCompany: '全企業',
    summary: '男性育児休業（産後パパ育休）について、妊娠・出産の申し出をした労働者への制度周知と取得の意向確認が義務化。',
    oldRule: '育児休業制度の周知・意向確認は努力義務',
    newRule: '妊娠・出産申し出時に制度周知と取得意向確認が義務（全企業対象）',
    impact: '全顧問先で対応必要。特に男性社員の育休取得促進のための手続きと面談記録の整備が重要。',
    requiredTasks: [
      '周知・意向確認の手続きフローの整備',
      '面談記録様式の作成',
      '担当管理職への研修',
    ],
    draftNotice: `【産後パパ育休に関する周知・意向確認義務のお知らせ】

2023年4月より、妊娠・出産（本人または配偶者）を申し出た従業員に対して、育児休業制度の周知と取得意向の確認が義務となりました。

対応方法について、当事務所のひな型をご活用ください。`,
    status: 'notified',
    confirmedBy: '田中 太郎',
    confirmedAt: '2023-03-25T09:00:00',
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000130583.html',
  },
]

// --- 助成金・補助金 ---
export type SubsidyStatus = 'candidate' | 'reviewing' | 'proposed' | 'applying' | 'excluded' | 'completed'

export interface Subsidy {
  id: string
  name: string
  region: string
  industry: string
  category: string
  amount: string
  requirements: string[]
  documents: string[]
  deadline: string
  score: number
  proposalText: string
  nextSteps: string[]
  sourceUrl: string
  status: SubsidyStatus
}

export const mockSubsidies: Subsidy[] = [
  {
    id: 's001',
    name: 'キャリアアップ助成金（正社員化コース）',
    region: '全国', industry: '全業種', category: '雇用・人材',
    amount: '57万円〜72万円（1人あたり）',
    requirements: ['有期雇用労働者等を正規雇用に転換', '転換後6か月分の賃金を支払い', '転換前後で賃金3%以上増額'],
    documents: ['申請書', '転換前後の就業規則', '賃金台帳（6か月分）', '労働契約書', '出勤簿'],
    deadline: '2026-09-30',
    score: 92,
    proposalText: '現在パート・アルバイトとして雇用されているスタッフの正社員化により、1人あたり最大72万円の助成が受けられます。人材定着率の向上と採用コスト削減にも貢献します。キャリアアップ計画書の作成から申請まで、当事務所が全面サポートいたします。',
    nextSteps: ['キャリアアップ計画書の作成・提出', '転換対象者の選定と同意取得', '就業規則の整備確認'],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/part_haken/jigyounushi/career.html',
    status: 'candidate',
  },
  {
    id: 's002',
    name: '両立支援等助成金（育児休業等支援コース）',
    region: '全国', industry: '全業種', category: '育児・介護',
    amount: '30万円〜60万円',
    requirements: ['育児休業取得者を雇用する中小企業', '代替要員の確保', '職場復帰支援計画の策定'],
    documents: ['申請書', '育児休業規程', '育児休業取得証明書', '代替要員雇用証明書'],
    deadline: '2026-12-31',
    score: 88,
    proposalText: '育児休業取得者が発生した際に代替要員を確保した場合、最大60万円の助成が受けられます。育休取得率の向上と人材確保コストの低減を同時に実現できます。',
    nextSteps: ['育児休業予定者の確認', '代替要員確保計画の作成', '育児休業等プランの策定'],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/shokuba_kosodate/ryouritsu01/',
    status: 'proposed',
  },
  {
    id: 's003',
    name: '業務改善助成金',
    region: '全国', industry: '全業種（中小企業）', category: 'DX・設備投資',
    amount: '30万円〜600万円（補助率最大4/5）',
    requirements: ['中小企業・小規模事業者', '生産性向上のための設備投資等の実施', '事業場内最低賃金の引き上げ（30円以上）'],
    documents: ['交付申請書', '設備投資計画書', '見積書', '賃金台帳（最低賃金確認用）'],
    deadline: '2026-12-26',
    score: 75,
    proposalText: '設備投資とセットで最低賃金を引き上げた事業主に対し、設備投資費用の最大4/5を助成します。IT・DX化投資の好機として積極的にご活用ください。賃上げ計画と合わせてご提案いたします。',
    nextSteps: ['設備投資計画の具体化（ITツール・機械設備等）', '引き上げ後の最低賃金試算', '見積書の取得（2社以上）'],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/zigyonushi/shienjigyou/02.html',
    status: 'candidate',
  },
  {
    id: 's004',
    name: '人材開発支援助成金（人への投資促進コース）',
    region: '全国', industry: '全業種', category: '人材育成',
    amount: '経費の最大75%（上限150万円）',
    requirements: ['雇用保険の適用事業主', 'Off-JT（社外研修）の実施', '訓練計画の事前届出'],
    documents: ['訓練計画届', '受講証明書', '領収書', '賃金台帳'],
    deadline: '2027-03-31',
    score: 82,
    proposalText: '従業員のスキルアップ研修費用の最大75%が助成されます。DX・デジタルスキル向上研修には特に高い助成率が適用されます。研修計画から申請まで当事務所がサポートします。',
    nextSteps: ['訓練計画の作成', '対象研修の選定（DX・ITスキル研修を優先）', '訓練計画届の提出（研修開始1か月前まで）'],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/kyufukin/d01-1.html',
    status: 'reviewing',
  },
  {
    id: 's005',
    name: '東京都 中小企業デジタル化支援補助金',
    region: '東京都', industry: '全業種（中小企業）', category: 'DX・設備投資',
    amount: '最大200万円（補助率2/3）',
    requirements: ['東京都内に主要事業所を有する中小企業', 'デジタルツール導入による業務効率化', '補助対象経費50万円以上'],
    documents: ['交付申請書', '事業計画書', '見積書（2社以上）', '決算書（直近2期分）'],
    deadline: '2026-06-30',
    score: 78,
    proposalText: '東京都の補助金で、クラウド会計・勤怠管理システム等の導入費用の2/3（最大200万円）を補助。ITツール導入を検討中の顧問先に積極的にご提案ください。',
    nextSteps: ['対象ツールの選定（クラウド会計・HR・勤怠管理等）', '事業計画書の作成', '東京都産業労働局への事前相談'],
    sourceUrl: 'https://www.tokyo-kosha.or.jp/',
    status: 'candidate',
  },
  {
    id: 's006',
    name: '65歳超雇用推進助成金（65歳超継続雇用促進コース）',
    region: '全国', industry: '全業種', category: '高齢者雇用',
    amount: '最大160万円',
    requirements: ['定年の引き上げまたは廃止', '希望者全員を対象とした70歳以上までの継続雇用制度の導入'],
    documents: ['交付申請書', '改定後の就業規則', '労働協約等', '対象者の雇用証明書'],
    deadline: '2026-09-30',
    score: 65,
    proposalText: '定年延長や高齢者雇用制度を整備した企業に最大160万円の助成。人手不足解消とシニア人材活用を同時に実現できます。',
    nextSteps: ['現行定年規定の確認', '高齢者雇用方針の検討', '就業規則改定の準備'],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/kourei/65jyochosei.html',
    status: 'candidate',
  },
  {
    id: 's007',
    name: '働き方改革推進支援助成金（労働時間短縮・年休促進支援コース）',
    region: '全国', industry: '全業種（中小企業）', category: '働き方改革',
    amount: '最大100万円（補助率3/4）',
    requirements: ['中小企業事業主', '年次有給休暇の取得促進に向けた環境整備', '時間外労働の削減計画策定'],
    documents: ['計画届', '支給申請書', '就業規則', 'タイムカード・勤怠記録'],
    deadline: '2026-11-30',
    score: 70,
    proposalText: '残業削減・有給促進のためのシステム導入費用に最大100万円の助成。働き方改革法対応と生産性向上を同時に実現できます。',
    nextSteps: ['現状の時間外労働時間の確認', '削減目標の設定', '勤怠管理システムの選定'],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000190097.html',
    status: 'candidate',
  },
  {
    id: 's008',
    name: '雇用調整助成金',
    region: '全国', industry: '全業種', category: '雇用維持',
    amount: '休業手当の最大4/5（中小企業）',
    requirements: ['景気変動等経済上の理由による事業活動の縮小', '雇用保険適用事業所', '休業等の実施計画の届出'],
    documents: ['支給申請書', '休業実施状況一覧表', '出勤簿', '賃金台帳'],
    deadline: '随時受付',
    score: 40,
    proposalText: '経営上の理由で従業員を休業させた場合に休業手当の最大4/5を助成。緊急時の雇用維持策として把握しておくことをお勧めします。',
    nextSteps: ['制度の仕組みの理解', '申請条件の事前確認'],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/kyufukin/pageL07.html',
    status: 'excluded',
  },
]

// --- 顧問先 ---
export interface Client {
  id: string
  name: string
  industry: string
  region: string
  employees: number
  size: string
  contractDate: string
  status: 'active' | 'inactive'
  pendingAlerts: number
  pendingSubsidies: number
  monthlyFee: number
  contactPerson: string
  phone: string
  email: string
  tags: string[]
}

export const mockClients: Client[] = [
  {
    id: 'c001', name: '株式会社山田製作所', industry: '製造業', region: '東京都',
    employees: 45, size: '中小企業', contractDate: '2022-04-01', status: 'active',
    pendingAlerts: 3, pendingSubsidies: 5, monthlyFee: 35000,
    contactPerson: '山田 一郎', phone: '03-1234-5678', email: 'yamada@yamada-mfg.co.jp',
    tags: ['製造', '東京', '優先対応'],
  },
  {
    id: 'c002', name: '佐藤商事株式会社', industry: '卸売業', region: '神奈川県',
    employees: 28, size: '中小企業', contractDate: '2021-10-01', status: 'active',
    pendingAlerts: 2, pendingSubsidies: 3, monthlyFee: 25000,
    contactPerson: '佐藤 次郎', phone: '045-234-5678', email: 'sato@sato-trading.co.jp',
    tags: ['卸売', '神奈川'],
  },
  {
    id: 'c003', name: '株式会社鈴木フード', industry: '飲食業', region: '東京都',
    employees: 65, size: '中小企業', contractDate: '2023-01-01', status: 'active',
    pendingAlerts: 4, pendingSubsidies: 6, monthlyFee: 45000,
    contactPerson: '鈴木 三郎', phone: '03-3456-7890', email: 'suzuki@suzuki-food.co.jp',
    tags: ['飲食', '東京', '最低賃金要確認'],
  },
  {
    id: 'c004', name: '田中建設株式会社', industry: '建設業', region: '埼玉県',
    employees: 92, size: '中小企業', contractDate: '2020-07-01', status: 'active',
    pendingAlerts: 2, pendingSubsidies: 4, monthlyFee: 60000,
    contactPerson: '田中 四郎', phone: '048-456-7890', email: 'tanaka@tanaka-const.co.jp',
    tags: ['建設', '埼玉', '大口'],
  },
  {
    id: 'c005', name: '伊藤クリニック', industry: '医療・福祉', region: '東京都',
    employees: 18, size: '小規模企業', contractDate: '2024-04-01', status: 'active',
    pendingAlerts: 1, pendingSubsidies: 2, monthlyFee: 20000,
    contactPerson: '伊藤 五郎', phone: '03-5678-9012', email: 'ito@ito-clinic.jp',
    tags: ['医療', '東京', '新規'],
  },
  {
    id: 'c006', name: '渡辺テクノロジー株式会社', industry: 'IT・情報通信', region: '東京都',
    employees: 38, size: '中小企業', contractDate: '2023-09-01', status: 'active',
    pendingAlerts: 3, pendingSubsidies: 7, monthlyFee: 30000,
    contactPerson: '渡辺 六郎', phone: '03-6789-0123', email: 'watanabe@watanabe-tech.co.jp',
    tags: ['IT', '東京', 'DX推進'],
  },
]
