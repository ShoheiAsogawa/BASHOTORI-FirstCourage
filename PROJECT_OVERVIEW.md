# BASHOTORI プロジェクト概要

## 概要

BASHOTORIは、店舗視察データの管理と分析を行うWebアプリケーションです。GAS（Google Apps Script）から Supabase ベースの構成に移行し、よりスケーラブルで保守しやすいアーキテクチャを実現しました。

## 主な機能

### 1. カレンダー表示
- 月次カレンダーで視察記録を一覧表示
- 日付をクリックして詳細表示
- ランク・判定による色分け表示

### 2. ダッシュボード（別画面）
- 年間・月間の統計表示
- ランク別・判定別の内訳表示
- AI営業アドバイス機能

### 3. AI店舗検索
- 地域名を入力してAIが商業施設を検索
- Google検索連動で最新情報を取得
- マークダウン形式で結果を表示

### 4. 詳細な店舗登録フォーム
以下の新機能を追加：
- **都道府県選択**: 北海道から沖縄まで47都道府県
- **レジ設置台数**: 1-3台、4-6台、7台以上
- **近隣競合店**: 無し、1店舗、2店舗、3店舗以上（備考欄あり）
- **通行量**: 少ない、普通、多い（備考欄あり）
- **客層**: 複数選択可（ファミリー層、ラグジュアリー層、シニア層、主婦層、女性多め、男性多め）+ 備考欄
- **導線**: ◎、⚪︎、△ + 備考欄
- **季節**: 春秋ならok、オールシーズンok
- **客が多い曜日**: 土日祝、何曜日でもok + 備考欄
- **適正査定員人数**: 1人、2人、3人
- **催事スペースの広さ**: 小さい、普通、広い + 備考欄
- **画像アップロード**: 最大3枚（自動圧縮）

## 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **Vite** (ビルドツール)
- **Tailwind CSS** (スタイリング)
- **React Router** (ルーティング)
- **Lucide React** (アイコン)
- **Marked** (マークダウン解析)
- **date-fns** (日付処理)

### バックエンド
- **Supabase** (PostgreSQL + Storage)

### 外部API
- **Google Gemini API** (AI検索・分析、`VITE_GEMINI_API_KEY`)

## プロジェクト構造

```
bashotori/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── Calendar.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DayDetailModal.tsx
│   │   ├── Icon.tsx
│   │   ├── Navbar.tsx
│   │   └── StoreFormModal.tsx
│   ├── lib/                 # ユーティリティ
│   │   ├── constants.ts
│   │   ├── gemini.ts
│   │   ├── storage.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── pages/               # ページコンポーネント
│   │   ├── CalendarView.tsx
│   │   ├── DashboardView.tsx
│   │   └── StoreSearchView.tsx
│   ├── types/               # TypeScript型定義
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/          # データベースマイグレーション
│       └── 001_initial_schema.sql
├── .github/
│   └── workflows/           # GitHub Pages デプロイ等
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── SETUP.md                  # セットアップガイド
└── README.md
```

## データベーススキーマ

### store_visits テーブル

主要なカラム：
- `id`: UUID (主キー)
- `date`: DATE (視察日)
- `facility_name`: TEXT (施設名)
- `staff_name`: TEXT (担当者名)
- `prefecture`: TEXT (都道府県)
- `rank`: TEXT (S, A, B, C)
- `judgment`: TEXT (pending, negotiating, approved, rejected)
- `environment`: TEXT (屋内, 半屋内, 屋外)
- `register_count`: TEXT (レジ設置台数)
- `traffic_count`: TEXT (通行量)
- `demographics`: JSONB (客層配列)
- `flow_line`: TEXT (導線評価)
- `competitors`: TEXT (近隣競合店)
- `staff_count`: TEXT (適正査定員人数)
- `seasonality`: TEXT (季節適性)
- `busy_day`: TEXT (客が多い曜日)
- `photo_url`: TEXT (画像URLのJSON文字列)
- `created_at`, `updated_at`: TIMESTAMPTZ

## セットアップ手順

詳細は [SETUP.md](./SETUP.md) を参照してください。

1. Supabaseプロジェクトの作成
2. データベースマイグレーションの実行
3. Storageバケットの作成
4. 環境変数の設定（必要なら Gemini API キー）
5. フロントエンドのビルドとデプロイ（GitHub Pages 等）

## 環境変数

`.env`ファイルに以下を設定：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 開発コマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run type-check
```

## 移行内容

### GASから移行した機能
- ✅ Googleスプレッドシート → Supabase PostgreSQL
- ✅ Google Drive画像保存 → Supabase Storage
- ✅ GAS関数 → クライアント＋Supabase（Gemini はブラウザから直接呼び出し）
- ✅ HTML Service → React SPA

### 追加・改善した機能
- ✅ 都道府県選択機能
- ✅ レジ設置台数選択
- ✅ 近隣競合店の詳細入力
- ✅ 通行量・客層の詳細入力
- ✅ 導線評価の追加
- ✅ 季節・曜日の詳細入力
- ✅ 催事スペースの詳細入力
- ✅ ダッシュボード画面の分離
- ✅ 店舗検索画面の追加
- ✅ 画像自動圧縮機能

## ライセンス

MIT

