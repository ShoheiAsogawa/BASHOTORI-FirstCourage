# AWS で独自ドメイン（bashotori.com）を設定する手順

BASHOTORI を S3 + CloudFront で配信している前提で、**bashotori.com** を表示するための手順です。

---

## 前提

- すでに **S3 バケット** と **CloudFront ディストリビューション** が作成済み
- ドメイン **bashotori.com** を取得済み（お名前.com・Route 53・Cloudflare などどこでも可）

---

## 手順の流れ

1. **ACM で SSL 証明書を発行**（リージョンは **us-east-1**）
2. **CloudFront に独自ドメインと証明書を設定**
3. **DNS でドメインを CloudFront に向ける**

---

## 1. SSL 証明書を発行（ACM）

CloudFront 用の証明書は **必ずリージョン「米国東部（バージニア北部）us-east-1」** で作成します。

### 1.1 ACM を開く

1. [AWS Console](https://console.aws.amazon.com/) にログイン
2. 右上のリージョンを **「米国東部（バージニア北部）us-east-1」** に変更
3. 検索で **「Certificate Manager」** または **「ACM」** を開く
4. **「証明書をリクエスト」** をクリック

### 1.2 証明書の種類

- **「パブリック証明書」** を選択 → **「次へ」**

### 1.3 ドメイン名

- **「ドメイン名を追加」** で以下を追加：
  - `bashotori.com`
  - `www.bashotori.com`（www も使う場合）
- **検証方法**: **「DNS 検証」** を選択 → **「次へ」**

### 1.4 タグ・確認

- タグは任意 → **「次へ」** → **「確認してリクエスト」**

### 1.5 DNS で検証

1. 証明書一覧で、作成した証明書の **「ドメインの状態」** が **「保留中の検証」** になっていることを確認
2. 証明書をクリック → **「DNS 設定における CNAME」** を開く
3. 表示された **名前** と **値** をメモする（例: `_xxxxx.bashotori.com` と `_yyyyy.acm-validations.aws.`）
4. **bashotori.com の DNS 管理画面**（お名前.com・Route 53・Cloudflare など）を開く
5. **CNAME レコード** を追加：
   - **名前（ホスト）**: ACM に表示された「名前」のうち、`_xxxxx.bashotori.com` の **`_xxxxx` の部分だけ**（ドメイン名は多くのサービスで自動補完）
   - **値（向き先）**: ACM に表示された「値」をそのまま入力
6. **www** 用の証明書もリクエストした場合は、同様にもう一組の CNAME を追加
7. 数分〜最大 30 分ほどで **「発行済み」** になるまで待つ

---

## 2. CloudFront に独自ドメインと証明書を設定

### 2.1 ディストリビューションを編集

1. リージョンを **東京（ap-northeast-1）** など、普段使っているリージョンに戻してよい
2. [CloudFront Console](https://console.aws.amazon.com/cloudfront/) を開く
3. BASHOTORI 用の **ディストリビューション** を選択
4. **「一般」** タブ → **「編集」** をクリック

### 2.2 代替ドメイン名（CNAME）と証明書

- **「代替ドメイン名（CNAME）」**:
  - `bashotori.com` を追加
  - 必要なら `www.bashotori.com` も追加（1 行に 1 つ）
- **「カスタム SSL 証明書」**:
  - **「証明書をリクエスト」** ではなく、**「証明書を選択」** で、手順 1 で **us-east-1** に作成した証明書を選択
- **「デフォルトのルートオブジェクト」**: 既存のまま（例: `index.html`）でOK
- **「保存」** をクリック

### 2.3 CloudFront のドメイン名をメモ

- 同じディストリビューションの **「一般」** タブに、**「ディストリビューションのドメイン名」** がある（例: `d1234abcd.cloudfront.net`）
- 次の手順で DNS を向ける先として使うので、メモしておく

---

## 3. DNS で bashotori.com を CloudFront に向ける

ドメインの管理場所に応じて、**A** または **CNAME** で CloudFront を指します。

### パターン A: Route 53 でドメインを管理している場合

1. [Route 53 Console](https://console.aws.amazon.com/route53/) → **「ホストゾーン」** → **bashotori.com** を選択
2. **「レコードを作成」**
3. **ルート（bashotori.com）用**:
   - **レコード名**: 空欄のまま（または `@`）
   - **レコードタイプ**: **A**
   - **エイリアス**: **オン**
   - **トラフィックのルーティング先**: **「Alias to CloudFront distribution」** を選択
   - **ディストリビューション**: 上で編集した CloudFront を選択
   - **「レコードを作成」**
4. **www 用**（使う場合）:
   - **レコード名**: `www`
   - **レコードタイプ**: **A**
   - **エイリアス**: **オン**
   - **トラフィックのルーティング先**: **「Alias to CloudFront distribution」** → 同じ CloudFront を選択
   - **「レコードを作成」**

### パターン B: お名前.com・Cloudflare・その他で管理している場合

**ルート（bashotori.com）の場合**

- 多くのレジストラでは **apex（ルート）に CNAME は使えない** ため、次のいずれかになります。
  - **ALIAS / ANAME レコード** が使える場合:  
    **名前** `@`（または空）、**向き先** に CloudFront のドメイン名（例: `d1234abcd.cloudfront.net`）を指定
  - **CNAME フラットニング** が使える場合:  
    ルートに CNAME で `d1234abcd.cloudfront.net` を指定
  - 上記が使えない場合:  
    **A レコード** で CloudFront の IP を直接指定する方法は推奨されません（IP が変わるため）。  
    → Route 53 にホストゾーンだけ作成し、ネームサーバーをお名前.com 側で Route 53 に変更する運用が確実です。

**www.bashotori.com の場合**

- **CNAME レコード** を 1 本作成:
  - **名前（ホスト）**: `www`
  - **値（向き先）**: CloudFront のドメイン名（例: `d1234abcd.cloudfront.net`）
  - **TTL**: 300 など

---

## 4. 動作確認

1. DNS の反映を待つ（数分〜最大 48 時間、多くの場合は数分〜1 時間）
2. ブラウザで **https://bashotori.com** にアクセス
3. 証明書エラーが出ず、アプリが表示されれば完了です。

---

## トラブルシューティング

| 現象 | 確認すること |
|------|----------------|
| 証明書が「保留中の検証」のまま | DNS に CNAME を正しく追加したか、名前・値を ACM の表示どおりか確認 |
| 「証明書が見つからない」 | ACM の証明書が **us-east-1** で作成されているか確認 |
| アクセスできない | DNS の向き先が CloudFront のドメイン名になっているか、CloudFront の「代替ドメイン名」に bashotori.com を追加したか確認 |
| 証明書エラー | ブラウザでアクセスしているドメイン名が、CloudFront の「代替ドメイン名」と ACM 証明書のドメインに含まれているか確認 |

---

## 参考

- [AWS_DEPLOY.md](./AWS_DEPLOY.md) の「8. カスタムドメインの設定」
- [CloudFront のカスタムドメイン](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html)
- [ACM 証明書（us-east-1 必須）](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html)
