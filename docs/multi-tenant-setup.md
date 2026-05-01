# Multi-tenant setup

このアプリは、1つのドメインでログインユーザーの会社ごとに画面・データ・AI設定を切り替える構成です。

## 初回に実行するSQL

Supabase SQL Editorで次を実行します。

```sql
-- ファイルの中身をそのまま実行
-- supabase/migrations/20260501000000_multi_tenant.sql
```

このSQLで、現在の社労士向けTASUKU AIはデフォルト会社として作成されます。

```txt
company_id: 00000000-0000-0000-0000-000000000001
slug: tasuku-sr
name: TASUKU AI 社労士版
```

既存ユーザーと既存データは、このデフォルト会社に紐づきます。

## 別会社を追加する例

```sql
insert into public.companies (
  slug,
  name,
  product_name,
  industry_label,
  enabled_features
)
values (
  'beauty-salon',
  '美容サロンAI版',
  'TASUKU AI',
  '美容サロン AI アシスタント',
  array['dashboard', 'chat', 'email', 'reservation', 'customers', 'settings', 'admin']
)
returning id;
```

返ってきた `id` を使ってAI設定を追加します。

```sql
insert into public.company_ai_configs (
  company_id,
  assistant_name,
  assistant_description,
  system_prompt,
  suggested_questions
)
values (
  '<companies.id>',
  '美容サロンAIアシスタント',
  '予約対応・顧客対応・販促文を相談できます',
  'あなたは美容サロン運営向けのAIアシスタントです。予約対応、顧客対応、Instagram投稿、キャンペーン文案を実務的に支援してください。',
  array[
    '予約変更への返信文を作って',
    'リピーター向けキャンペーン文を考えて',
    'Instagram投稿の文章を作って'
  ]
);
```

ユーザーを会社に所属させます。

```sql
insert into public.company_memberships (company_id, user_id, role)
values ('<companies.id>', '<auth.users.id>', 'admin');
```

## 会社ごとの切り替え対象

- Sidebarの表示メニュー: `companies.enabled_features`
- DBデータ: `receipts.company_id`, `clients.company_id`, `law_alert_statuses.company_id`
- AIチャット: `company_ai_configs.system_prompt`
- 画面表示名: `companies.name`, `companies.product_name`, `companies.industry_label`
- 会社設定: `company_settings.settings`
