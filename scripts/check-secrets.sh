#!/bin/bash
# リポジトリ内でキー・秘密情報が含まれていないか検索するスクリプト
# 使い方: ./scripts/check-secrets.sh または bash scripts/check-secrets.sh

echo "=== キー・秘密情報の検索 ==="
echo ""

# .git と node_modules を除いて検索
search() {
    pattern=$1
    desc=$2
    echo "パターン: $desc"
    grep -r -l -E "$pattern" . 2>/dev/null | grep -v -E '\.git/|node_modules/|dist/' || true
    echo ""
}

search 'sb_secret_[A-Za-z0-9_-]{20,}' 'Supabase service_role key'
search 'eyJ[A-Za-z0-9_-]{50,}' 'JWT形式（anon key など）'
search 'AIzaSy[A-Za-z0-9_-]{30,}' 'Google API key'
search 'https://[a-z0-9]+\.supabase\.co' 'Supabase URL'
search 'sk-[A-Za-z0-9]{20,}' 'sk- 形式のキー'
search 'AKIA[A-Z0-9]{16}' 'AWS Access Key ID'

echo "=== .env が Git 履歴に含まれていないか確認 ==="
if git log -p --all -S "VITE_SUPABASE" -- "*.env" ".env" 2>/dev/null | head -1 | grep -q .; then
    echo ".env または VITE_SUPABASE を含むファイルが履歴に存在する可能性があります。要確認:"
    git log --oneline --all -- "*.env" ".env" 2>/dev/null
else
    echo ".env は履歴に含まれていないようです。"
fi

echo ""
echo "完了。問題があれば該当ファイルを編集してからコミットしてください。"
