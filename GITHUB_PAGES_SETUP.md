# GitHub Pages + 独自ドメイン（bashotori.com）設定手順

BASHOTORI を GitHub Pages で公開し、独自ドメイン **bashotori.com** で表示する手順です。

---

## 1. リポジトリの Secrets を設定

ビルド時に必要な環境変数を GitHub の Secrets に入れます。

1. リポジトリの **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** で以下を追加：

| Name | 説明 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase の URL（例: `https://xxxx.supabase.co`） |
| `VITE_SUPABASE_ANON_KEY` | Supabase の anon key |
| `VITE_AWS_API_GATEWAY_URL` | （任意）AI検索を使う場合の Lambda API Gateway URL |

---

## 2. GitHub Pages を有効化（デプロイ元: GitHub Actions）

1. リポジトリの **Settings** → **Pages**
2. **Build and deployment** の **Source** で **GitHub Actions** を選択

これで `main` に push するたびに `.github/workflows/deploy-github-pages.yml` が動き、ビルド結果が GitHub Pages にデプロイされます。

---

## 3. 独自ドメイン（bashotori.com）を GitHub に登録

1. 同じ **Settings** → **Pages** の **Custom domain** 欄に **bashotori.com** を入力
2. **Save** をクリック
3. （推奨）表示された **Enforce HTTPS** にチェックを入れる（DNS 反映後、最大 24 時間で有効になることがあります）

---

## 4. DNS の設定（ドメイン管理画面で実施）

bashotori.com を管理しているサービス（お名前.com、Cloudflare、Route53 など）の DNS 設定で、次のどちらかを行います。

### パターン A:  apex のみ（bashotori.com だけ使う）

**A レコード**を 4 本追加します。

| タイプ | 名前（ホスト） | 値（IP アドレス） |
|--------|----------------|-------------------|
| A | `@` または `bashotori.com` | `185.199.108.153` |
| A | `@` または `bashotori.com` | `185.199.109.153` |
| A | `@` または `bashotori.com` | `185.199.110.153` |
| A | `@` または `bashotori.com` | `185.199.111.153` |

**AAAA レコード**（IPv6、任意）を追加する場合：

| タイプ | 名前 | 値 |
|--------|------|-----|
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

### パターン B: apex + www（bashotori.com と www.bashotori.com）

1. 上記と同じ **A レコード 4 本**を apex（`@`）に設定
2. **CNAME レコード**を 1 本追加：

| タイプ | 名前（ホスト） | 値 |
|--------|----------------|-----|
| CNAME | `www` | `あなたのGitHubユーザー名.github.io` |

例: ユーザー名が `hoikuen` なら、値は `hoikuen.github.io`（リポジトリ名は含めない）

---

## 5. 初回デプロイ

- **main** ブランチに push すると自動でデプロイされます
- 手動で実行する場合: **Actions** タブ → **Deploy to GitHub Pages** → **Run workflow**

---

## 6. 動作確認

- DNS の反映には数分〜最大 24 時間かかることがあります
- 反映後、以下でアクセスできることを確認してください：
  - **https://bashotori.com**（Enforce HTTPS を有効にした場合）
  - または **http://bashotori.com**
- GitHub の **Settings** → **Pages** で、Custom domain の横に「DNS check successful」などと出ていれば設定は問題ありません

---

## トラブルシューティング

### 「DNS check successful」にならない

- A レコードの IP が 4 つとも正しく設定されているか確認
- 既存の `@` の A レコードや「パークドメイン」など、競合するレコードを削除してから再度確認

### 404 になる / ルート以外で真っ白になる

- ビルドで `404.html` が出力されているか確認（vite のプラグインで `index.html` をコピーしている想定）
- ブラウザのキャッシュを無効にして再アクセス

### Supabase や AI が動かない

- **Secrets** に `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`（と必要なら `VITE_AWS_API_GATEWAY_URL`）が入っているか確認
- デプロイ後にビルドが走っているか **Actions** のログで確認

---

## 参考

- [GitHub Pages のカスタムドメイン公式ドキュメント](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- ワークフロー: `.github/workflows/deploy-github-pages.yml`
- 独自ドメイン用の CNAME: `public/CNAME`（GitHub Actions でデプロイする場合は Settings の Custom domain が優先され、CNAME ファイルは不要です）
