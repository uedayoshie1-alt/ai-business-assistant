# BizAssist AI — AI業務アシスタント MVP

中小企業向けのAI業務代行パッケージ。営業メール・議事録・提案文の作成を一つの管理画面で支援します。

---

## 起動方法

### 必要環境
- Node.js 18以上
- npm または yarn

### インストール・起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと自動でダッシュボードにリダイレクトされます。

### ビルド（本番用）

```bash
npm run build
npm start
```

---

## 機能一覧

| 機能 | ステータス | 説明 |
|------|-----------|------|
| ダッシュボード | ✅ 実装済み | 全体の状況確認・クイックアクセス |
| 営業メール作成 | ✅ 実装済み | 宛先・用件・目的・温度感から自動生成 |
| 議事録作成 | ✅ 実装済み | 会議メモを整理された議事録に変換 |
| 提案文作成 | ✅ 実装済み | 課題・提案内容から提案書たたき台を生成 |
| 見積作成 | 🚧 UI実装 | 次フェーズでPDF出力・保存機能を実装 |
| 予約対応 | 🚧 UI実装 | 次フェーズで返信文生成・カレンダー連携を実装 |
| 履歴管理 | ✅ 実装済み | 作成したドキュメントの一覧・検索 |
| 設定 | ✅ 実装済み | 会社情報・文体・テンプレートの管理 |

---

## ディレクトリ構成

```
ai-business-assistant/
├── app/                    # Next.js App Router
│   ├── dashboard/          # ダッシュボード
│   ├── email/              # 営業メール作成
│   ├── minutes/            # 議事録作成
│   ├── proposal/           # 提案文作成
│   ├── estimate/           # 見積作成（UI）
│   ├── reservation/        # 予約対応（UI）
│   ├── settings/           # 設定
│   └── history/            # 履歴
│
├── components/             # コンポーネント
│   ├── layout/             # レイアウト（サイドバー・ヘッダー）
│   ├── ui/                 # 汎用UIコンポーネント
│   ├── dashboard/          # ダッシュボード部品
│   ├── email/              # 営業メール（フォーム・出力）
│   ├── minutes/            # 議事録（フォーム・出力）
│   ├── proposal/           # 提案文（フォーム・出力）
│   ├── estimate/           # 見積フォーム
│   ├── reservation/        # 予約フォーム
│   ├── settings/           # 設定フォーム
│   └── history/            # 履歴リスト
│
├── lib/
│   ├── types.ts            # TypeScript型定義
│   ├── mock-generators.ts  # モック生成ロジック（将来APIに差替え）
│   ├── sample-data.ts      # ダミーデータ
│   └── utils.ts            # ユーティリティ関数
```

---

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイル**: Tailwind CSS v4
- **アイコン**: Lucide React

---

## APIへの接続方法（将来対応）

現在、生成処理は `lib/mock-generators.ts` のモック関数で実装されています。

実際のAI APIに接続する場合は、このファイルの各関数の中身をAPIコールに差し替えるだけです：

```typescript
// lib/mock-generators.ts

// 現在（モック）
export async function generateEmail(data: EmailFormData): Promise<EmailOutput> {
  await delay(1200)
  return { /* ダミーデータ */ }
}

// 将来（API接続後）
export async function generateEmail(data: EmailFormData): Promise<EmailOutput> {
  const response = await fetch('/api/generate/email', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}
```

---

## 今後の拡張候補

### フェーズ2（機能拡充）
- [ ] **見積PDF出力**: 見積書のPDF生成・ダウンロード
- [ ] **予約返信文生成**: お断り・確認・変更の返信文を自動生成
- [ ] **Googleカレンダー連携**: 予約をカレンダーに自動登録
- [ ] **実際のAI API接続**: Claude / GPT-4などへの接続

### フェーズ3（高度化）
- [ ] **音声入力（議事録）**: 音声ファイルのテキスト変換
- [ ] **メール送信連携**: Gmail / Outlookと直接連携
- [ ] **Word / PowerPoint出力**: 提案文をOffice形式で出力
- [ ] **チーム共有・承認フロー**: 複数メンバーでの承認ワークフロー
- [ ] **テンプレート学習**: 過去の承認済み文書から会社固有の文体を学習
- [ ] **顧客管理（CRM連携）**: 案件・顧客情報と紐付けた履歴管理
- [ ] **Slack / Chatwork通知**: 承認完了・リマインダーの通知
