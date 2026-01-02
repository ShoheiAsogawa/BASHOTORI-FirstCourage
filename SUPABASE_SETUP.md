# Supabase セットアップ手順（AWS環境）

このガイドでは、BASHOTORIアプリケーションをSupabaseとAWSでセットアップする詳細な手順を説明します。

## 📋 目次

1. [Supabaseプロジェクトの作成](#1-supabaseプロジェクトの作成)
2. [データベースマイグレーションの実行](#2-データベースマイグレーションの実行)
3. [Storageバケットの作成](#3-storageバケットの作成)
4. [RLSポリシーの設定](#4-rlsポリシーの設定)
5. [APIキーの取得](#5-apiキーの取得)
6. [AWS Lambda関数のセットアップ](#6-aws-lambda関数のセットアップ)
7. [環境変数の設定](#7-環境変数の設定)
8. [動作確認](#8-動作確認)

---

## 1. Supabaseプロジェクトの作成

### 1.1 Supabaseアカウントの作成

1. [Supabase](https://supabase.com)にアクセス
2. 「Start your project」または「Sign in」をクリック
3. GitHubアカウントでサインイン（推奨）またはメールアドレスで登録

### 1.2 新規プロジェクトの作成

1. ダッシュボードで「New Project」をクリック
2. 以下の情報を入力：

   **組織の選択**
   - 既存の組織を選択、または新規作成

   **プロジェクト情報**
   - **Name**: `bashotori`（任意の名前）
   - **Database Password**: 強力なパスワードを設定（**必ずメモしておく**）
     - 例: `YourSecurePassword123!@#`
   - **Region**: `Northeast Asia (Tokyo)` を選択（日本からのアクセスが速い）
   - **Pricing Plan**: Free tier で開始可能

3. 「Create new project」をクリック
4. プロジェクトの作成を待つ（**約2-3分**）

> ⚠️ **重要**: データベースパスワードは後で変更できません。必ず安全な場所に保存してください。

---

## 2. データベースマイグレーションの実行

### 2.1 SQL Editorを開く

1. Supabaseダッシュボードで左メニューの「SQL Editor」をクリック
2. 「New query」をクリック

### 2.2 マイグレーションファイルの内容をコピー

1. ローカルの `supabase/migrations/001_initial_schema.sql` ファイルを開く
2. ファイルの内容をすべてコピー

### 2.3 SQLを実行

1. SQL Editorに貼り付け
2. 「Run」ボタンをクリック（または `Ctrl+Enter` / `Cmd+Enter`）
3. 成功メッセージが表示されることを確認

**実行される内容：**
- `store_visits` テーブルの作成
- インデックスの作成
- `updated_at` 自動更新トリガーの設定
- RLS（Row Level Security）の有効化

### 2.4 テーブルの確認

1. 左メニューの「Table Editor」をクリック
2. `store_visits` テーブルが作成されていることを確認
3. カラムが正しく作成されているか確認

---

## 3. Storageバケットの作成

### 3.1 Storageページを開く

1. 左メニューの「Storage」をクリック
2. 「Create a new bucket」をクリック

### 3.2 バケットの作成

以下の設定で作成：

- **Name**: `store-visit-photos`（**正確にこの名前**）
- **Public bucket**: ✅ **チェックを入れる**（画像を公開するため）
- **File size limit**: `5 MB`（デフォルト）
- **Allowed MIME types**: 空欄（すべて許可）

3. 「Create bucket」をクリック

### 3.3 Storageポリシーの設定

1. 作成したバケットをクリック
2. 「Policies」タブをクリック
3. 「New Policy」をクリック

#### ポリシー1: 公開読み取り

1. 「For full customization」を選択
2. ポリシー名: `Public Read Access`
3. 以下のSQLを貼り付け：

```sql
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-visit-photos');
```

4. 「Review」→「Save policy」をクリック

#### ポリシー2: 公開アップロード（開発用）

1. 「New Policy」をクリック
2. ポリシー名: `Public Upload Access`
3. 以下のSQLを貼り付け：

```sql
CREATE POLICY "Public Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-visit-photos');
```

4. 「Review」→「Save policy」をクリック

#### ポリシー3: 公開削除（開発用）

1. 「New Policy」をクリック
2. ポリシー名: `Public Delete Access`
3. 以下のSQLを貼り付け：

```sql
CREATE POLICY "Public Delete Access"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-visit-photos');
```

4. 「Review」→「Save policy」をクリック

> ⚠️ **セキュリティ注意**: 本番環境では、認証済みユーザーのみがアップロード・削除できるようにポリシーを変更してください。

---

## 4. RLSポリシーの設定

### 4.1 テーブルのRLSポリシー確認

1. 左メニューの「Authentication」→「Policies」をクリック
2. `store_visits` テーブルを選択
3. 既存のポリシーを確認

### 4.2 ポリシーの調整（必要に応じて）

開発環境では、既に `001_initial_schema.sql` で以下のポリシーが設定されています：

- 全ユーザーが読み書き可能（開発用）

本番環境では、認証を追加することを推奨します。

---

## 5. APIキーの取得

### 5.1 プロジェクト設定を開く

1. 左メニューの「Settings」（⚙️アイコン）をクリック
2. 「API」を選択

### 5.2 必要な情報をコピー

以下の2つの値をコピーしてメモしておきます：

1. **Project URL**
   - 例: `https://xxxxxxxxxxxxx.supabase.co`
   - → `.env` ファイルの `VITE_SUPABASE_URL` に設定

2. **anon public** key
   - 「Project API keys」セクションの `anon public` の値をコピー
   - 例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - → `.env` ファイルの `VITE_SUPABASE_ANON_KEY` に設定

> ⚠️ **重要**: `service_role` keyは**絶対に**フロントエンドで使用しないでください。サーバーサイドのみで使用します。

---

## 6. AWS Lambda関数のセットアップ

### 6.1 AWSアカウントの準備

1. [AWS Console](https://console.aws.amazon.com/)にログイン
2. リージョンを `ap-northeast-1`（東京）に設定

### 6.2 Lambda関数の作成

1. AWS Consoleで「Lambda」を検索して開く
2. 「関数の作成」をクリック
3. 以下の設定で作成：

   **基本設定**
   - **関数名**: `bashotori-gemini`
   - **ランタイム**: `Node.js 20.x`
   - **アーキテクチャ**: `x86_64`

4. 「関数の作成」をクリック

### 6.3 環境変数の設定

1. Lambda関数の「設定」タブを開く
2. 「環境変数」をクリック
3. 「編集」をクリック
4. 以下の環境変数を追加：

   **Key**: `GEMINI_API_KEY`  
   **Value**: Google Gemini APIキー

   > Gemini APIキーの取得方法:
   > 1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
   > 2. Googleアカウントでログイン
   > 3. 「Create API Key」をクリック
   > 4. 生成されたキーをコピー

5. 「保存」をクリック

### 6.4 Lambda関数のコードをデプロイ

#### 方法1: インライン編集（簡単）

1. Lambda関数の「コード」タブを開く
2. `infrastructure/lambda/gemini-handler.ts` をJavaScriptに変換：

```typescript
// 以下のコードをJavaScriptに変換して貼り付け
// または、ローカルでコンパイルしてからコピー
```

3. 以下のJavaScriptコードを貼り付け：

```javascript
export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';

  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'GEMINI_API_KEY is not set' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { prompt } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        tools: [{ google_search: {} }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Gemini API request failed', details: errorData }),
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: data.error.message || 'Gemini API error' }),
      };
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ result }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    };
  }
};
```

4. 「Deploy」をクリック

#### 方法2: ZIPファイルでアップロード（推奨）

1. ローカルでTypeScriptをコンパイル：

```bash
cd infrastructure/lambda
npm install
npm run build
```

2. ZIPファイルを作成（`dist`フォルダと`node_modules`を含む）
3. Lambda関数の「コード」タブで「アップロード元」→「.zipファイル」を選択
4. ZIPファイルをアップロード

### 6.5 API Gatewayの設定

1. Lambda関数の「設定」タブを開く
2. 「トリガー」セクションで「トリガーを追加」をクリック
3. 以下の設定：

   **トリガーの設定**
   - **ソース**: `API Gateway`
   - **API**: `新しいAPIを作成`
   - **APIタイプ**: `REST API`
   - **セキュリティ**: `オープン`（開発用、本番では認証を追加）

4. 「追加」をクリック
5. **APIエンドポイントURL**をコピー
   - 例: `https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/default/bashotori-gemini`
   - → `.env` ファイルの `VITE_AWS_API_GATEWAY_URL` に設定

### 6.6 CORSの設定（必要に応じて）

1. API Gatewayコンソールで作成したAPIを開く
2. 「アクション」→「CORSを有効にする」をクリック
3. 設定を適用

---

## 7. 環境変数の設定

### 7.1 .envファイルの作成

プロジェクトルート（`bashotori/`）に `.env` ファイルを作成：

```env
# Supabase設定
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AWS API Gateway（Gemini API用）
VITE_AWS_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/default/bashotori-gemini

# Gemini APIキー（オプション、Lambda関数で使用）
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 7.2 値の設定

1. **VITE_SUPABASE_URL**: 5.2でコピーしたProject URL
2. **VITE_SUPABASE_ANON_KEY**: 5.2でコピーしたanon public key
3. **VITE_AWS_API_GATEWAY_URL**: 6.5でコピーしたAPIエンドポイントURL
4. **VITE_GEMINI_API_KEY**: （オプション）直接フロントエンドで使用する場合

> ⚠️ **注意**: `.env` ファイルは `.gitignore` に含まれているため、Gitにコミットされません。

---

## 8. 動作確認

### 8.1 依存関係のインストール

```bash
cd bashotori
npm install
```

### 8.2 開発サーバーの起動

```bash
npm run dev
```

### 8.3 ブラウザで確認

1. `http://localhost:3000` を開く
2. 以下の機能をテスト：

   ✅ **カレンダー表示**: 正常に表示されるか
   ✅ **新規登録**: フォームが開くか
   ✅ **データ保存**: Supabaseに保存されるか
   ✅ **画像アップロード**: Storageにアップロードされるか
   ✅ **AI検索**: Gemini APIが動作するか

### 8.4 データベースの確認

1. Supabaseダッシュボードの「Table Editor」を開く
2. `store_visits` テーブルにデータが保存されているか確認

### 8.5 Storageの確認

1. Supabaseダッシュボードの「Storage」を開く
2. `store-visit-photos` バケットに画像がアップロードされているか確認

---

## 🔧 トラブルシューティング

### Supabase接続エラー

**エラー**: `Missing Supabase environment variables`

**解決方法**:
- `.env` ファイルが正しい場所にあるか確認
- 環境変数の値が正しいか確認
- 開発サーバーを再起動

### 画像アップロードエラー

**エラー**: `Error uploading image`

**解決方法**:
- Storageバケット名が `store-visit-photos` になっているか確認
- Storageポリシーが正しく設定されているか確認
- バケットが「Public」になっているか確認

### Gemini APIエラー

**エラー**: `Gemini API request failed`

**解決方法**:
- Lambda関数の環境変数 `GEMINI_API_KEY` が設定されているか確認
- API GatewayのエンドポイントURLが正しいか確認
- Lambda関数のログ（CloudWatch）を確認

### CORSエラー

**エラー**: `Access to fetch blocked by CORS policy`

**解決方法**:
- API GatewayでCORSが有効になっているか確認
- Lambda関数のレスポンスヘッダーにCORSヘッダーが含まれているか確認

---

## 📚 次のステップ

- [ ] 認証機能の追加（Supabase Auth）
- [ ] 本番環境のセキュリティ設定
- [ ] 監視・ログ設定（CloudWatch等）
- [ ] カスタムドメインの設定
- [ ] CI/CDパイプラインの構築

---

## 🔒 セキュリティチェックリスト

本番環境にデプロイする前に：

- [ ] RLSポリシーを認証済みユーザーのみに制限
- [ ] Storageポリシーを認証済みユーザーのみに制限
- [ ] API Gatewayに認証を追加
- [ ] 環境変数を環境ごとに分離
- [ ] ログから機密情報を除外
- [ ] レート制限を設定

---

## 📞 サポート

問題が発生した場合：

1. Supabaseドキュメント: https://supabase.com/docs
2. AWS Lambdaドキュメント: https://docs.aws.amazon.com/lambda/
3. プロジェクトのIssues: https://github.com/ShoheiAsogawa/BASHOTORI/issues

