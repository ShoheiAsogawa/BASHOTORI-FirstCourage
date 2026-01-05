# BASHOTORI AWSデプロイスクリプト
# 使用方法: .\scripts\deploy.ps1

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("frontend", "lambda", "all")]
    [string]$Target = "all",
    
    [Parameter(Mandatory=$false)]
    [string]$S3Bucket = "bashotori-app",
    
    [Parameter(Mandatory=$false)]
    [string]$LambdaFunctionName = "bashotori-gemini",
    
    [Parameter(Mandatory=$false)]
    [string]$CloudFrontDistributionId = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "ap-northeast-1"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 BASHOTORI AWSデプロイスクリプト" -ForegroundColor Cyan
Write-Host ""

# AWS CLIの確認
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLIがインストールされていません。" -ForegroundColor Red
    Write-Host "   https://aws.amazon.com/cli/ からインストールしてください。" -ForegroundColor Yellow
    exit 1
}

# AWS認証情報の確認
$awsIdentity = aws sts get-caller-identity 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AWS認証情報が設定されていません。" -ForegroundColor Red
    Write-Host "   'aws configure' を実行して設定してください。" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ AWS認証情報: OK" -ForegroundColor Green
Write-Host ""

# フロントエンドのデプロイ
if ($Target -eq "frontend" -or $Target -eq "all") {
    Write-Host "📦 フロントエンドのビルドとデプロイ..." -ForegroundColor Cyan
    
    # 依存関係のインストール
    Write-Host "   依存関係をインストール中..." -ForegroundColor Gray
    npm install
    
    # ビルド
    Write-Host "   ビルド中..." -ForegroundColor Gray
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ビルドに失敗しました。" -ForegroundColor Red
        exit 1
    }
    
    # S3へのアップロード
    Write-Host "   S3バケットにアップロード中..." -ForegroundColor Gray
    aws s3 sync dist/ "s3://$S3Bucket/" --delete --region $Region
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ S3アップロードに失敗しました。" -ForegroundColor Red
        exit 1
    }
    
    # index.htmlを個別にアップロード（キャッシュ無効化）
    Write-Host "   index.htmlをアップロード中（キャッシュ無効化）..." -ForegroundColor Gray
    aws s3 cp dist/index.html "s3://$S3Bucket/index.html" --cache-control "no-cache" --region $Region
    
    Write-Host "✅ フロントエンドのデプロイが完了しました。" -ForegroundColor Green
    
    # CloudFrontキャッシュの無効化
    if ($CloudFrontDistributionId -ne "") {
        Write-Host "   CloudFrontキャッシュを無効化中..." -ForegroundColor Gray
        aws cloudfront create-invalidation `
            --distribution-id $CloudFrontDistributionId `
            --paths "/*" `
            --region $Region
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ CloudFrontキャッシュの無効化が完了しました。" -ForegroundColor Green
        } else {
            Write-Host "⚠️  CloudFrontキャッシュの無効化に失敗しました（続行します）。" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
}

# Lambda関数のデプロイ
if ($Target -eq "lambda" -or $Target -eq "all") {
    Write-Host "⚡ Lambda関数のビルドとデプロイ..." -ForegroundColor Cyan
    
    $lambdaDir = "infrastructure/lambda"
    
    if (-not (Test-Path $lambdaDir)) {
        Write-Host "❌ Lambda関数ディレクトリが見つかりません: $lambdaDir" -ForegroundColor Red
        exit 1
    }
    
    Push-Location $lambdaDir
    
    try {
        # 依存関係のインストール
        Write-Host "   依存関係をインストール中..." -ForegroundColor Gray
        npm install
        
        # ビルド
        Write-Host "   ビルド中..." -ForegroundColor Gray
        npm run build
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Lambda関数のビルドに失敗しました。" -ForegroundColor Red
            exit 1
        }
        
        # ZIPファイルの作成
        Write-Host "   ZIPファイルを作成中..." -ForegroundColor Gray
        if (Test-Path "function.zip") {
            Remove-Item "function.zip" -Force
        }
        Compress-Archive -Path "dist\gemini-handler.js" -DestinationPath "function.zip" -Force
        
        # Lambda関数にアップロード
        Write-Host "   Lambda関数にアップロード中..." -ForegroundColor Gray
        aws lambda update-function-code `
            --function-name $LambdaFunctionName `
            --zip-file "fileb://function.zip" `
            --region $Region
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Lambda関数のデプロイに失敗しました。" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✅ Lambda関数のデプロイが完了しました。" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
    
    Write-Host ""
}

Write-Host "🎉 デプロイが完了しました！" -ForegroundColor Green

