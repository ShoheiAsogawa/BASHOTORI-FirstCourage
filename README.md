# BASHOTORI - 店舗視察管理システム

店舗視察データの管理と分析を行うWebアプリケーションです。GAS（Google Apps Script）から Supabase ベースの構成に移行しました。

## 技術スタック

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (画像保存)
- **AI**: Google Gemini API（`VITE_GEMINI_API_KEY` でブラウザから呼び出し）
- **Hosting**: GitHub Pages（`.github/workflows/pages.yml`）

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
- `VITE_GEMINI_API_KEY`: Google Gemini APIキー（AI店舗検索を使う場合）

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます（Vite のデフォルトポート）。

### 4. ビルド

```bash
npm run build
```

## GitHub Pages での公開

1. リポジトリの **Settings → Pages** で **Source** を **GitHub Actions** に設定する。
2. **Settings → Secrets and variables → Actions** に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY`、必要なら `VITE_GEMINI_API_KEY` を登録する。
3. `main` にプッシュすると `.github/workflows/pages.yml` が `dist` をデプロイする。

このリポジトリは **独自ドメイン（ルート配下）** 向けに `vite.config.ts` の `base` を `/` にしています（例: `https://bashotori.com/`）。

### 独自ドメイン（例: Cloudflare の `bashotori.com`）

**GitHub の無料アカウントでも、公開リポジトリの Pages に独自ドメインを付けられます**（GitHub 側の追加料金はありません。ドメインの更新料はレジストラ／Cloudflare のみ）。

1. **GitHub**: リポジトリ **Settings → Pages → Custom domain** に `bashotori.com`（または `www.bashotori.com`）を入力して保存する。DNS が有効になるまで **Enforce HTTPS** はしばらく待つ。
2. **Cloudflare DNS**（現在 CloudFront 向けの CNAME をやめる）:
   - **ルート（`bashotori.com`）**: CNAME で CloudFront を指しているレコードは削除し、[GitHub 公式の A レコード 4 件](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)（`185.199.108.153` など）を **`@` に向けて追加する。IPv6 用に AAAA 4 件を足してもよい。
   - **`www`**: CNAME のターゲットを **`ShoheiAsogawa.github.io`** にする（リポジトリ名は含めない）。
   - プロキシはまず **DNS only（グレーの雲）** で試すとトラブルが少ない。オレンジの雲にする場合は SSL/TLS を **Full** などに合わせる。
3. **Supabase 認証**: [SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md) のとおり、Site URL / リダイレクト URL に `https://bashotori.com`（および使うなら `https://www.bashotori.com`）を追加する。

**補足**: `https://<ユーザー>.github.io/<リポジトリ名>/` だけで見せたい場合は、`base` を `/<リポジトリ名>/`、`BrowserRouter` に `basename="/<リポジトリ名>"` を戻す必要がある（独自ドメインのルートとは両立しにくい）。

## セットアップガイド

- **[SETUP.md](./SETUP.md)** - 基本的なセットアップ手順
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Supabaseの設定
- **[SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md)** - 認証機能の設定

主な手順：

1. Supabaseプロジェクトの作成とマイグレーション実行
2. Storageバケットの作成
3. 環境変数の設定（ローカルは `.env`、本番は GitHub Secrets）
4. 上記 Pages 設定でデプロイ

## プロジェクト構造

```
bashotori/
├── src/
│   ├── components/          # Reactコンポーネント
│   ├── lib/                 # ユーティリティ・Supabase・Gemini 等
│   ├── pages/               # ページコンポーネント
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/          # データベースマイグレーション
├── .github/
│   └── workflows/
│       └── pages.yml       # GitHub Pages デプロイ
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
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase設定ガイド
- [SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md) - 認証機能設定ガイド
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - プロジェクト概要

## ライセンス

MIT
