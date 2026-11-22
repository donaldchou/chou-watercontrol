# 上傳到 ll3（FTP www.ll3.com.tw:2222，純 FTP）：
#   -Db  ：data-export\watercontrol.mdb → /database/watercontrol.mdb（帳號 ll3_db，根目錄就是 /database）
#   -Asp ：ll3\platform\chou-watercontrol\*.asp → /platform/chou-watercontrol/（帳號 ll3_admin，根目錄＝網站根目錄）
# 用法：$env:FTP_PW='密碼'; powershell -File scripts\upload-ll3.ps1 -Asp
# 線上已經有同名檔案時：先下載備份到 data-export\backup\，沒加 -Force 就不覆蓋
param([switch]$Db, [switch]$Asp, [switch]$Force)
$ErrorActionPreference = 'Stop'
$pw = $env:FTP_PW
if (-not $pw) { throw '請先設定 $env:FTP_PW' }
$root = Split-Path -Parent $PSScriptRoot
$base = 'ftp://www.ll3.com.tw:2222'
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'

function Send-File([string]$user, [string]$local, [string]$remoteDir, [string]$name) {
  $cred = "${user}:$pw"
  $list = & curl.exe -s -S --connect-timeout 20 --ftp-pasv -l -u $cred "$base$remoteDir/"
  $exists = $LASTEXITCODE -eq 0 -and ($list -contains $name)
  $url = "$base$remoteDir/$name"
  if ($exists) {
    $bk = Join-Path $root "data-export\backup\${stamp}_$name"
    New-Item -ItemType Directory -Force (Split-Path $bk) | Out-Null
    & curl.exe -s -S --ftp-pasv -u $cred -o $bk $url
    Write-Host "線上已有 $remoteDir/$name，已備份到 $bk"
    if (-not $Force) { Write-Host '  沒有加 -Force，不覆蓋。'; return }
  }
  & curl.exe -s -S --ftp-pasv --ftp-create-dirs -u $cred -T $local $url
  if ($LASTEXITCODE -ne 0) { throw "上傳失敗：$name（curl $LASTEXITCODE）" }
  $check = Join-Path $env:TEMP "ll3_check_$name"
  & curl.exe -s -S --ftp-pasv -u $cred -o $check $url
  $same = (Get-FileHash $check).Hash -eq (Get-FileHash $local).Hash
  Remove-Item $check -Force
  Write-Host ("上傳 {0}/{1}：{2}" -f $remoteDir, $name, $(if ($same) { '下載比對一致' } else { '比對不一致！' }))
  if (-not $same) { throw "比對不一致：$name" }
}

if ($Db) {
  $mdb = Join-Path $root 'data-export\watercontrol.mdb'
  if (-not (Test-Path $mdb)) { throw "找不到 $mdb，請先執行 build-mdb.ps1" }
  Send-File 'll3_db' $mdb '' 'watercontrol.mdb'
}
if ($Asp) {
  foreach ($f in 'config.asp', 'admin_api.asp') {
    $local = Join-Path $root "ll3\platform\chou-watercontrol\$f"
    if (-not (Test-Path $local)) { throw "找不到 $local（config.asp 從 config.sample.asp 複製並填金鑰）" }
    Send-File 'll3_admin' $local '/platform/chou-watercontrol' $f
  }
}
if (-not $Db -and -not $Asp) { Write-Host '請加 -Db 或 -Asp' }
