#!/bin/bash
# BASHOTORI AWSデプロイスクリプト（Linux/macOS用）
# 使用方法: ./scripts/deploy.sh [frontend|lambda|all]

set -e

TARGET="${1:-all}"
S3_BUCKET="${S3_BUCKET:-bashotori-app}"
LAMBDA_FUNCTION_NAME="${LAMBDA_FUNCTION_NAME:-bashotori-gemini}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
REGION="${AWS_REGION:-ap-northeast-1}"

echo "🚀 BASHOTORI AWSデプロイスクリプト"
echo ""

# AWS CLIの確認
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLIがインストールされていません。"
    echo "   https://aws.amazon.com/cli/ からインストールしてください。"
    exit 1
fi

# AWS認証情報の確認
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS認証情報が設定されていません。"
    echo "   'aws configure' を実行して設定してください。"
    exit 1
fi

echo "✅ AWS認証情報: OK"
echo ""

# フロントエンドのデプロイ
if [ "$TARGET" = "frontend" ] || [ "$TARGET" = "all" ]; then
    echo "📦 フロントエンドのビルドとデプロイ..."
    
    # 依存関係のインストール
    echo "   依存関係をインストール中..."
    npm install
    
    # ビルド
    echo "   ビルド中..."
    npm run build
    
    # S3へのアップロード
    echo "   S3バケットにアップロード中..."
    aws s3 sync dist/ "s3://$S3_BUCKET/" --delete --region "$REGION"
    
    # index.htmlを個別にアップロード（キャッシュ無効化）
    echo "   index.htmlをアップロード中（キャッシュ無効化）..."
    aws s3 cp dist/index.html "s3://$S3_BUCKET/index.html" --cache-control "no-cache" --region "$REGION"
    
    echo "✅ フロントエンドのデプロイが完了しました。"
    
    # CloudFrontキャッシュの無効化
    if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        echo "   CloudFrontキャッシュを無効化中..."
        aws cloudfront create-invalidation \
            --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
            --paths "/*" \
            --region "$REGION" || echo "⚠️  CloudFrontキャッシュの無効化に失敗しました（続行します）。"
    fi
    
    echo ""
fi

# Lambda関数のデプロイ
if [ "$TARGET" = "lambda" ] || [ "$TARGET" = "all" ]; then
    echo "⚡ Lambda関数のビルドとデプロイ..."
    
    cd infrastructure/lambda
    
    # 依存関係のインストール
    echo "   依存関係をインストール中..."
    npm install
    
    # ビルド
    echo "   ビルド中..."
    npm run build
    
    # ZIPファイルの作成
    echo "   ZIPファイルを作成中..."
    zip -r function.zip dist/
    
    # Lambda関数にアップロード
    echo "   Lambda関数にアップロード中..."
    aws lambda update-function-code \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --zip-file "fileb://function.zip" \
        --region "$REGION"
    
    echo "✅ Lambda関数のデプロイが完了しました。"
    echo ""
    
    cd ../..
fi

echo "🎉 デプロイが完了しました！"

