# 監視・ログ設定ガイド

BASHOTORIアプリケーションの本番環境での監視とログ設定について説明します。

## 📊 CloudWatch設定

### 1. Lambda関数のログ確認

1. [AWS Lambda Console](https://console.aws.amazon.com/lambda/)にアクセス
2. `bashotori-gemini` 関数を選択
3. 「モニタリング」タブを開く
4. 「CloudWatch Logsを表示」をクリック

### 2. CloudWatchアラームの作成

#### Lambda関数のエラー率監視

1. [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)にアクセス
2. 「アラーム」→「アラームの作成」をクリック
3. 以下の設定：

   **メトリクスの選択**
   - **メトリクス**: `AWS/Lambda`
   - **メトリクス名**: `Errors`
   - **ディメンション**: `FunctionName = bashotori-gemini`
   - **統計**: `Sum`
   - **期間**: `5分`

   **条件の設定**
   - **しきい値のタイプ**: `静的`
   - **エラーの場合**: `>= 1`（エラーが1件以上）
   - **追加設定**: `連続して発生した場合`

   **通知の設定**
   - **SNSトピック**: 新規作成または既存のトピックを選択
   - **メールアドレス**: 通知を受け取るメールアドレス

4. 「アラームの作成」をクリック

#### Lambda関数の実行時間監視

同様の手順で、以下のアラームも作成：

- **メトリクス**: `Duration`
- **しきい値**: `>= 25000`（25秒以上）
- **目的**: タイムアウトのリスクを早期検知

### 3. CloudWatchダッシュボードの作成

1. CloudWatch Consoleで「ダッシュボード」を開く
2. 「ダッシュボードを作成」をクリック
3. 以下のウィジェットを追加：

   **Lambda関数メトリクス**
   - 呼び出し数（Invocations）
   - エラー数（Errors）
   - 実行時間（Duration）
   - スロットル（Throttles）

   **API Gatewayメトリクス**（使用している場合）
   - リクエスト数（Count）
   - 4xxエラー（4XXError）
   - 5xxエラー（5XXError）
   - レイテンシ（Latency）

## 📝 ログの保持期間設定

### Lambda関数のロググループ

1. [CloudWatch Logs Console](https://console.aws.amazon.com/cloudwatch/home?region=ap-northeast-1#logsV2:log-groups)にアクセス
2. `/aws/lambda/bashotori-gemini` ロググループを選択
3. 「アクション」→「ロググループの保持期間を設定」をクリック
4. 保持期間を選択（推奨: 30日）

### S3アクセスログ

1. S3バケットの「プロパティ」タブを開く
2. 「サーバーアクセスログ記録」を有効化
3. ログを保存する別のS3バケットを指定

## 🔔 SNS通知の設定

### 1. SNSトピックの作成

1. [SNS Console](https://console.aws.amazon.com/sns/)にアクセス
2. 「トピックを作成」をクリック
3. **名前**: `bashotori-alerts`
4. 「トピックを作成」をクリック

### 2. メールサブスクリプションの追加

1. 作成したトピックを選択
2. 「サブスクリプションを作成」をクリック
3. 以下の設定：
   - **プロトコル**: `Email`
   - **エンドポイント**: 通知を受け取るメールアドレス
4. 「サブスクリプションを作成」をクリック
5. メールアドレスに送信された確認メールを承認

## 📈 パフォーマンス監視

### CloudWatch Insights クエリ

Lambda関数のログを分析するためのクエリ例：

```sql
-- エラーの検索
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100

-- 実行時間の分析
fields @timestamp, @duration
| stats avg(@duration), max(@duration), min(@duration) by bin(5m)

-- エラー率の計算
fields @timestamp
| filter @message like /ERROR/
| stats count() as error_count by bin(5m)
```

### 使用方法

1. CloudWatch Logs Consoleでロググループを選択
2. 「ログインサイトで開く」をクリック
3. 「クエリ」タブで上記のクエリを実行

## 🚨 アラートのベストプラクティス

### 推奨アラート設定

1. **エラー率**: 5分間でエラーが3件以上
2. **実行時間**: 平均実行時間が20秒以上
3. **スロットル**: スロットルが1件以上
4. **メモリ使用率**: メモリ使用率が80%以上

### アラートの調整

- 初期設定では感度を高めに設定
- 運用開始後、誤検知を減らすために調整
- ビジネス時間と非ビジネス時間で異なるしきい値を設定（オプション）

## 📊 コスト監視

### AWS Cost Explorer

1. [AWS Cost Management Console](https://console.aws.amazon.com/cost-management/)にアクセス
2. 「Cost Explorer」を開く
3. 以下のフィルターでコストを確認：
   - **サービス**: Lambda, S3, CloudFront, API Gateway
   - **期間**: 過去30日、過去3ヶ月など

### コストアラート

1. 「Budgets」を開く
2. 「予算を作成」をクリック
3. 以下の設定：
   - **予算タイプ**: `コスト予算`
   - **予算額**: 月額予算を設定
   - **アラート**: 予算の80%、100%で通知

## 🔍 トラブルシューティング

### ログが表示されない

- Lambda関数が実行されているか確認
- IAMロールにCloudWatch Logsへの書き込み権限があるか確認

### アラートが発火しない

- SNSトピックのサブスクリプションが承認されているか確認
- アラームのしきい値が適切か確認
- メトリクスの統計期間を確認

### コストが予想以上に高い

- Lambda関数の呼び出し回数を確認
- CloudFrontのデータ転送量を確認
- S3のストレージ使用量を確認

## 📚 参考リンク

- [CloudWatch ドキュメント](https://docs.aws.amazon.com/cloudwatch/)
- [CloudWatch Logs Insights クエリ構文](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)
- [AWS Cost Management](https://docs.aws.amazon.com/cost-management/)

