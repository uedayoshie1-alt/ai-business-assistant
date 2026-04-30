# TASUKU AI — 社労士AI業務ダッシュボード

社会保険労務士事務所向けのAI業務支援システム。法改正アラート・助成金マッチング・領収書AI仕分け・AIチャットで業務を効率化します。

**本番URL**: https://tasukuai.com

---

## 機能一覧

| 機能 | ステータス | 説明 |
|------|-----------|------|
| ダッシュボード | ✅ 実装済み | 法改正件数・領収書件数をリアルタイム表示 |
| AIチャット | ✅ 実装済み | 労働法・社会保険・助成金に特化したRAG型チャット |
| 領収書AI仕分け | ✅ 実装済み | Google Document AI（Expense Parser）でOCR・勘定科目提案 |
| 法改正アラート | ✅ 実装済み | 厚労省RSS・e-Gov APIから24時間ごと自動取得 |
| 助成金マッチング | ✅ 実装済み | J-Grants APIから申請受付中の助成金をClaudeでスコアリング |
| 顧問先管理 | ✅ 実装済み | Supabase DBに保存・追加・削除 |
| 見積書 | ✅ 実装済み | PDF出力・localStorageに保存 |
| 請求明細書 | ✅ 実装済み | CSV/Excel/PDFアップロード・Google Vision APIでOCR |
| メール作成 | ✅ 実装済み | ユーザー署名をSupabaseから読み込み自動挿入 |
| GAS連携 | ✅ 実装済み | Google Apps Scriptとのスプレッドシート連携 |
| ユーザー認証 | ✅ 実装済み | Supabase Auth（Email/Password） |
| 管理者機能 | ✅ 実装済み | スタッフ招待・権限変更・削除 |
| レスポンシブ対応 | ✅ 実装済み | スマホ・タブレット対応（ハンバーガーメニュー） |

---

## ディレクトリ構成

```
ai-business-assistant/
├── app/
│   ├── dashboard/          # ダッシュボード（実データ表示）
│   ├── chat/               # AIチャット（ストリーミング・PDF対応）
│   ├── receipt/            # 領収書AI仕分け（Document AI + Vision API）
│   ├── law-alerts/         # 法改正アラート（RSS + e-Gov + Claude）
│   ├── subsidy/            # 助成金マッチング（J-Grants + Claude）
│   ├── clients/            # 顧問先管理（Supabase DB）
│   ├── invoice/            # 請求明細書
│   ├── estimate/           # 見積書
│   ├── email/              # メール作成
│   ├── login/              # ログイン・新規登録
│   ├── admin/              # 管理者設定
│   ├── settings/           # 個人・会社設定（Supabase保存）
│   └── api/
│       ├── receipt/analyze/        # Document AI OCR
│       ├── law-alerts/             # 法改正データ取得
│       ├── subsidy/match/          # 助成金マッチング
│       ├── chat/                   # AIチャット（ストリーミング）
│       ├── chat/parse-file/        # ファイル解析
│       ├── invoice/parse-pdf/      # PDF解析
│       └── admin/users/            # ユーザー管理
│
├── components/
│   ├── layout/             # AppLayout・Sidebar・Header
│   ├── email/              # メール作成フォーム・出力
│   ├── invoice/            # 請求明細書ビルダー
│   ├── estimate/           # 見積書フォーム
│   └── settings/           # 設定フォーム
│
├── lib/
│   ├── supabase.ts         # Supabaseクライアント
│   ├── db.ts               # DB操作（receipts・clients・law_alert_statuses）
│   ├── useRole.ts          # 権限管理フック（admin/staff）
│   ├── mock-data.ts        # 型定義・初期データ
│   ├── mock-generators.ts  # メール・議事録生成ロジック
│   ├── settings.ts         # 設定ユーティリティ
│   └── utils.ts            # 共通ユーティリティ
│
└── public/
    └── logo.PNG            # TASUKU AIロゴ（ネイビー×ゴールド）
```

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16.2.1 (App Router) |
| 言語 | TypeScript |
| スタイル | Tailwind CSS v4 |
| データベース・認証 | Supabase (PostgreSQL + Auth) |
| AI | Claude Sonnet 4.6 (Anthropic) |
| OCR | Google Document AI (Expense Parser) + Vision API |
| デプロイ | Vercel |
| ドメイン | tasukuai.com (ムームードメイン) |

---

## 環境変数

| 変数名 | 用途 |
|--------|------|
| `GOOGLE_VISION_API_KEY` | 領収書OCR（フォールバック） |
| `GOOGLE_DOCUMENT_AI_KEY` | 領収書AI仕分け（Expense Parser） |
| `ANTHROPIC_API_KEY` | Claude API（チャット・法改正・助成金） |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase接続URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase公開キー |
| `SUPABASE_SERVICE_ROLE_KEY` | ユーザー管理用（サーバーサイドのみ） |
| `NEXT_PUBLIC_GAS_ENDPOINT` | Google Apps Script連携URL |

---

## セットアップ

```bash
npm install
cp .env.local.example .env.local  # 環境変数を設定
npm run dev
```

---

## デプロイ

```bash
git push origin main
vercel --prod
```
