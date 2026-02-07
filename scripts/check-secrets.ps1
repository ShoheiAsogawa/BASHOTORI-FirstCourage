# Check for secrets/keys in repo. Run: .\scripts\check-secrets.ps1
# ASCII only to avoid PowerShell encoding issues.

Write-Host "=== Checking for keys/secrets ===" -ForegroundColor Cyan
Write-Host ""

$patterns = @(
    'sb_secret_[A-Za-z0-9_-]{20,}',
    'eyJ[A-Za-z0-9_-]{50,}',
    'AIzaSy[A-Za-z0-9_-]{30,}',
    'https://[a-z0-9]+\.supabase\.co',
    'sk-[A-Za-z0-9]{20,}',
    'AKIA[A-Z0-9]{16}'
)

$found = $false
foreach ($p in $patterns) {
    $files = Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch '\\.git\\|\\node_modules\\|\\dist\\' } |
        ForEach-Object {
            $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -and $content -match $p) { $_.FullName }
        }
    if ($files) {
        $found = $true
        Write-Host "Pattern: $p" -ForegroundColor Yellow
        $files | ForEach-Object { Write-Host "  $_" }
        Write-Host ""
    }
}

if (-not $found) {
    Write-Host "No key-like strings found." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Checking .env in Git history ===" -ForegroundColor Cyan
$envInHistory = git log -p --all -S "VITE_SUPABASE" -- "*.env" ".env" 2>$null
if ($envInHistory) {
    Write-Host ".env may exist in history. Check:" -ForegroundColor Red
    git log --oneline --all -- "*.env" ".env" 2>$null
} else {
    Write-Host ".env not found in history." -ForegroundColor Green
}

Write-Host ""
Write-Host "Done. Edit any listed files and replace real keys with placeholders." -ForegroundColor Gray
