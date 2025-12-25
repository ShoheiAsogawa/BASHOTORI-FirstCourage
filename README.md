# BASHOTORI - 店舗視察管理システム

店舗視察データの管理と分析を行うWebアプリケーションです。GAS（Google Apps Script）からSupabase + AWSに移行しました。

## 技術スタック

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (画像保存)
- **AI**: Google Gemini API (AWS Lambda経由)
- **Hosting**: AWS (S3 + CloudFront) / Vercel / Netlify

## クイックスタート

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、必要な値を設定してください：

```bash
cp .env.example .env
```

必要な環境変数：
- `VITE_SUPABASE_URL`: SupabaseプロジェクトのURL
- `VITE_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `VITE_GEMINI_API_KEY`: Google Gemini APIキー（オプション）
- `VITE_AWS_API_GATEWAY_URL`: AWS API GatewayエンドポイントURL（オプション）

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

### 4. ビルド

```bash
npm run build
```

## セットアップガイド

詳細なセットアップ手順は [SETUP.md](./SETUP.md) を参照してください。

主な手順：
1. Supabaseプロジェクトの作成とマイグレーション実行
2. Storageバケットの作成
3. AWS Lambda関数の作成とデプロイ
4. 環境変数の設定

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
│   ├── lib/                 # ユーティリティ関数
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
├── infrastructure/
│   └── lambda/              # AWS Lambda関数
│       ├── gemini-handler.ts
│       └── package.json
└── package.json
```

## 主な機能

### 📅 カレンダー表示
- 月次カレンダーで視察記録を一覧表示
- 日付をクリックして詳細表示
- ランク・判定による色分け表示

### 📊 ダッシュボード（別画面）
- 年間・月間の統計表示
- ランク別・判定別の内訳表示
- AI営業アドバイス機能

### 🔍 AI店舗検索
- 地域名を入力してAIが商業施設を検索
- Google検索連動で最新情報を取得

### 📝 詳細な店舗登録フォーム
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

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run type-check

# プレビュー
npm run preview
```

## ドキュメント

- [SETUP.md](./SETUP.md) - 詳細なセットアップガイド
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - プロジェクト概要

## ライセンス

MIT

